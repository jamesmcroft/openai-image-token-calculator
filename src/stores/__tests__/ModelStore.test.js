import { describe, it, expect } from "vitest";
import { modelStore } from "../ModelStore";
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
      expect(model.maxImageDimension).toBe(2048);
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

  it("includes the other advertised image input rates", () => {
    const expected = {
      "GPT-5.5 (Long, Global)": 10,
      "GPT-5.5 (Long, Data Zone)": 11,
      "GPT-5.4 (Long, Global)": 5,
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
