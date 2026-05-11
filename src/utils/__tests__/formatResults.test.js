import { describe, it, expect } from "vitest";
import {
  formatResultsAsText,
  formatResultsAsTsv,
  formatComparisonAsText,
  formatComparisonAsTsv,
} from "../formatResults";

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

  it("preserves original image numbering when middle entry is filtered out", () => {
    const text = formatResultsAsText({
      model: patchModel,
      images: [
        { width: 1024, height: 768, multiplier: 1 },
        { width: 0, height: 0, multiplier: 1 },
        { width: 1920, height: 1080, multiplier: 1 },
      ],
      imageResults: [
        {
          resizedWidth: 1024,
          resizedHeight: 768,
          tokenization: { type: "patch", totalPatches: 768, imageTokens: 768 },
        },
        { resizedWidth: 0, resizedHeight: 0, tokenization: null },
        {
          resizedWidth: 1920,
          resizedHeight: 1080,
          tokenization: { type: "patch", totalPatches: 2040, imageTokens: 2040 },
        },
      ],
      totalTokens: 2808,
      totalCost: "0.00702",
    });

    expect(text).toContain("Image 1:");
    expect(text).not.toContain("Image 2:");
    expect(text).toContain("Image 3:");
  });

  it("handles undefined images array gracefully", () => {
    const text = formatResultsAsText({
      model: patchModel,
      images: undefined,
      imageResults: [
        {
          resizedWidth: 512,
          resizedHeight: 512,
          tokenization: { type: "patch", totalPatches: 256, imageTokens: 256 },
        },
      ],
      totalTokens: 256,
      totalCost: "0.00064",
    });

    expect(text).toContain("Image 1:");
    expect(text).toContain("?x?, Qty 1");
  });

  it("includes cost projection when requestsPerDay is set", () => {
    const text = formatResultsAsText({
      model: patchModel,
      images: [{ width: 1024, height: 768, multiplier: 1 }],
      imageResults: [
        {
          resizedWidth: 1024,
          resizedHeight: 768,
          tokenization: { type: "patch", totalPatches: 768, imageTokens: 768 },
        },
      ],
      totalTokens: 768,
      totalCost: "0.00192",
      requestsPerDay: 1000,
    });

    expect(text).toContain("Cost Projection");
    expect(text).toContain("Requests per day: 1,000");
    expect(text).toContain("Daily:");
    expect(text).toContain("Monthly (30 days):");
  });

  it("excludes cost projection when requestsPerDay is 0", () => {
    const text = formatResultsAsText({
      model: patchModel,
      images: [{ width: 1024, height: 768, multiplier: 1 }],
      imageResults: [
        {
          resizedWidth: 1024,
          resizedHeight: 768,
          tokenization: { type: "patch", totalPatches: 768, imageTokens: 768 },
        },
      ],
      totalTokens: 768,
      totalCost: "0.00192",
      requestsPerDay: 0,
    });

    expect(text).not.toContain("Cost Projection");
  });

  it("excludes cost projection when totalCost is 0", () => {
    const text = formatResultsAsText({
      model: patchModel,
      images: [{ width: 100, height: 100, multiplier: 1 }],
      imageResults: [
        {
          resizedWidth: 100,
          resizedHeight: 100,
          tokenization: { type: "patch", totalPatches: 16, imageTokens: 0 },
        },
      ],
      totalTokens: 0,
      totalCost: "0",
      requestsPerDay: 1000,
    });

    expect(text).not.toContain("Cost Projection");
  });

  it("excludes cost projection when totalCost is null", () => {
    const text = formatResultsAsText({
      model: patchModel,
      images: [],
      imageResults: [],
      totalTokens: 0,
      totalCost: null,
      requestsPerDay: 500,
    });

    expect(text).not.toContain("Cost Projection");
  });
});

// ---------------------------------------------------------------------------
// formatResultsAsTsv
// ---------------------------------------------------------------------------

