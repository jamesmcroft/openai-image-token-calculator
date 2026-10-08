import { getOriginalDetail } from "./ModelStore";

export const calcStore = (set, get) => ({
  model: "",
  imageDetail: "high",
  calculationError: null,
  images: [],
  imageResults: [],
  totalTokens: null,
  totalCost: null,
  requestsPerDay: 0,

  setModel: (model) => set({
    model,
    imageDetail: get().imageDetail === "original" && model && !getOriginalDetail(model)
      ? "high"
      : get().imageDetail,
    calculationError: null,
  }),
  setImageDetail: (detail) => {
    if (detail !== "high" && detail !== "original") {
      throw new RangeError(`Unsupported image detail: ${detail}`);
    }
    const { model, selectedModels, comparisonMode } = get();
    if (detail === "original" &&
      (comparisonMode
        ? selectedModels.length === 0 || selectedModels.some((item) => !getOriginalDetail(item))
        : !getOriginalDetail(model))) {
      throw new RangeError("Original detail is not available for the selected models");
    }
    set({ imageDetail: detail, calculationError: null });
    if (comparisonMode) get().runComparison();
    else if (model && typeof model === "object") get().runCalculation();
  },

  setRequestsPerDay: (value) => {
    const parsed = Math.trunc(Number(value));
    set({ requestsPerDay: Number.isFinite(parsed) && parsed > 0 ? parsed : 0 });
  },

  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
  clearImages: () => set({ images: [] }),
  updateImage: (index, field, value) => {
    const newImages = [...get().images];
    newImages[index][field] = value;
    set({ images: newImages });
  },
  removeImage: (index) => {
    const newImages = get().images.filter((_, i) => i !== index);
    set({ images: newImages });
  },

  resetCalculation: () => {
    set(() => ({ imageResults: [], totalTokens: null, totalCost: null, calculationError: null }));
  },
  runCalculation: () => {
    const { model, images, imageDetail } = get();
    try {
      const { totalTokens, totalCost, imageResults } = calculateForModel(model, images, imageDetail);
      set(() => ({ imageResults, totalTokens, totalCost, calculationError: null }));
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      set(() => ({
        imageResults: [],
        totalTokens: null,
        totalCost: null,
        calculationError: error.message,
      }));
    }
  },
});

// --- Tile-based tokenization (GPT-4o, GPT-5, o1/o3, etc.) ---

function getResizedImageSize(maxDimension, minSide, height, width) {
  let resizedHeight = height;
  let resizedWidth = width;

  if (width > maxDimension || height > maxDimension) {
    const scaleFactor = Math.min(
      maxDimension / width,
      maxDimension / height
    );
    resizedWidth = width * scaleFactor;
    resizedHeight = height * scaleFactor;
  }

  if (Math.min(resizedWidth, resizedHeight) > minSide) {
    const scaleFactor = minSide / Math.min(resizedWidth, resizedHeight);
    resizedWidth = resizedWidth * scaleFactor;
    resizedHeight = resizedHeight * scaleFactor;
  }

  return {
    height: Math.floor(resizedHeight),
    width: Math.floor(resizedWidth),
  };
}

function calculateTileBased(model, images) {
  const { tokensPerTile, maxImageDimension, imageMinSizeLength, tileSizeLength, baseTokens } = model;

  return images.map((image) => {
    const imgSize = getResizedImageSize(
      maxImageDimension,
      imageMinSizeLength,
      image.height,
      image.width
    );

    const tilesHigh = Math.ceil(imgSize.height / tileSizeLength);
    const tilesWide = Math.ceil(imgSize.width / tileSizeLength);
    const totalTiles = tilesHigh * tilesWide * image.multiplier;
    const imageTokens = imgSize.height > 0 && imgSize.width > 0
      ? (tilesHigh * tilesWide * tokensPerTile + baseTokens) * image.multiplier
      : 0;

    return {
      resizedHeight: imgSize.height,
      resizedWidth: imgSize.width,
      tokenization: {
        type: "tile",
        tilesHigh,
        tilesWide,
        totalTiles,
        tokensPerTile,
        baseTokens,
        imageTokens,
      },
    };
  });
}

// --- Patch-based tokenization (GPT-5.2+, GPT-5.4, o4-mini, etc.) ---
// Source: https://developers.openai.com/api/docs/guides/images-vision#calculating-costs

