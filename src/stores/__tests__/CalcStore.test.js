import { describe, it, expect } from "vitest";
import {
  getResizedImageSize,
  calculateTileBased,
  getPatchCount,
  resizeForPatchBudget,
  calculatePatchBased,
  calculateForModel,
} from "../CalcStore";

// ---------------------------------------------------------------------------
// getResizedImageSize
// ---------------------------------------------------------------------------

describe("getResizedImageSize", () => {
  it("does not resize when within max dimension and min side", () => {
    const result = getResizedImageSize(2048, 768, 800, 600);
    expect(result).toEqual({ height: 800, width: 600 });
  });

  it("scales down when exceeding max dimension", () => {
    const result = getResizedImageSize(2048, 768, 4096, 2048);
    expect(result.height).toBeLessThanOrEqual(2048);
    expect(result.width).toBeLessThanOrEqual(2048);
  });

  it("scales shortest side down to min side when both sides exceed it", () => {
    const result = getResizedImageSize(2048, 768, 1024, 1024);
    expect(Math.min(result.height, result.width)).toBe(768);
  });

  it("preserves aspect ratio", () => {
    const result = getResizedImageSize(2048, 768, 3000, 1500);
    const originalRatio = 3000 / 1500;
    const resultRatio = result.height / result.width;
    expect(resultRatio).toBeCloseTo(originalRatio, 1);
  });

  it("handles square images", () => {
    const result = getResizedImageSize(2048, 768, 2000, 2000);
    expect(result.height).toBe(result.width);
    expect(result.height).toBe(768);
  });
});

// ---------------------------------------------------------------------------
// calculateTileBased
// ---------------------------------------------------------------------------

