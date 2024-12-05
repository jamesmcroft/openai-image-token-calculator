import { create } from "zustand";
import { modelStore } from "./ModelStore";
import { calcStore } from "./CalcStore";
import { presetStore } from "./PresetStore";

export const useBoundStore = create((...a) => ({
  ...modelStore(...a),
  ...calcStore(...a),
  ...presetStore(...a),
}));
