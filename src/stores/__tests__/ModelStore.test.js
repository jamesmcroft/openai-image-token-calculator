import { describe, it, expect } from "vitest";
import { modelStore, getOriginalDetail } from "../ModelStore";
import { calculateForModel } from "../CalcStore";

describe("new vision models", () => {
  const models = modelStore().models;
  const newGroups = ["GPT-6.1", "GPT-6", "GPT-5.6"];
  const prices = {
    "GPT-6.1 Sol (Global)": 2,
    "GPT-6.1 Sol (Data Zone)": 2.2,
    "GPT-6.1 Sol (Long, Global)": 4,
    "GPT-6.1 Sol (Long, Data Zone)": 4.4,
    "GPT-6 Astra (Global)": 10,
    "GPT-6 Astra (Data Zone)": 11,
    "GPT-6 Astra (Long, Global)": 20,
    "GPT-6 Astra (Long, Data Zone)": 22,
    "GPT-6 Sol (Global)": 2,
    "GPT-6 Sol (Data Zone)": 2.2,
    "GPT-6 Sol (Long, Global)": 4,
    "GPT-6 Sol (Long, Data Zone)": 4.4,
    "GPT-6 Luna (Global)": 0.1,
    "GPT-6 Luna (Data Zone)": 0.11,
    "GPT-6 Luna (Long, Global)": 0.2,
    "GPT-6 Luna (Long, Data Zone)": 0.22,
    "GPT-5.6 Sol (Global)": 4,
    "GPT-5.6 Sol (Data Zone)": 4.4,
    "GPT-5.6 Sol (Long, Global)": 8,
    "GPT-5.6 Sol (Long, Data Zone)": 8.8,
    "GPT-5.6 Terra (Global)": 2,
    "GPT-5.6 Terra (Data Zone)": 2.2,
    "GPT-5.6 Terra (Long, Global)": 4,
    "GPT-5.6 Terra (Long, Data Zone)": 4.4,
    "GPT-5.6 Luna (Global)": 0.2,
    "GPT-5.6 Luna (Data Zone)": 0.22,
    "GPT-5.6 Luna (Long, Global)": 0.4,
    "GPT-5.6 Luna (Long, Data Zone)": 0.44,
  };

  it("lists the image-capable GPT-5.6 and GPT-6 models with input rates", () => {
    const additions = models
      .filter((group) => newGroups.includes(group.name))
      .flatMap((group) => group.items);

    expect(Object.fromEntries(additions.map(({ name, costPerMillionTokens }) => [
      name,
      costPerMillionTokens,
    ]))).toEqual(prices);
    expect(new Set(additions.map((model) => model.name)).size).toBe(additions.length);
  });

  it("calculates image input cost for each new model", () => {
    const additions = models
      .filter((group) => newGroups.includes(group.name))
      .flatMap((group) => group.items);

    for (const model of additions) {
      expect(model.tokenizationType).toBe("patch");
      expect(model.patchSize).toBe(32);
      expect(model.patchBudget).toBe(2500);
      expect(model.tokenMultiplier).toBe(1.2);
      expect(model.maxImageDimension).toBe(model.name.startsWith("GPT-5.6 ") ? 2048 : 65535);
      const result = calculateForModel(
        model,
        [{ height: 1024, width: 1024, multiplier: 1 }],
      );
      expect(result.imageResults[0].tokenization.type).toBe("patch");
      expect(result.totalTokens).toBe(1229);
      expect(result.totalCost).toBe(
        ((1229 / 1_000_000) * prices[model.name]).toFixed(5),
      );
    }
  });

  it("respects the high-detail patch budget on large images", () => {
    const model = models.find((group) => group.name === "GPT-6")
      .items.find((item) => item.name === "GPT-6 Astra (Global)");
    const result = calculateForModel(
      model,
      [{ height: 2048, width: 2048, multiplier: 2 }],
    );

    expect(result.imageResults[0].tokenization.totalPatches).toBe(5000);
    expect(result.totalTokens).toBe(6000);
    expect(result.totalCost).toBe("0.06000");
  });

  it("matches OpenAI's published GPT-6 Astra high-detail examples", () => {
    const model = models.find((group) => group.name === "GPT-6")
      .items.find((item) => item.name === "GPT-6 Astra (Global)");

    for (const [height, width, tokens, resizedHeight, resizedWidth] of [
      [1024, 1024, 1229, 1024, 1024],
      [2048, 2048, 3000, 1600, 1600],
      [4096, 512, 2458, 4096, 512],
    ]) {
      const result = calculateForModel(model, [
        { height, width, multiplier: 1 },
      ]);
      expect(result.totalTokens).toBe(tokens);
      expect(result.imageResults[0].resizedHeight).toBe(resizedHeight);
      expect(result.imageResults[0].resizedWidth).toBe(resizedWidth);
    }
  });

  it("retains panoramic patches for GPT-6 estimates without an assumed 2048px cap", () => {
    const additions = models
      .filter((group) => ["GPT-6", "GPT-6.1"].includes(group.name))
      .flatMap((group) => group.items);

    for (const model of additions) {
      const result = calculateForModel(model, [
        { height: 32, width: 4096, multiplier: 1 },
      ]);
      expect(result.imageResults[0].resizedWidth).toBe(4096);
      expect(result.imageResults[0].tokenization.totalPatches).toBe(128);
      expect(result.totalTokens).toBe(154);
    }

    const gpt56 = models.find((group) => group.name === "GPT-5.6").items[0];
    expect(calculateForModel(gpt56, [
      { height: 32, width: 4096, multiplier: 1 },
    ]).totalTokens).toBe(77);
  });

  it("uses OpenAI's high-detail budgets and multipliers for existing patch models", () => {
    const available = models.flatMap((group) => group.items);
    const expected = [
      ["GPT-5.5", 2500, 1.2, 3000],
      ["GPT-5.4", 2500, 1.2, 3000],
      ["GPT-5.4 mini", 2500, 1.2, 3000],
      ["GPT-5.4 nano", 2500, 1.2, 3000],
      ["GPT-5.2", 6144, 1.2, 4916],
      ["GPT-4.1 mini", 6144, 1.62, 6636],
    ];

    for (const [name, patchBudget, tokenMultiplier, largeImageTokens] of expected) {
      const matches = available.filter((model) =>
        model.name === name || model.name.startsWith(`${name} (`));
      expect(matches.length).toBeGreaterThan(0);
      for (const model of matches) {
        expect(model.patchBudget).toBe(patchBudget);
        expect(model.tokenMultiplier).toBe(tokenMultiplier);
        expect(model.maxImageDimension).toBe(2048);
        expect(calculateForModel(model, [
          { height: 2048, width: 2048, multiplier: 1 },
        ]).totalTokens).toBe(largeImageTokens);
      }
    }
  });

  it("supports Original only where OpenAI publishes model-specific limits", () => {
    const available = models.flatMap((group) => group.items);
    for (const model of available) {
      if (model.name.startsWith("GPT-5.4 ") || model.name.startsWith("GPT-5.5 (")) {
        expect(getOriginalDetail(model)).toEqual({
          maxImageDimension: 6000,
          patchBudget: 10000,
        });
      } else if (model.name.startsWith("GPT-5.6 ") ||
        model.name.startsWith("GPT-6 Astra (")) {
        expect(getOriginalDetail(model)).toEqual({
          maxImageDimension: 65535,
          patchBudget: null,
        });
      } else {
        expect(getOriginalDetail(model)).toBeNull();
      }
    }
  });

  it("estimates Original detail without applying the High resizing budget", () => {
    const available = models.flatMap((group) => group.items);
    for (const name of [
      "GPT-5.4 (Global)", "GPT-5.4 mini (Data Zone)", "GPT-5.4 nano (Global)",
      "GPT-5.5 (Global)",
    ]) {
      const model = available.find((item) => item.name === name);
      const image = [{ height: 4096, width: 4096, multiplier: 1 }];
      expect(calculateForModel(model, image).totalTokens).toBe(3000);
      expect(calculateForModel(model, image, "original").totalTokens).toBe(12000);
    }

    for (const name of ["GPT-5.6 Sol (Global)", "GPT-6 Astra (Global)"]) {
      const model = available.find((item) => item.name === name);
      expect(calculateForModel(model, [
        { height: 4096, width: 4096, multiplier: 1 },
      ], "original").totalTokens).toBe(19661);
      expect(() => calculateForModel(model, [
        { height: 8192, width: 8192, multiplier: 1 },
      ], "original")).toThrow(/30,000-patch Original detail limit/);
    }
  });

  it("rejects Original detail for models without published Original sizing rules", () => {
    const model = models.find((group) => group.name === "GPT-6.1").items[0];
    expect(() => calculateForModel(model, [
      { height: 1024, width: 1024, multiplier: 1 },
    ], "original")).toThrow(/Original detail is not available/);
  });

  it("respects Original dimension caps and the 30,000-patch acceptance boundary", () => {
    const available = models.flatMap((group) => group.items);
    const gpt54 = available.find((model) => model.name === "GPT-5.4 (Global)");
    const gpt56 = available.find((model) => model.name === "GPT-5.6 Sol (Global)");

    const limited = calculateForModel(gpt54, [
      { height: 8000, width: 32, multiplier: 1 },
    ], "original");
    expect(limited.imageResults[0].resizedHeight).toBe(6000);
    expect(limited.imageResults[0].resizedWidth).toBe(24);

    expect(calculateForModel(gpt56, [
      { height: 6400, width: 4800, multiplier: 1 },
    ], "original").totalTokens).toBe(36000);
    expect(() => calculateForModel(gpt56, [
      { height: 6401, width: 4800, multiplier: 1 },
    ], "original")).toThrow(/30,000-patch/);
  });

  it("includes the other advertised image input rates", () => {
    const expected = {
      "GPT-5.5 (Long, Global)": 10,
      "GPT-5.5 (Long, Data Zone)": 11,
      "GPT-5.4 (Long, Global)": 5,
      "GPT-5.4 (Long, Data Zone)": 5.5,
      "GPT-5.4 mini (Data Zone)": 0.83,
      "image-2.5-flare (Global)": 8,
      "image-2.5-sunburst (Global)": 8,
    };
    const available = models.flatMap((group) => group.items);

    for (const [name, price] of Object.entries(expected)) {
      const model = available.find((item) => item.name === name);
      expect(model?.costPerMillionTokens).toBe(price);
      expect(Number(calculateForModel(
        model,
        [{ height: 1024, width: 1024, multiplier: 1 }],
      ).totalCost)).toBeGreaterThan(0);
    }
  });
});
