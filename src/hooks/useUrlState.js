import { useEffect, useRef, useCallback } from "react";
import { useBoundStore } from "../stores";
import { encodeState, decodeState, findModelByName } from "../utils/urlState";

const DEBOUNCE_MS = 300;

/**
 * Syncs calculator state with the URL hash.
 * - On mount: restores state from hash if present.
 * - On state change: updates the hash (debounced, using replaceState).
 *
 * @param {{ setModelName: (name: string) => void }} callbacks
 * @returns {{ warning: string|null, oversized: boolean }}
 */
export default function useUrlState({ setModelName }) {
  const model = useBoundStore((s) => s.model);
  const images = useBoundStore((s) => s.images);
  const requestsPerDay = useBoundStore((s) => s.requestsPerDay);
  const models = useBoundStore((s) => s.models);
  const setModel = useBoundStore((s) => s.setModel);
  const addImage = useBoundStore((s) => s.addImage);
  const setRequestsPerDay = useBoundStore((s) => s.setRequestsPerDay);
  const comparisonMode = useBoundStore((s) => s.comparisonMode);
  const setComparisonMode = useBoundStore((s) => s.setComparisonMode);
  const selectedModels = useBoundStore((s) => s.selectedModels);
  const toggleModelSelection = useBoundStore((s) => s.toggleModelSelection);

  const hydratedRef = useRef(false);
  const warningRef = useRef(null);
  const oversizedRef = useRef(false);

  // Restore state from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length <= 1) {
      hydratedRef.current = true;
      return;
    }

    const result = decodeState(hash);

    if (result.error) {
      if (result.error !== "empty") {
        warningRef.current = result.error;
      }
      hydratedRef.current = true;
      return;
    }

    // Resolve model
    const modelObj = findModelByName(result.modelName, models);
    if (result.modelName && !modelObj) {
      warningRef.current = `Model "${result.modelName}" was not found. It may have been renamed or removed.`;
    }

    // Set state - single model (used when not in comparison mode)
    if (modelObj && !result.comparisonMode) {
      setModel(modelObj);
      setModelName(modelObj.name);
    }

    // Clear existing images and add restored ones
    const store = useBoundStore.getState();
    while (store.images.length > 0) {
      useBoundStore.getState().removeImage(0);
    }

    for (const img of result.images) {
      addImage(img);
    }

    if (result.requestsPerDay > 0) {
      setRequestsPerDay(result.requestsPerDay);
    }

    // Restore comparison mode
    if (result.comparisonMode) {
      setComparisonMode(true);
      // Resolve and select each model by name
      const missingModels = [];
      for (const name of result.selectedModelNames) {
        const obj = findModelByName(name, models);
        if (obj) {
          toggleModelSelection(obj);
        } else {
          missingModels.push(name);
        }
      }
      if (missingModels.length > 0) {
        warningRef.current = `Some models were not found: ${missingModels.join(", ")}. They may have been renamed or removed.`;
      }
      setTimeout(() => {
        useBoundStore.getState().runComparison();
        hydratedRef.current = true;
      }, 0);
    } else if (modelObj && result.images.length > 0) {
      setTimeout(() => {
        useBoundStore.getState().runCalculation();
        hydratedRef.current = true;
      }, 0);
    } else {
      hydratedRef.current = true;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update URL hash when state changes (debounced)
  const timerRef = useRef(null);

  const updateHash = useCallback(() => {
    if (!hydratedRef.current) return;

    const modelName = typeof model === "object" ? model?.name : "";
    const hasContent = modelName || images.length > 0 || (comparisonMode && selectedModels.length > 0);
    if (!hasContent) {
      if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname);
      }
      oversizedRef.current = false;
      return;
    }

    const { hash, oversized } = encodeState({
      modelName,
      images,
      requestsPerDay,
      comparisonMode,
      selectedModelNames: selectedModels.map((m) => m.name),
    });

    oversizedRef.current = oversized;

    if (!oversized) {
      history.replaceState(null, "", `${window.location.pathname}${hash}`);
    }
  }, [model, images, requestsPerDay, comparisonMode, selectedModels]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(updateHash, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [updateHash]);

  return {
    warning: warningRef.current,
    oversized: oversizedRef.current,
  };
}
