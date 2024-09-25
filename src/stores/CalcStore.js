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
    function getResizedImageSize(minSize, height, width) {
      let resizedHeight = height;
      let resizedWidth = width;

      if (height > width) {
        resizedHeight = minSize;
      } else {
        resizedHeight = (height / width) * minSize;
      }

      if (height > width) {
        resizedWidth = (width / height) * minSize;
      } else {
        resizedWidth = minSize;
      }

      return { height: resizedHeight, width: resizedWidth };
    }

    function getImageTileCount(tileSize, height, width) {
      const tilesHigh = Math.ceil(height / tileSize);
      const tilesWide = Math.ceil(width / tileSize);
      return { tilesHigh, tilesWide };
    }

    const { model, images } = get();
    const tokensPerTile = model.tokensPerTile;
    const imageMinSizeLength = model.imageMinSizeLength;
    const tileSizeLength = model.tileSizeLength;
    const additionalBuffer = model.additionalBuffer;
    const costPerThousandTokens = model.costPerThousandTokens;

    const imageTileCount = images.flatMap((image) => {
      const imgSize = getResizedImageSize(
        imageMinSizeLength,
        image.height,
        image.width
      );
      const imageTiles = getImageTileCount(
        tileSizeLength,
        imgSize.height,
        imgSize.width
      );
      const multiplier = image.multiplier;
      return Array.from({ length: multiplier }, () => imageTiles);
    });

    const totalTokens =
      imageTileCount.reduce(
        (acc, tiles) => acc + tiles.tilesHigh * tiles.tilesWide * tokensPerTile,
        0
      ) + additionalBuffer;

    set(() => ({ totalTokens: totalTokens }));

    const totalCost = (totalTokens / 1000) * costPerThousandTokens;
    set(() => ({ totalCost: totalCost.toFixed(2) }));
  },
});
