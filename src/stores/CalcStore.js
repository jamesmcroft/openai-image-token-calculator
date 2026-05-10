export const calcStore = (set, get) => ({
  model: "",
  images: [],
  totalTokens: null,
  totalCost: null,

  setModel: (model) => set({ model }),

  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
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
    set(() => ({ totalTokens: null, totalCost: null }));
  },
  runCalculation: () => {
    const { model, images } = get();
    const tokenizationType = model.tokenizationType ?? "tile";

    if (tokenizationType === "patch") {
      calculatePatchBased(model, images);
    } else {
      calculateTileBased(model, images);
    }

    set(() => ({ images: images }));

    const totalTokens = images.reduce(
      (acc, img) => acc + (img.tokenization?.imageTokens ?? 0),
      0
    );

    set(() => ({ totalTokens }));

    const totalCost = (totalTokens / 1000000) * model.costPerMillionTokens;
    set(() => ({ totalCost: totalCost.toFixed(5) }));
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
    height: Math.round(resizedHeight),
    width: Math.round(resizedWidth),
  };
}

function calculateTileBased(model, images) {
  const { tokensPerTile, maxImageDimension, imageMinSizeLength, tileSizeLength, baseTokens } = model;

  images.forEach((image) => {
    const imgSize = getResizedImageSize(
      maxImageDimension,
      imageMinSizeLength,
      image.height,
      image.width
    );

    const tilesHigh = Math.ceil(imgSize.height / tileSizeLength);
    const tilesWide = Math.ceil(imgSize.width / tileSizeLength);
    const totalTiles = tilesHigh * tilesWide * image.multiplier;
    const imageTokens = tilesHigh * tilesWide * tokensPerTile * image.multiplier + baseTokens;

    image.resizedHeight = imgSize.height;
    image.resizedWidth = imgSize.width;
    image.tokenization = {
      type: "tile",
      tilesHigh,
      tilesWide,
      totalTiles,
      tokensPerTile,
      baseTokens,
      imageTokens,
    };
  });
}

// --- Patch-based tokenization (GPT-5.2+, GPT-5.4, o4-mini, etc.) ---
// Source: https://developers.openai.com/api/docs/guides/vision#patch-based-image-tokenization

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

function calculatePatchBased(model, images) {
  const { patchSize, patchBudget, tokenMultiplier, maxImageDimension } = model;

  images.forEach((image) => {
    let w = image.width;
    let h = image.height;

    if (w <= 0 || h <= 0) {
      image.resizedHeight = h;
      image.resizedWidth = w;
      image.tokenization = {
        type: "patch",
        patchesWide: 0,
        patchesHigh: 0,
        totalPatches: 0,
        tokenMultiplier,
        imageTokens: 0,
      };
      return;
    }

    // Step 1: Scale to fit within maxImageDimension
    if (w > maxImageDimension || h > maxImageDimension) {
      const sf = Math.min(maxImageDimension / w, maxImageDimension / h);
      w = Math.round(w * sf);
      h = Math.round(h * sf);
    }

    // Step 2: Check patch budget and resize if needed
    const result = resizeForPatchBudget(patchSize, patchBudget, h, w);

    const patchesWide = Math.ceil(result.width / patchSize);
    const patchesHigh = Math.ceil(result.height / patchSize);
    const totalPatches = result.patches * image.multiplier;
    const imageTokens =
      Math.ceil(result.patches * tokenMultiplier) * image.multiplier;

    image.resizedHeight = result.height;
    image.resizedWidth = result.width;
    image.tokenization = {
      type: "patch",
      patchesWide,
      patchesHigh,
      totalPatches,
      tokenMultiplier,
      imageTokens,
    };
  });
}

export {
  getResizedImageSize,
  calculateTileBased,
  getPatchCount,
  resizeForPatchBudget,
  calculatePatchBased,
};
