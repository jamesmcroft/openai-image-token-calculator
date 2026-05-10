import { describe, it, expect, beforeEach } from "vitest";
import { useBoundStore } from "../index";

// Helper: reset the store between tests
function resetStore() {
  useBoundStore.setState({
    comparisonMode: false,
    selectedModels: [],
    comparisonResults: [],
    expandedModelName: null,
    comparisonSortOrder: "asc",
    images: [],
    model: "",
    imageResults: [],
    totalTokens: null,
    totalCost: null,
  });
}

const tileModel = {
  name: "GPT-5 (Global)",
  tokensPerTile: 140,
  maxImageDimension: 2048,
  imageMinSizeLength: 768,
  tileSizeLength: 512,
  baseTokens: 70,
  costPerMillionTokens: 1.25,
};

const patchModelCheap = {
  name: "GPT-5.4 mini (Global)",
  tokenizationType: "patch",
  patchSize: 32,
  patchBudget: 1536,
  tokenMultiplier: 1.62,
  maxImageDimension: 2048,
  costPerMillionTokens: 0.75,
};

const patchModelExpensive = {
  name: "GPT-5.4 (Global)",
  tokenizationType: "patch",
  patchSize: 32,
  patchBudget: 2500,
  tokenMultiplier: 1.0,
  maxImageDimension: 2048,
  costPerMillionTokens: 2.5,
};