describe("formatResultsAsTsv", () => {
  it("produces tab-separated output for patch-based models", () => {
    const tsv = formatResultsAsTsv({
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
            totalPatches: 1536,
            imageTokens: 1536,
          },
        },
        {
          resizedWidth: 1920,
          resizedHeight: 1080,
          tokenization: {
            type: "patch",
            totalPatches: 2040,
            imageTokens: 2040,
          },
        },
      ],
      totalTokens: 3576,
      totalCost: "0.00894",
    });

    const lines = tsv.split("\n");
    // Header row uses tabs
    expect(lines[0]).toBe("Image\tOriginal Size\tQty\tResized Size\tPatches\tTokens");
    // Data rows are tab-separated
    expect(lines[1]).toContain("1024x768");
    expect(lines[1]).toContain("2");
    expect(lines[1].split("\t").length).toBe(6);
    // Totals
    expect(tsv).toContain("Total Tokens\t3576");
    expect(tsv).toContain("Model\tGPT-5.4 (Global)");
  });

  it("produces tab-separated output for tile-based models", () => {
    const tsv = formatResultsAsTsv({
      model: tileModel,
      images: [{ width: 1024, height: 768, multiplier: 1 }],
      imageResults: [
        {
          resizedWidth: 1024,
          resizedHeight: 768,
          tokenization: {
            type: "tile",
            totalTiles: 4,
            imageTokens: 765,
          },
        },
      ],
      totalTokens: 765,
      totalCost: "0.00191",
    });

    expect(tsv).toContain("Tiles");
    expect(tsv).not.toContain("Patches");
    expect(tsv).toContain("Total Tokens\t765");
  });

  it("skips entries with missing tokenization", () => {
    const tsv = formatResultsAsTsv({
      model: patchModel,
      images: [
        { width: 512, height: 512, multiplier: 1 },
        { width: 0, height: 0, multiplier: 1 },
      ],
      imageResults: [
        {
          resizedWidth: 512,
          resizedHeight: 512,
          tokenization: { type: "patch", totalPatches: 256, imageTokens: 256 },
        },
        { resizedWidth: 0, resizedHeight: 0, tokenization: null },
      ],
      totalTokens: 256,
      totalCost: "0.00064",
    });

    const dataLines = tsv.split("\n").filter((l) => l.startsWith("1") || l.startsWith("2"));
    expect(dataLines).toHaveLength(1);
  });

  it("includes projection rows when requestsPerDay is set", () => {
    const tsv = formatResultsAsTsv({
      model: patchModel,
      images: [{ width: 1024, height: 768, multiplier: 1 }],
      imageResults: [
        {
          resizedWidth: 1024,
          resizedHeight: 768,
          tokenization: { type: "patch", totalPatches: 768, imageTokens: 768 },
        },
      ],
      totalTokens: 768,
      totalCost: "0.00192",
      requestsPerDay: 500,
    });

    expect(tsv).toContain("Requests/Day\t500");
    expect(tsv).toContain("Daily Cost");
    expect(tsv).toContain("Monthly Cost (30d)");
  });
});

// ---------------------------------------------------------------------------
// formatComparisonAsText
// ---------------------------------------------------------------------------