function getPatchCount(patchSize, height, width) {
  if (width <= 0 || height <= 0) return 0;
  return Math.ceil(width / patchSize) * Math.ceil(height / patchSize);
}

function resizeForPatchBudget(patchSize, patchBudget, height, width) {
  const originalPatches = getPatchCount(patchSize, height, width);
  if (originalPatches <= patchBudget) {
    return { height, width, patches: originalPatches };
  }

  const shrinkFactor = Math.sqrt(
    (patchSize * patchSize * patchBudget) / (width * height)
  );

  const wScaled = width * shrinkFactor / patchSize;
  const hScaled = height * shrinkFactor / patchSize;
  const adjustedShrinkFactor =
    shrinkFactor *
    Math.min(
      Math.floor(wScaled) / wScaled,
      Math.floor(hScaled) / hScaled
    );

  const resizedWidth = Math.max(1, Math.floor(width * adjustedShrinkFactor));
  const resizedHeight = Math.max(1, Math.floor(height * adjustedShrinkFactor));
  const patches = Math.min(
    getPatchCount(patchSize, resizedHeight, resizedWidth),
    patchBudget
  );

  return { height: resizedHeight, width: resizedWidth, patches };
}

function calculatePatchBased(model, images, detail = "high") {
  const originalLimits = detail === "original" ? getOriginalDetail(model) : null;
  if (detail !== "high" && !originalLimits) {
    throw new RangeError(`Original detail is not available for ${model.name}`);
  }
  const { patchSize, tokenMultiplier } = model;
  const maxImageDimension = originalLimits?.maxImageDimension ?? model.maxImageDimension;
  const patchBudget = originalLimits ? originalLimits.patchBudget : model.patchBudget;

  return images.map((image) => {
    let w = image.width;
    let h = image.height;

    if (w <= 0 || h <= 0) {
      return {
        resizedHeight: h,
        resizedWidth: w,
        tokenization: {
          type: "patch",
          patchesWide: 0,
          patchesHigh: 0,
          totalPatches: 0,
          tokenMultiplier,
          imageTokens: 0,
        },
      };
    }

    // Step 1: Scale to fit within maxImageDimension
    if (w > maxImageDimension || h > maxImageDimension) {
      const sf = Math.min(maxImageDimension / w, maxImageDimension / h);
      w = Math.round(w * sf);
      h = Math.round(h * sf);
    }

    // Step 2: Check patch budget and resize if needed
    const result = patchBudget === null
      ? { height: h, width: w, patches: getPatchCount(patchSize, h, w) }
      : resizeForPatchBudget(patchSize, patchBudget, h, w);
    if (result.patches > 30000) {
      throw new RangeError(`${model.name}: ${image.width} x ${image.height} exceeds the 30,000-patch Original detail limit`);
    }

    const patchesWide = Math.ceil(result.width / patchSize);
    const patchesHigh = Math.ceil(result.height / patchSize);
    const totalPatches = result.patches * image.multiplier;
    const imageTokens =
      Math.ceil(result.patches * tokenMultiplier) * image.multiplier;

    return {
      resizedHeight: result.height,
      resizedWidth: result.width,
      tokenization: {
        type: "patch",
        patchesWide,
        patchesHigh,
        totalPatches,
        tokenMultiplier,
        imageTokens,
      },
    };
  });
}

function calculateForModel(model, images, detail = "high") {
  if (detail !== "high" && detail !== "original") {
    throw new RangeError(`Unsupported image detail: ${detail}`);
  }
  const tokenizationType = model.tokenizationType ?? "tile";
  if (detail === "original" && !getOriginalDetail(model)) {
    throw new RangeError(`Original detail is not available for ${model.name}`);
  }

  const imageResults =
    tokenizationType === "patch"
      ? calculatePatchBased(model, images, detail)
      : calculateTileBased(model, images);

  const totalTokens = imageResults.reduce(
    (acc, r) => acc + (r.tokenization?.imageTokens ?? 0),
    0
  );

  const totalCost = ((totalTokens / 1000000) * model.costPerMillionTokens).toFixed(5);

  return { totalTokens, totalCost, imageResults };
}

export {
  getResizedImageSize,
  calculateTileBased,
  getPatchCount,
  resizeForPatchBudget,
  calculatePatchBased,
  calculateForModel,
};
