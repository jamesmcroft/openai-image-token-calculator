import { describe, it, expect } from "vitest";
import {
  encodeState,
  decodeState,
  findModelByName,
  SCHEMA_VERSION,
} from "../urlState";

const sampleImages = [
  { height: 768, width: 1024, multiplier: 2, preset: "XGA" },
  { height: 1080, width: 1920, multiplier: 1, preset: "Custom" },
];

const modelGroups = [
  {
    name: "GPT-5.4",
    items: [
      { name: "GPT-5.4 (Global)", costPerMillionTokens: 2.5 },
      { name: "GPT-5.4 (Data Zone)", costPerMillionTokens: 2.75 },
    ],
  },
  {
    name: "Retiring",
    items: [
      { name: "GPT-4o (2024-11-20 - Global)", costPerMillionTokens: 2.5 },
    ],
  },
];

const testLocation = { origin: "https://example.com", pathname: "/calculator" };

// ---------------------------------------------------------------------------
// encodeState / decodeState round-trip
// ---------------------------------------------------------------------------

describe("encodeState and decodeState", () => {
  it("round-trips model, images, and requestsPerDay", () => {
    const { hash } = encodeState({
      modelName: "GPT-5.4 (Global)",
      images: sampleImages,
      requestsPerDay: 1000,
    }, testLocation);

    const result = decodeState(hash);

    expect(result.error).toBeUndefined();
    expect(result.modelName).toBe("GPT-5.4 (Global)");
    expect(result.images).toHaveLength(2);
    expect(result.images[0].height).toBe(768);
    expect(result.images[0].width).toBe(1024);
    expect(result.images[0].multiplier).toBe(2);
    expect(result.images[0].preset).toBe("XGA");
    expect(result.images[1].preset).toBe("Custom");
    expect(result.requestsPerDay).toBe(1000);
  });

  it("omits requestsPerDay from hash when 0", () => {
    const { hash } = encodeState({
      modelName: "GPT-5.4 (Global)",
      images: sampleImages,
      requestsPerDay: 0,
    }, testLocation);

    const result = decodeState(hash);
    expect(result.requestsPerDay).toBe(0);
  });

  it("omits preset when Custom", () => {
    const { hash } = encodeState({
      modelName: "Test",
      images: [{ height: 100, width: 200, multiplier: 1, preset: "Custom" }],
    }, testLocation);

    const result = decodeState(hash);
    expect(result.images[0].preset).toBe("Custom");
    // Verify 'p' key is absent by checking a round-trip with a named preset
    const { hash: namedHash } = encodeState({
      modelName: "Test",
      images: [{ height: 100, width: 200, multiplier: 1, preset: "XGA" }],
    }, testLocation);
    const namedResult = decodeState(namedHash);
    expect(namedResult.images[0].preset).toBe("XGA");
  });

  it("reports oversized when URL exceeds limit", () => {
    const manyImages = Array.from({ length: 50 }, () => ({
      height: 9999,
      width: 9999,
      multiplier: 99,
      preset: "Very Long Preset Name That Takes Space",
    }));

    const { oversized } = encodeState({
      modelName: "GPT-5.4 (Global)",
      images: manyImages,
    }, testLocation);

    expect(oversized).toBe(true);
  });

  it("round-trips comparison mode with selected models", () => {
    const { hash } = encodeState({
      modelName: "",
      images: sampleImages,
      requestsPerDay: 0,
      comparisonMode: true,
      selectedModelNames: ["GPT-5.4 (Global)", "GPT-4o (2024-11-20 - Global)"],
    }, testLocation);

    const result = decodeState(hash);

    expect(result.error).toBeUndefined();
    expect(result.comparisonMode).toBe(true);
    expect(result.selectedModelNames).toEqual([
      "GPT-5.4 (Global)",
      "GPT-4o (2024-11-20 - Global)",
    ]);
  });

  it("defaults to single mode when comparison flag is absent", () => {
    const { hash } = encodeState({
      modelName: "GPT-5.4 (Global)",
      images: sampleImages,
    }, testLocation);

    const result = decodeState(hash);

    expect(result.comparisonMode).toBe(false);
    expect(result.selectedModelNames).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// decodeState validation
// ---------------------------------------------------------------------------

describe("decodeState validation", () => {
  it("returns error for empty hash", () => {
    expect(decodeState("")).toEqual({ error: "empty" });
    expect(decodeState("#")).toEqual({ error: "empty" });
  });

  it("returns error for invalid base64", () => {
    const result = decodeState("#!!!not-valid-base64!!!");
    expect(result.error).toContain("could not decode");
  });

  it("returns error for invalid JSON", () => {
    const encoded = btoa("not json at all");
    const result = decodeState(`#${encoded}`);
    expect(result.error).toContain("malformed data");
  });

  it("returns error for wrong schema version", () => {
    const encoded = btoa(JSON.stringify({ v: 999, m: "test", i: [] }));
    const result = decodeState(`#${encoded}`);
    expect(result.error).toContain("Unsupported");
  });

  it("returns error when images is not an array", () => {
    const encoded = btoa(
      JSON.stringify({ v: SCHEMA_VERSION, m: "test", i: "not-array" }),
    );
    const result = decodeState(`#${encoded}`);
    expect(result.error).toContain("images must be an array");
  });

  it("sanitizes negative dimensions to 0", () => {
    const encoded = btoa(
      JSON.stringify({
        v: SCHEMA_VERSION,
        m: "test",
        i: [{ h: -100, w: -200, q: 1 }],
      }),
    );

    const result = decodeState(`#${encoded}`);
    expect(result.images[0].height).toBe(0);
    expect(result.images[0].width).toBe(0);
  });

  it("sanitizes multiplier below 1 to 1", () => {
    const encoded = btoa(
      JSON.stringify({
        v: SCHEMA_VERSION,
        m: "test",
        i: [{ h: 100, w: 100, q: 0 }],
      }),
    );

    const result = decodeState(`#${encoded}`);
    expect(result.images[0].multiplier).toBe(1);
  });

  it("caps image count at 50", () => {
    const images = Array.from({ length: 100 }, () => ({
      h: 100,
      w: 100,
      q: 1,
    }));
    const encoded = btoa(
      JSON.stringify({ v: SCHEMA_VERSION, m: "test", i: images }),
    );

    const result = decodeState(`#${encoded}`);
    expect(result.images).toHaveLength(50);
  });

  it("handles non-numeric requestsPerDay gracefully", () => {
    const encoded = btoa(
      JSON.stringify({
        v: SCHEMA_VERSION,
        m: "test",
        i: [],
        r: "abc",
      }),
    );

    const result = decodeState(`#${encoded}`);
    expect(result.requestsPerDay).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// findModelByName
// ---------------------------------------------------------------------------

describe("findModelByName", () => {
  it("finds a model by exact name", () => {
    const model = findModelByName("GPT-5.4 (Global)", modelGroups);
    expect(model).toBeDefined();
    expect(model.name).toBe("GPT-5.4 (Global)");
    expect(model.costPerMillionTokens).toBe(2.5);
  });

  it("finds a model in a different group", () => {
    const model = findModelByName(
      "GPT-4o (2024-11-20 - Global)",
      modelGroups,
    );
    expect(model).toBeDefined();
    expect(model.name).toBe("GPT-4o (2024-11-20 - Global)");
  });

  it("returns null for unknown model name", () => {
    expect(findModelByName("NonExistent Model", modelGroups)).toBeNull();
  });

  it("returns null for empty name", () => {
    expect(findModelByName("", modelGroups)).toBeNull();
  });

  it("returns null for null name", () => {
    expect(findModelByName(null, modelGroups)).toBeNull();
  });
});
