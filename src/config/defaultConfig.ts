import type { Config, Status, WorkitemLevel } from "../domain/types";
import raw from "./defaultConfig.json";

// =====================
// CATEGORY HELPER
// =====================

type RawStatus = Omit<Status, "category">;
type RawSimulation = typeof raw.simulations[0];

const assignCategory = (statuses: RawStatus[]): Status[] => {
  const lastId = statuses[statuses.length - 1].id;
  return statuses.map((s) => {
    if (s.streamType === "UPSTREAM") return { ...s, category: "TODO" as const };
    if (s.id === lastId) return { ...s, category: "DONE" as const };
    return { ...s, category: "IN_PROGRESS" as const };
  });
};

// =====================
// BUILD CONFIG FROM SIMULATION
// =====================

const buildWorkflow = (wf: RawSimulation["workflows"]["L2"]) => ({
  id: wf.id,
  name: wf.name,
  level: wf.level as WorkitemLevel,
  workitemName: wf.workitemName,
  statuses: assignCategory(wf.statuses as RawStatus[]),
});

const buildConfig = (sim: RawSimulation): Config => ({
  initialReleaseCount: sim.initialReleaseCount,
  advanceProbability: sim.advanceProbability,
  childrenPerParent: sim.childrenPerParent,
  workflows: {
    L2: buildWorkflow(sim.workflows.L2),
    L1: buildWorkflow(sim.workflows.L1),
    L0: buildWorkflow(sim.workflows.L0),
  },
});

// =====================
// PUBLIC API
// =====================

export const simulationNames: string[] = raw.simulations.map((s) => s.name);
export const defaultSimulationName: string = raw.defaultSimulation;

export const loadSimulation = (name: string): Config => {
  const sim = raw.simulations.find((s) => s.name === name);
  if (!sim) throw new Error(`Simulation "${name}" not found in defaultConfig.json`);
  return buildConfig(sim);
};

export const defaultConfig: Config = loadSimulation(raw.defaultSimulation);
