export const modelStore = (set, get) => ({
  models: [
    {
      name: "GPT-4o",
      tokensPerTile: 170,
      imageMinSizeLength: 768,
      tileSizeLength: 512,
      additionalBuffer: 85,
      costPerThousandTokens: 0.005,
    },
    {
      name: "GPT-4o mini",
      tokensPerTile: 5667,
      imageMinSizeLength: 768,
      tileSizeLength: 512,
      additionalBuffer: 2833,
      costPerThousandTokens: 0.000165,
    },
  ],
});
