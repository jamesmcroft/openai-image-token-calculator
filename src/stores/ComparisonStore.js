import { calculateForModel } from "./CalcStore";
import { getOriginalDetail } from "./ModelStore";

export const comparisonStore = (set, get) => ({
  comparisonMode: false,
  selectedModels: [],
  comparisonResults: [],
  comparisonError: null,
  expandedModelName: null,
  comparisonSortOrder: "asc",

  setComparisonMode: (enabled) => {
    const state = get();

    if (enabled) {
      // Single -> Compare: carry over the current single model
      const carryOver =
        state.model && typeof state.model === "object" ? [state.model] : [];
      set({
        comparisonMode: true,
        selectedModels: carryOver,
        comparisonResults: [],
        comparisonError: null,
        expandedModelName: null,
        comparisonSortOrder: "asc",
      });
      // Auto-calculate if there are images and a carried-over model
      if (carryOver.length > 0 && state.images.length > 0) {
        get().runComparison();
      }
    } else {
      // Compare -> Single: find the actual cheapest regardless of display sort
      let cheapest = state.selectedModels[0] ?? null;
      if (state.comparisonResults.length > 0) {
        cheapest = state.comparisonResults.reduce((min, r) =>
          Number(r.totalCost) < Number(min.totalCost) ? r : min
        ).model;
      }
      set({
        comparisonMode: false,
        selectedModels: [],
        comparisonResults: [],
        comparisonError: null,
        expandedModelName: null,
        comparisonSortOrder: "asc",
        model: cheapest ?? "",
      });
      // Auto-calculate single-mode results for the restored model
      if (cheapest && state.images.length > 0) {
        get().runCalculation();
      } else {
        get().resetCalculation();
      }
    }
  },

  toggleModelSelection: (model) => {
    const current = get().selectedModels;
    const exists = current.some((m) => m.name === model.name);
    const next = exists
      ? current.filter((m) => m.name !== model.name)
      : [...current, model];
    set({
      selectedModels: next,
      imageDetail: get().imageDetail === "original" && next.some((item) => !getOriginalDetail(item))
        ? "high"
        : get().imageDetail,
      comparisonError: null,
    });
  },

  clearSelectedModels: () => {
    set({ selectedModels: [], comparisonResults: [], expandedModelName: null, comparisonError: null });
  },

  toggleComparisonSortOrder: () => {
    const state = get();
    const next = state.comparisonSortOrder === "asc" ? "desc" : "asc";
    const sorted = [...state.comparisonResults].sort((a, b) =>
      next === "asc"
        ? Number(a.totalCost) - Number(b.totalCost)
        : Number(b.totalCost) - Number(a.totalCost)
    );
    set({ comparisonSortOrder: next, comparisonResults: sorted });
  },

  runComparison: () => {
    const { selectedModels, images, comparisonSortOrder, imageDetail } = get();
    if (selectedModels.length === 0 || images.length === 0) {
      set({ comparisonResults: [], expandedModelName: null, comparisonError: null });
      return;
    }

    let results;
    try {
      results = selectedModels.map((model) => {
        const { totalTokens, totalCost, imageResults } = calculateForModel(
          model,
          images,
          imageDetail
        );
        return { model, totalTokens, totalCost, imageResults };
      });
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      set({ comparisonResults: [], comparisonError: error.message });
      return;
    }

    results.sort((a, b) =>
      comparisonSortOrder === "asc"
        ? Number(a.totalCost) - Number(b.totalCost)
        : Number(b.totalCost) - Number(a.totalCost)
    );
    set({ comparisonResults: results, comparisonError: null });
  },

  setExpandedModel: (name) => {
    set((state) => ({
      expandedModelName: state.expandedModelName === name ? null : name,
    }));
  },
});
