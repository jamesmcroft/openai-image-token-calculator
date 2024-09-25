import { create } from "zustand";
import { modelStore } from "./ModelStore";
import { calcStore } from "./CalcStore";

export const useBoundStore = create((...a) => ({
  ...modelStore(...a),
  ...calcStore(...a),
}));
