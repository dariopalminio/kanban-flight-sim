import type { ViewMode, WorkitemLevel } from "./types";

const VIEW_LEVELS: Record<ViewMode, readonly WorkitemLevel[]> = {
  portafolio: ["L3", "L2"],
  delivery: ["L2", "L1", "L0"],
  full: ["L3", "L2", "L1", "L0"],
  L3: ["L3"],
  L2: ["L2"],
  L1: ["L1"],
};

export const VIEW_MODES: readonly ViewMode[] = ["portafolio", "delivery", "full", "L3", "L2", "L1"];

export const visibleLevels = (mode: ViewMode, active: readonly WorkitemLevel[]) =>
  VIEW_LEVELS[mode].filter((level) => active.includes(level));

export const availableViews = (active: readonly WorkitemLevel[]) =>
  VIEW_MODES.filter((mode) => visibleLevels(mode, active).length > 0);

export const normalizeView = (mode: ViewMode, active: readonly WorkitemLevel[]): ViewMode =>
  visibleLevels(mode, active).length > 0 ? mode : "full";