describe("calculateTileBased", () => {
  const gpt5Model = {
    tokensPerTile: 140,
    maxImageDimension: 2048,
    imageMinSizeLength: 768,
    tileSizeLength: 512,
    baseTokens: 70,
    costPerMillionTokens: 1.25,
  };

  it("calculates tokens for a standard image", () => {
    const images = [{ height: 1024, width: 1024, multiplier: 1 }];
    const results = calculateTileBased(gpt5Model, images);

    expect(results[0].tokenization.type).toBe("tile");
    expect(results[0].resizedHeight).toBe(768);
    expect(results[0].resizedWidth).toBe(768);
    expect(results[0].tokenization.tilesHigh).toBe(2);
    expect(results[0].tokenization.tilesWide).toBe(2);
    expect(results[0].tokenization.totalTiles).toBe(4);
    // 4 tiles * 140 + 70 base = 630
    expect(results[0].tokenization.imageTokens).toBe(630);
  });

  it("handles multiplier correctly", () => {
    const images = [{ height: 1024, width: 1024, multiplier: 3 }];
    const results = calculateTileBased(gpt5Model, images);

    expect(results[0].tokenization.totalTiles).toBe(12);
    // 4 tiles * 140 * 3 + 70 = 1750
    expect(results[0].tokenization.imageTokens).toBe(1750);
  });

  it("handles large image that needs max dimension scaling", () => {
    const images = [{ height: 4096, width: 3072, multiplier: 1 }];
    const results = calculateTileBased(gpt5Model, images);

    expect(results[0].resizedHeight).toBeLessThanOrEqual(2048);
    expect(results[0].resizedWidth).toBeLessThanOrEqual(2048);
    expect(results[0].tokenization.imageTokens).toBeGreaterThan(70);
  });

  it("uses GPT-4o-mini token values correctly", () => {
    const miniModel = {
      tokensPerTile: 5667,
      maxImageDimension: 2048,
      imageMinSizeLength: 768,
      tileSizeLength: 512,
      baseTokens: 2833,
      costPerMillionTokens: 0.15,
    };
    const images = [{ height: 768, width: 768, multiplier: 1 }];
    const results = calculateTileBased(miniModel, images);

    // 2x2 tiles * 5667 + 2833 = 25501
    expect(results[0].tokenization.imageTokens).toBe(25501);
  });

  it("does not mutate input images", () => {
    const images = [{ height: 1024, width: 1024, multiplier: 1 }];
    const original = JSON.parse(JSON.stringify(images));
    calculateTileBased(gpt5Model, images);
    expect(images).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// getPatchCount
// ---------------------------------------------------------------------------

describe("getPatchCount", () => {
  it("counts patches for exact multiples", () => {
    expect(getPatchCount(32, 64, 64)).toBe(4);
    expect(getPatchCount(32, 32, 32)).toBe(1);
    expect(getPatchCount(32, 128, 128)).toBe(16);
  });

  it("rounds up for non-exact sizes", () => {
    expect(getPatchCount(32, 33, 33)).toBe(4);
    expect(getPatchCount(32, 31, 31)).toBe(1);
  });

  it("returns 0 for zero or negative dimensions", () => {
    expect(getPatchCount(32, 0, 100)).toBe(0);
    expect(getPatchCount(32, 100, 0)).toBe(0);
    expect(getPatchCount(32, -1, 100)).toBe(0);
  });

  it("handles 1024x1024 correctly", () => {
    // ceil(1024/32) * ceil(1024/32) = 32 * 32 = 1024
    expect(getPatchCount(32, 1024, 1024)).toBe(1024);
  });

  it("handles 1800x2400 correctly", () => {
    // ceil(1800/32) * ceil(2400/32) = 57 * 75 = 4275
    expect(getPatchCount(32, 2400, 1800)).toBe(4275);
  });
});

// ---------------------------------------------------------------------------
// resizeForPatchBudget
// ---------------------------------------------------------------------------

describe("resizeForPatchBudget", () => {
  it("does not resize when within budget", () => {
    const result = resizeForPatchBudget(32, 1536, 1024, 1024);
    expect(result.patches).toBe(1024);
    expect(result.height).toBe(1024);
    expect(result.width).toBe(1024);
  });

  it("resizes when exceeding budget", () => {
    // 1800x2400 = 4275 patches, exceeds 1536 budget
    const result = resizeForPatchBudget(32, 1536, 2400, 1800);
    expect(result.patches).toBeLessThanOrEqual(1536);
    expect(result.height).toBeLessThan(2400);
    expect(result.width).toBeLessThan(1800);
  });

  it("matches OpenAI docs example for 1800x2400 with 1536 budget", () => {
    // Per OpenAI docs: resized to 1056x1408, patches = 33*44 = 1452
    const result = resizeForPatchBudget(32, 1536, 2400, 1800);
    expect(result.patches).toBe(1452);
    expect(result.width).toBe(1056);
    expect(result.height).toBe(1408);
  });

  it("handles exact budget boundary", () => {
    // 1248x1248 = 39*39 = 1521 patches, within 1536
    const result = resizeForPatchBudget(32, 1536, 1248, 1248);
    expect(result.patches).toBe(1521);
    expect(result.height).toBe(1248);
    expect(result.width).toBe(1248);
  });

  it("clamps minimum dimensions to 1x1", () => {
    const result = resizeForPatchBudget(32, 1, 10000, 10000);
    expect(result.height).toBeGreaterThanOrEqual(1);
    expect(result.width).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// calculatePatchBased
// ---------------------------------------------------------------------------

describe("calculatePatchBased", () => {
  const gpt54Model = {
    tokenizationType: "patch",
    patchSize: 32,
    patchBudget: 2500,
    tokenMultiplier: 1.0,
    maxImageDimension: 2048,
    costPerMillionTokens: 2.5,
  };

  const gpt54MiniModel = {
    tokenizationType: "patch",
    patchSize: 32,
    patchBudget: 1536,
    tokenMultiplier: 1.62,
    maxImageDimension: 2048,
    costPerMillionTokens: 0.75,
  };

  it("calculates tokens for a standard image within budget", () => {
    const images = [{ height: 1024, width: 1024, multiplier: 1 }];
    const results = calculatePatchBased(gpt54Model, images);

    expect(results[0].tokenization.type).toBe("patch");
    // 1024 patches * 1.0 multiplier = 1024 tokens
    expect(results[0].tokenization.imageTokens).toBe(1024);
    expect(results[0].tokenization.totalPatches).toBe(1024);
  });

  it("applies token multiplier for mini models", () => {
    const images = [{ height: 1024, width: 1024, multiplier: 1 }];
    const results = calculatePatchBased(gpt54MiniModel, images);

    // 1024 patches * 1.62 = 1658.88, ceil = 1659
    expect(results[0].tokenization.imageTokens).toBe(1659);
  });

  it("handles multiplier (quantity) correctly", () => {
    const images = [{ height: 1024, width: 1024, multiplier: 3 }];
    const results = calculatePatchBased(gpt54MiniModel, images);

    expect(results[0].tokenization.totalPatches).toBe(1024 * 3);
    // ceil(1024 * 1.62) * 3 = 1659 * 3 = 4977
    expect(results[0].tokenization.imageTokens).toBe(4977);
  });

  it("scales down oversized images to max dimension first", () => {
    const images = [{ height: 4096, width: 4096, multiplier: 1 }];
    const results = calculatePatchBased(gpt54Model, images);

    expect(results[0].resizedHeight).toBeLessThanOrEqual(2048);
    expect(results[0].resizedWidth).toBeLessThanOrEqual(2048);
  });

  it("returns zero tokens for 0x0 image", () => {
    const images = [{ height: 0, width: 0, multiplier: 1 }];
    const results = calculatePatchBased(gpt54Model, images);

    expect(results[0].tokenization.imageTokens).toBe(0);
    expect(results[0].tokenization.totalPatches).toBe(0);
  });

  it("handles very small image (1x1)", () => {
    const images = [{ height: 1, width: 1, multiplier: 1 }];
    const results = calculatePatchBased(gpt54Model, images);

    // 1 patch * 1.0 = 1 token
    expect(results[0].tokenization.imageTokens).toBe(1);
    expect(results[0].tokenization.patchesHigh).toBe(1);
    expect(results[0].tokenization.patchesWide).toBe(1);
  });

  it("handles wide aspect ratio", () => {
    const images = [{ height: 100, width: 2000, multiplier: 1 }];
    const results = calculatePatchBased(gpt54Model, images);

    expect(results[0].tokenization.imageTokens).toBeGreaterThan(0);
    expect(results[0].resizedWidth).toBeLessThanOrEqual(2048);
  });

  it("handles tall aspect ratio", () => {
    const images = [{ height: 2000, width: 100, multiplier: 1 }];
    const results = calculatePatchBased(gpt54Model, images);

    expect(results[0].tokenization.imageTokens).toBeGreaterThan(0);
    expect(results[0].resizedHeight).toBeLessThanOrEqual(2048);
  });

  it("does not mutate input images", () => {
    const images = [{ height: 1024, width: 1024, multiplier: 1 }];
    const original = JSON.parse(JSON.stringify(images));
    calculatePatchBased(gpt54Model, images);
    expect(images).toEqual(original);
  });
});

// ---------------------------------------------------------------------------
// calculateForModel
// ---------------------------------------------------------------------------

describe("calculateForModel", () => {
  const tileModel = {
    tokensPerTile: 140,
    maxImageDimension: 2048,
    imageMinSizeLength: 768,
    tileSizeLength: 512,
    baseTokens: 70,
    costPerMillionTokens: 1.25,
  };

  const patchModel = {
    tokenizationType: "patch",
    patchSize: 32,
    patchBudget: 2500,
    tokenMultiplier: 1.0,
    maxImageDimension: 2048,
    costPerMillionTokens: 2.5,
  };

  it("returns totalTokens, totalCost, and imageResults for tile model", () => {
    const images = [{ height: 1024, width: 1024, multiplier: 1 }];
    const result = calculateForModel(tileModel, images);

    expect(result).toHaveProperty("totalTokens");
    expect(result).toHaveProperty("totalCost");
    expect(result).toHaveProperty("imageResults");
    expect(result.imageResults).toHaveLength(1);
    expect(result.totalTokens).toBe(630);
    expect(result.imageResults[0].tokenization.type).toBe("tile");
  });

  it("returns totalTokens, totalCost, and imageResults for patch model", () => {
    const images = [{ height: 1024, width: 1024, multiplier: 1 }];
    const result = calculateForModel(patchModel, images);

    expect(result.imageResults).toHaveLength(1);
    expect(result.totalTokens).toBe(1024);
    expect(result.imageResults[0].tokenization.type).toBe("patch");
  });

  it("does not mutate input images", () => {
    const images = [
      { height: 1024, width: 1024, multiplier: 1 },
      { height: 2000, width: 100, multiplier: 2 },
    ];
    const original = JSON.parse(JSON.stringify(images));
    calculateForModel(tileModel, images);
    expect(images).toEqual(original);
  });
});
