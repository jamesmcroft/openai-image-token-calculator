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
    function getResizedImageSize(maxDimension, minSide, height, width) {
      let resizedHeight = height;
      let resizedWidth = width;

      // Only scale down if larger than maxDimension on any side
      if (width > maxDimension || height > maxDimension) {
        const scaleFactor = Math.min(
          maxDimension / width,
          maxDimension / height
        );
        resizedWidth = width * scaleFactor;
        resizedHeight = height * scaleFactor;
      }

      // If the shortest side is greater than minSide, scale to minSide
      if (Math.min(resizedWidth, resizedHeight) > minSide) {
        const scaleFactor = minSide / Math.min(resizedWidth, resizedHeight);
        resizedWidth = resizedWidth * scaleFactor;
        resizedHeight = resizedHeight * scaleFactor;
      }

      resizedHeight = Math.round(resizedHeight);
      resizedWidth = Math.round(resizedWidth);

      return { height: resizedHeight, width: resizedWidth };
    }

    function getImageTileCount(tileSize, height, width) {
      const tilesHigh = Math.ceil(height / tileSize);
      const tilesWide = Math.ceil(width / tileSize);
      return { tilesHigh, tilesWide };
    }

    const { model, images } = get();
    const tokensPerTile = model.tokensPerTile;
    const maxImageDimension = model.maxImageDimension;
    const imageMinSizeLength = model.imageMinSizeLength;
    const tileSizeLength = model.tileSizeLength;
    const baseTokens = model.baseTokens;
    const costPerMillionTokens = model.costPerMillionTokens;

    const imageTileCount = images.flatMap((image) => {
      const imgSize = getResizedImageSize(
        maxImageDimension,
        imageMinSizeLength,
        image.height,
        image.width
      );

      image.resizedHeight = imgSize.height;
      image.resizedWidth = imgSize.width;

      const imageTiles = getImageTileCount(
        tileSizeLength,
        imgSize.height,
        imgSize.width
      );

      image.tilesHigh = imageTiles.tilesHigh;
      image.tilesWide = imageTiles.tilesWide;

      const multiplier = image.multiplier;

      image.totalTiles =
        imageTiles.tilesHigh * imageTiles.tilesWide * multiplier;

      return Array.from({ length: multiplier }, () => imageTiles);
    });

    set(() => ({ images: images }));

    const totalTokens =
      imageTileCount.reduce(
        (acc, tiles) => acc + tiles.tilesHigh * tiles.tilesWide * tokensPerTile,
        0
      ) + baseTokens;

    set(() => ({ totalTokens: totalTokens }));

    const totalCost = (totalTokens / 1000000) * costPerMillionTokens;
    set(() => ({ totalCost: totalCost.toFixed(5) }));
  },
});