describe("ComparisonStore", () => {
  beforeEach(resetStore);

  // -----------------------------------------------------------------------
  // setComparisonMode
  // -----------------------------------------------------------------------

  describe("setComparisonMode", () => {
    it("enables comparison mode", () => {
      useBoundStore.getState().setComparisonMode(true);
      expect(useBoundStore.getState().comparisonMode).toBe(true);
    });

    it("disabling comparison mode clears selections and results", () => {
      const s = useBoundStore.getState();
      s.setComparisonMode(true);
      s.toggleModelSelection(tileModel);
      s.addImage({ height: 1024, width: 1024, multiplier: 1 });
      s.runComparison();
      expect(useBoundStore.getState().comparisonResults.length).toBe(1);

      useBoundStore.getState().setComparisonMode(false);
      const state = useBoundStore.getState();
      expect(state.comparisonMode).toBe(false);
      expect(state.selectedModels).toEqual([]);
      expect(state.comparisonResults).toEqual([]);
    });

    it("carries the single model into selectedModels when entering comparison mode", () => {
      useBoundStore.setState({ model: tileModel });
      useBoundStore.getState().setComparisonMode(true);
      const state = useBoundStore.getState();
      expect(state.comparisonMode).toBe(true);
      expect(state.selectedModels).toHaveLength(1);
      expect(state.selectedModels[0].name).toBe(tileModel.name);
    });

    it("does not carry over when there is no single model selected", () => {
      useBoundStore.setState({ model: "" });
      useBoundStore.getState().setComparisonMode(true);
      expect(useBoundStore.getState().selectedModels).toHaveLength(0);
    });

    it("restores the cheapest model as the single model when leaving comparison mode", () => {
      const s = useBoundStore.getState();
      s.setComparisonMode(true);
      s.toggleModelSelection(patchModelExpensive);
      s.toggleModelSelection(patchModelCheap);
      s.addImage({ height: 1024, width: 1024, multiplier: 1 });
      s.runComparison();

      // The cheapest should be patchModelCheap (costPerMillionTokens: 0.75)
      useBoundStore.getState().setComparisonMode(false);
      const state = useBoundStore.getState();
      expect(state.comparisonMode).toBe(false);
      expect(state.model.name).toBe(patchModelCheap.name);
    });

    it("restores the first selected model when leaving comparison mode with no results", () => {
      const s = useBoundStore.getState();
      s.setComparisonMode(true);
      s.toggleModelSelection(patchModelExpensive);
      s.toggleModelSelection(tileModel);
      // No images, so no results

      useBoundStore.getState().setComparisonMode(false);
      const state = useBoundStore.getState();
      expect(state.model.name).toBe(patchModelExpensive.name);
    });

    it("leaves model empty when leaving comparison mode with nothing selected", () => {
      useBoundStore.getState().setComparisonMode(true);
      // Nothing selected, no results
      useBoundStore.getState().setComparisonMode(false);
      expect(useBoundStore.getState().model).toBe("");
    });

    it("resets sort order when switching modes", () => {
      const s = useBoundStore.getState();
      s.setComparisonMode(true);
      s.toggleModelSelection(patchModelExpensive);
      s.toggleModelSelection(patchModelCheap);
      s.addImage({ height: 1024, width: 1024, multiplier: 1 });
      s.runComparison();
      s.toggleComparisonSortOrder();
      expect(useBoundStore.getState().comparisonSortOrder).toBe("desc");

      useBoundStore.getState().setComparisonMode(false);
      expect(useBoundStore.getState().comparisonSortOrder).toBe("asc");

      useBoundStore.getState().setComparisonMode(true);
      expect(useBoundStore.getState().comparisonSortOrder).toBe("asc");
    });
  });

  // -----------------------------------------------------------------------
  // toggleModelSelection
  // -----------------------------------------------------------------------

  describe("toggleModelSelection", () => {
    it("adds a model to the selection", () => {
      useBoundStore.getState().toggleModelSelection(tileModel);
      expect(useBoundStore.getState().selectedModels).toHaveLength(1);
      expect(useBoundStore.getState().selectedModels[0].name).toBe(
        tileModel.name
      );
    });

    it("removes a model when toggled again", () => {
      const s = useBoundStore.getState();
      s.toggleModelSelection(tileModel);
      s.toggleModelSelection(tileModel);
      expect(useBoundStore.getState().selectedModels).toHaveLength(0);
    });

    it("supports multiple selections", () => {
      const s = useBoundStore.getState();
      s.toggleModelSelection(tileModel);
      s.toggleModelSelection(patchModelCheap);
      expect(useBoundStore.getState().selectedModels).toHaveLength(2);
    });
  });

  // -----------------------------------------------------------------------
  // clearSelectedModels
  // -----------------------------------------------------------------------

  describe("clearSelectedModels", () => {
    it("clears all selected models and results", () => {
      const s = useBoundStore.getState();
      s.toggleModelSelection(tileModel);
      s.addImage({ height: 1024, width: 1024, multiplier: 1 });
      s.runComparison();
      expect(useBoundStore.getState().comparisonResults.length).toBe(1);

      useBoundStore.getState().clearSelectedModels();
      const state = useBoundStore.getState();
      expect(state.selectedModels).toEqual([]);
      expect(state.comparisonResults).toEqual([]);
      expect(state.expandedModelName).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // runComparison
  // -----------------------------------------------------------------------

  describe("runComparison", () => {
    it("produces results for each selected model", () => {
      const s = useBoundStore.getState();
      s.toggleModelSelection(tileModel);
      s.toggleModelSelection(patchModelCheap);
      s.addImage({ height: 1024, width: 1024, multiplier: 1 });
      s.runComparison();

      const results = useBoundStore.getState().comparisonResults;
      expect(results).toHaveLength(2);
      results.forEach((r) => {
        expect(r).toHaveProperty("model");
        expect(r).toHaveProperty("totalTokens");
        expect(r).toHaveProperty("totalCost");
        expect(r).toHaveProperty("imageResults");
      });
    });

    it("sorts results by cost ascending (cheapest first)", () => {
      const s = useBoundStore.getState();
      s.toggleModelSelection(patchModelExpensive);
      s.toggleModelSelection(patchModelCheap);
      s.toggleModelSelection(tileModel);
      s.addImage({ height: 1024, width: 1024, multiplier: 1 });
      s.runComparison();

      const results = useBoundStore.getState().comparisonResults;
      for (let i = 1; i < results.length; i++) {
        expect(Number(results[i].totalCost)).toBeGreaterThanOrEqual(
          Number(results[i - 1].totalCost)
        );
      }
    });

    it("returns empty results when no models are selected", () => {
      const s = useBoundStore.getState();
      s.addImage({ height: 1024, width: 1024, multiplier: 1 });
      s.runComparison();
      expect(useBoundStore.getState().comparisonResults).toEqual([]);
    });

    it("returns empty results when no images exist", () => {
      const s = useBoundStore.getState();
      s.toggleModelSelection(tileModel);
      s.runComparison();
      expect(useBoundStore.getState().comparisonResults).toEqual([]);
    });

    it("recalculates when images change", () => {
      const s = useBoundStore.getState();
      s.toggleModelSelection(tileModel);
      s.addImage({ height: 1024, width: 1024, multiplier: 1 });
      s.runComparison();
      const firstTokens =
        useBoundStore.getState().comparisonResults[0].totalTokens;

      useBoundStore
        .getState()
        .addImage({ height: 2048, width: 2048, multiplier: 1 });
      useBoundStore.getState().runComparison();
      const secondTokens =
        useBoundStore.getState().comparisonResults[0].totalTokens;

      expect(secondTokens).toBeGreaterThan(firstTokens);
    });

    it("does not mutate the images array", () => {
      const s = useBoundStore.getState();
      s.addImage({ height: 1024, width: 1024, multiplier: 1 });
      s.addImage({ height: 2000, width: 100, multiplier: 2 });
      s.toggleModelSelection(tileModel);
      s.toggleModelSelection(patchModelCheap);

      const imagesBefore = JSON.parse(
        JSON.stringify(useBoundStore.getState().images)
      );
      useBoundStore.getState().runComparison();
      expect(useBoundStore.getState().images).toEqual(imagesBefore);
    });
  });

  // -----------------------------------------------------------------------
  // setExpandedModel
  // -----------------------------------------------------------------------

  describe("setExpandedModel", () => {
    it("sets the expanded model name", () => {
      useBoundStore.getState().setExpandedModel("GPT-5 (Global)");
      expect(useBoundStore.getState().expandedModelName).toBe(
        "GPT-5 (Global)"
      );
    });

    it("toggles off when called with the same name", () => {
      const s = useBoundStore.getState();
      s.setExpandedModel("GPT-5 (Global)");
      s.setExpandedModel("GPT-5 (Global)");
      expect(useBoundStore.getState().expandedModelName).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // toggleComparisonSortOrder
  // -----------------------------------------------------------------------

  describe("toggleComparisonSortOrder", () => {
    it("defaults to ascending sort order", () => {
      expect(useBoundStore.getState().comparisonSortOrder).toBe("asc");
    });

    it("toggles from ascending to descending", () => {
      const s = useBoundStore.getState();
      s.toggleModelSelection(patchModelExpensive);
      s.toggleModelSelection(patchModelCheap);
      s.addImage({ height: 1024, width: 1024, multiplier: 1 });
      s.runComparison();

      useBoundStore.getState().toggleComparisonSortOrder();
      const state = useBoundStore.getState();
      expect(state.comparisonSortOrder).toBe("desc");
      // Most expensive should be first
      expect(Number(state.comparisonResults[0].totalCost)).toBeGreaterThanOrEqual(
        Number(state.comparisonResults[1].totalCost)
      );
    });

    it("toggles back from descending to ascending", () => {
      const s = useBoundStore.getState();
      s.toggleModelSelection(patchModelExpensive);
      s.toggleModelSelection(patchModelCheap);
      s.addImage({ height: 1024, width: 1024, multiplier: 1 });
      s.runComparison();

      useBoundStore.getState().toggleComparisonSortOrder();
      useBoundStore.getState().toggleComparisonSortOrder();
      const state = useBoundStore.getState();
      expect(state.comparisonSortOrder).toBe("asc");
      expect(Number(state.comparisonResults[0].totalCost)).toBeLessThanOrEqual(
        Number(state.comparisonResults[1].totalCost)
      );
    });

    it("preserves sort order across runComparison calls", () => {
      const s = useBoundStore.getState();
      s.toggleModelSelection(patchModelExpensive);
      s.toggleModelSelection(patchModelCheap);
      s.addImage({ height: 1024, width: 1024, multiplier: 1 });
      s.runComparison();
      s.toggleComparisonSortOrder();
      expect(useBoundStore.getState().comparisonSortOrder).toBe("desc");

      // Re-run comparison (simulates image change)
      useBoundStore.getState().runComparison();
      const state = useBoundStore.getState();
      expect(state.comparisonSortOrder).toBe("desc");
      expect(Number(state.comparisonResults[0].totalCost)).toBeGreaterThanOrEqual(
        Number(state.comparisonResults[1].totalCost)
      );
    });
  });
});