describe("formatComparisonAsText", () => {
  it("formats a multi-model comparison", () => {
    const text = formatComparisonAsText({
      images: [{ width: 1024, height: 768, multiplier: 1 }],
      comparisonResults: [
        {
          model: patchModel,
          totalTokens: 768,
          totalCost: "0.00192",
          imageResults: [],
        },
        {
          model: tileModel,
          totalTokens: 765,
          totalCost: "0.00191",
          imageResults: [],
        },
      ],
    });

    expect(text).toContain("Model Comparison");
    expect(text).toContain("GPT-5.4 (Global)");
    expect(text).toContain("GPT-4o (2024-11-20 - Global)");
    expect(text).toContain("Images: 1024x768");
  });

  it("includes retirement and comment notes", () => {
    const retiringModel = {
      ...tileModel,
      retirementDate: "Oct 2026",
      comment: "Input tokens only.",
    };

    const text = formatComparisonAsText({
      images: [{ width: 100, height: 100, multiplier: 1 }],
      comparisonResults: [
        {
          model: retiringModel,
          totalTokens: 255,
          totalCost: "0.00064",
          imageResults: [],
        },
      ],
    });

    expect(text).toContain("Retires Oct 2026");
    expect(text).toContain("Note [GPT-4o (2024-11-20 - Global)]: Input tokens only.");
  });

  it("handles empty comparison results", () => {
    const text = formatComparisonAsText({
      images: [],
      comparisonResults: [],
    });

    expect(text).toContain("No comparison results.");
  });

  it("includes cost projection when requestsPerDay is set", () => {
    const text = formatComparisonAsText({
      images: [{ width: 1024, height: 768, multiplier: 1 }],
      comparisonResults: [
        {
          model: patchModel,
          totalTokens: 768,
          totalCost: "0.00192",
          imageResults: [],
        },
      ],
      requestsPerDay: 1000,
    });

    expect(text).toContain("Cost Projection (1,000 requests/day)");
    expect(text).toContain("GPT-5.4 (Global): Daily");
    expect(text).toContain("Monthly");
  });

  it("excludes cost projection when requestsPerDay is 0", () => {
    const text = formatComparisonAsText({
      images: [],
      comparisonResults: [
        {
          model: patchModel,
          totalTokens: 768,
          totalCost: "0.00192",
          imageResults: [],
        },
      ],
      requestsPerDay: 0,
    });

    expect(text).not.toContain("Cost Projection");
  });
});

// ---------------------------------------------------------------------------
// formatComparisonAsTsv
// ---------------------------------------------------------------------------

describe("formatComparisonAsTsv", () => {
  it("produces tab-separated comparison output", () => {
    const tsv = formatComparisonAsTsv({
      comparisonResults: [
        {
          model: patchModel,
          totalTokens: 768,
          totalCost: "0.00192",
          imageResults: [],
        },
        {
          model: { ...tileModel, retirementDate: "Oct 2026" },
          totalTokens: 765,
          totalCost: "0.00191",
          imageResults: [],
        },
      ],
    });

    const lines = tsv.split("\n");
    expect(lines[0]).toBe(
      "Model\tType\tTotal Tokens\tEstimated Cost\tRate\tRetirement",
    );
    expect(lines[1]).toContain("GPT-5.4 (Global)");
    expect(lines[1]).toContain("Patch");
    expect(lines[1].split("\t").length).toBe(6);
    expect(lines[2]).toContain("Oct 2026");
  });

  it("handles empty comparison results", () => {
    const tsv = formatComparisonAsTsv({ comparisonResults: [] });
    const lines = tsv.split("\n");
    expect(lines).toHaveLength(1); // header only
  });

  it("adds daily and monthly columns when requestsPerDay is set", () => {
    const tsv = formatComparisonAsTsv({
      comparisonResults: [
        {
          model: patchModel,
          totalTokens: 768,
          totalCost: "0.00192",
          imageResults: [],
        },
      ],
      requestsPerDay: 500,
    });

    const lines = tsv.split("\n");
    expect(lines[0]).toContain("Daily Cost");
    expect(lines[0]).toContain("Monthly Cost (30d)");
    expect(lines[1].split("\t").length).toBe(8);
  });

  it("omits projection columns when requestsPerDay is 0", () => {
    const tsv = formatComparisonAsTsv({
      comparisonResults: [
        {
          model: patchModel,
          totalTokens: 768,
          totalCost: "0.00192",
          imageResults: [],
        },
      ],
      requestsPerDay: 0,
    });

    const lines = tsv.split("\n");
    expect(lines[0]).not.toContain("Daily Cost");
    expect(lines[1].split("\t").length).toBe(6);
  });
});
