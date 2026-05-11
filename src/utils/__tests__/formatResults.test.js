import { describe, it, expect } from "vitest";
import { formatResultsAsText } from "../formatResults";

const patchModel = {
  name: "GPT-5.4 (Global)",
  tokenizationType: "patch",
  patchSize: 32,
  patchBudget: 2500,
  tokenMultiplier: 1.0,
  maxImageDimension: 2048,
  costPerMillionTokens: 2.5,
};

const tileModel = {
  name: "GPT-4o (2024-11-20 - Global)",
  tokensPerTile: 170,
  maxImageDimension: 2048,
  imageMinSizeLength: 768,
  tileSizeLength: 512,
  baseTokens: 85,
  costPerMillionTokens: 2.5,
};

describe("formatResultsAsText", () => {
  it("formats patch-based results correctly", () => {
    const text = formatResultsAsText({
      model: patchModel,
      images: [
        { width: 1024, height: 768, multiplier: 2 },
        { width: 1920, height: 1080, multiplier: 1 },
      ],
      imageResults: [
        {
          resizedWidth: 1024,
          resizedHeight: 768,
          tokenization: {
            type: "patch",
            patchesWide: 32,
            patchesHigh: 24,
            totalPatches: 1536,
            tokenMultiplier: 1.0,
            imageTokens: 1536,
          },
        },
        {
          resizedWidth: 1920,
          resizedHeight: 1080,
          tokenization: {
            type: "patch",
            patchesWide: 60,
            patchesHigh: 34,
            totalPatches: 2040,
            tokenMultiplier: 1.0,
            imageTokens: 2040,
          },
        },
      ],
      totalTokens: 3576,
      totalCost: "0.00894",
    });

    expect(text).toContain("Azure OpenAI Image Token Calculator");
    expect(text).toContain("GPT-5.4 (Global)");
    expect(text).toContain("[Patch-based]");
    expect(text).toContain("Image 1:");
    expect(text).toContain("1024x768, Qty 2");
    expect(text).toContain("patches");
    expect(text).toContain("Image 2:");
    expect(text).toContain("1920x1080, Qty 1");
    expect(text).toContain("Total tokens:");
    expect(text).toContain("Estimated cost:");
    expect(text).toContain("$2.5/1M tokens");
  });

  it("formats tile-based results correctly", () => {
    const text = formatResultsAsText({
      model: tileModel,
      images: [{ width: 1024, height: 768, multiplier: 1 }],
      imageResults: [
        {
          resizedWidth: 1024,
          resizedHeight: 768,
          tokenization: {
            type: "tile",
            tilesHigh: 2,
            tilesWide: 2,
            totalTiles: 4,
            tokensPerTile: 170,
            baseTokens: 85,
            imageTokens: 765,
          },
        },
      ],
      totalTokens: 765,
      totalCost: "0.00191",
    });

    expect(text).toContain("[Tile-based]");
    expect(text).toContain("GPT-4o (2024-11-20 - Global)");
    expect(text).toContain("tiles");
    expect(text).not.toContain("patches");
    expect(text).toContain("765 tokens");
  });

  it("includes retirement date when present", () => {
    const model = { ...tileModel, retirementDate: "Oct 2026" };
    const text = formatResultsAsText({
      model,
      images: [{ width: 100, height: 100, multiplier: 1 }],
      imageResults: [
        {
          resizedWidth: 100,
          resizedHeight: 100,
          tokenization: {
            type: "tile",
            tilesHigh: 1,
            tilesWide: 1,
            totalTiles: 1,
            tokensPerTile: 170,
            baseTokens: 85,
            imageTokens: 255,
          },
        },
      ],
      totalTokens: 255,
      totalCost: "0.00064",
    });

    expect(text).toContain("Note: This model retires Oct 2026");
  });

  it("includes model comment when present", () => {
    const model = {
      ...tileModel,
      comment: "This calculator only provides input tokens.",
    };
    const text = formatResultsAsText({
      model,
      images: [{ width: 100, height: 100, multiplier: 1 }],
      imageResults: [
        {
          resizedWidth: 100,
          resizedHeight: 100,
          tokenization: {
            type: "tile",
            tilesHigh: 1,
            tilesWide: 1,
            totalTiles: 1,
            tokensPerTile: 170,
            baseTokens: 85,
            imageTokens: 255,
          },
        },
      ],
      totalTokens: 255,
      totalCost: "0.00064",
    });

    expect(text).toContain(
      "Note: This calculator only provides input tokens.",
    );
  });

  it("includes both retirement date and comment", () => {
    const model = {
      ...tileModel,
      retirementDate: "Jul 2026",
      comment: "Only input tokens are shown.",
    };
    const text = formatResultsAsText({
      model,
      images: [{ width: 100, height: 100, multiplier: 1 }],
      imageResults: [
        {
          resizedWidth: 100,
          resizedHeight: 100,
          tokenization: {
            type: "tile",
            tilesHigh: 1,
            tilesWide: 1,
            totalTiles: 1,
            tokensPerTile: 170,
            baseTokens: 85,
            imageTokens: 255,
          },
        },
      ],
      totalTokens: 255,
      totalCost: "0.00064",
    });

    expect(text).toContain("retires Jul 2026");
    expect(text).toContain("Only input tokens are shown.");
  });

  it("skips image entries with missing tokenization data", () => {
    const text = formatResultsAsText({
      model: patchModel,
      images: [
        { width: 1024, height: 768, multiplier: 1 },
        { width: 0, height: 0, multiplier: 1 },
      ],
      imageResults: [
        {
          resizedWidth: 1024,
          resizedHeight: 768,
          tokenization: {
            type: "patch",
            patchesWide: 32,
            patchesHigh: 24,
            totalPatches: 768,
            tokenMultiplier: 1.0,
            imageTokens: 768,
          },
        },
        {
          resizedWidth: 0,
          resizedHeight: 0,
          tokenization: null,
        },
      ],
      totalTokens: 768,
      totalCost: "0.00192",
    });

    expect(text).toContain("Image 1:");
    expect(text).not.toContain("Image 2:");
  });

  it("handles missing image metadata gracefully", () => {
    const text = formatResultsAsText({
      model: patchModel,
      images: [undefined],
      imageResults: [
        {
          resizedWidth: 512,
          resizedHeight: 512,
          tokenization: {
            type: "patch",
            patchesWide: 16,
            patchesHigh: 16,
            totalPatches: 256,
            tokenMultiplier: 1.0,
            imageTokens: 256,
          },
        },
      ],
      totalTokens: 256,
      totalCost: "0.00064",
    });

    expect(text).toContain("Image 1:");
    expect(text).toContain("?x?, Qty 1");
  });

  it("handles empty results", () => {
    const text = formatResultsAsText({
      model: patchModel,
      images: [],
      imageResults: [],
      totalTokens: 0,
      totalCost: "0",
    });

    expect(text).toContain("Total tokens: 0");
    expect(text).toContain("Azure OpenAI Image Token Calculator");
  });
});
