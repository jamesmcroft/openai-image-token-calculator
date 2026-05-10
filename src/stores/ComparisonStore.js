import { calculateForModel } from "./CalcStore";

export const comparisonStore = (set, get) => ({
  comparisonMode: false,
  selectedModels: [],
  comparisonResults: [],
  expandedModelName: null,

  setComparisonMode: (enabled) => {
    set({
      comparisonMode: enabled,
      selectedModels: [],
      comparisonResults: [],
      expandedModelName: null,
    });
  },

  toggleModelSelection: (model) => {
    const current = get().selectedModels;
    const exists = current.some((m) => m.name === model.name);
    const next = exists
      ? current.filter((m) => m.name !== model.name)
      : [...current, model];
    set({ selectedModels: next });
  },

  clearSelectedModels: () => {
    set({ selectedModels: [], comparisonResults: [], expandedModelName: null });
  },

  runComparison: () => {
    const { selectedModels, images } = get();
    if (selectedModels.length === 0 || images.length === 0) {
      set({ comparisonResults: [] });
      return;
    }

    const results = selectedModels.map((model) => {
      const { totalTokens, totalCost, imageResults } = calculateForModel(
        model,
        images
      );
      return { model, totalTokens, totalCost, imageResults };
    });

    results.sort((a, b) => Number(a.totalCost) - Number(b.totalCost));
    set({ comparisonResults: results });
  },

  setExpandedModel: (name) => {
    set((state) => ({
      expandedModelName: state.expandedModelName === name ? null : name,
    }));
  },
});
