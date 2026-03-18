import type { Config, Status, WorkitemLevel } from "../domain/types";
import raw from "./defaultConfig.json";

// =====================
// CATEGORY HELPER
// =====================

type RawStatus = Omit<Status, "category">;

const assignCategory = (statuses: RawStatus[]): Status[] => {
  const lastId = statuses[statuses.length - 1].id;
  return statuses.map((s) => {
    if (s.streamType === "UPSTREAM") return { ...s, category: "TODO" as const };
    if (s.id === lastId) return { ...s, category: "DONE" as const };
    return { ...s, category: "IN_PROGRESS" as const };
  });
};

// =====================
// BUILD CONFIG FROM JSON
// =====================

const buildWorkflow = (wf: typeof raw.workflows.L2) => ({
  id: wf.id,
  name: wf.name,
  level: wf.level as WorkitemLevel,
  statuses: assignCategory(wf.statuses as RawStatus[]),
});

export const defaultConfig: Config = {
  initialReleaseCount: raw.initialReleaseCount,
  advanceProbability: raw.advanceProbability,
  childrenPerParent: raw.childrenPerParent,
  workflows: {
    L2: buildWorkflow(raw.workflows.L2),
    L1: buildWorkflow(raw.workflows.L1),
    L0: buildWorkflow(raw.workflows.L0),
  },
};
