import type { Config, Status, WorkitemLevel } from "../domain/types";
import rawString from "./defaultConfig.json?raw";

// =====================
// CATEGORY HELPER
// =====================

type RawStatus = Omit<Status, "category" | "wipLimit"> & { wipLimit?: number };

interface RawWorkflow {
  id: string;
  name: string;
  level: string;
  workitemName: string;
  statuses: RawStatus[];
}

interface RawSimulation {
  name: string;
  initialReleaseCount: number;
  advanceProbability: number;
  childrenPerParent: number;
  demandInterval?: number;
  workflows: { L3: RawWorkflow; L2: RawWorkflow; L1: RawWorkflow; L0: RawWorkflow };
}

interface RawConfig {
  defaultSimulation: string;
  simulations: RawSimulation[];
}

const assignCategory = (statuses: RawStatus[]): Status[] => {
  const lastId = statuses[statuses.length - 1].id;
  return statuses.map((s) => {
    const category = s.streamType === "UPSTREAM" ? "TODO" as const
      : s.id === lastId ? "DONE" as const
      : "IN_PROGRESS" as const;
    return { ...s, category, wipLimit: s.wipLimit };
  });
};

// =====================
// BUILD CONFIG FROM SIMULATION
// =====================

const buildWorkflow = (wf: RawWorkflow) => ({
  id: wf.id,
  name: wf.name,
  level: wf.level as WorkitemLevel,
  workitemName: wf.workitemName,
  statuses: assignCategory(wf.statuses),
});

const buildConfig = (sim: RawSimulation): Config => ({
  initialReleaseCount: sim.initialReleaseCount,
  advanceProbability: sim.advanceProbability,
  childrenPerParent: sim.childrenPerParent,
  demandInterval: sim.demandInterval ?? 0,
  workflows: {
    L3: buildWorkflow(sim.workflows.L3),
    L2: buildWorkflow(sim.workflows.L2),
    L1: buildWorkflow(sim.workflows.L1),
    L0: buildWorkflow(sim.workflows.L0),
  },
});

// =====================
// PARSE JSON — never throw at module level; errors are deferred to loadSimulation()
// which is called during React render and caught by ErrorBoundary.
// =====================

let _raw: RawConfig = { defaultSimulation: "", simulations: [] };
let _parseError: string | undefined;

try {
  _raw = JSON.parse(rawString) as RawConfig;
} catch (e) {
  _parseError = `defaultConfig.json tiene formato JSON inválido: ${(e as Error).message}`;
}

// =====================
// PUBLIC API
// =====================

export const simulationNames: string[] = _raw.simulations.map((s) => s.name);
export const defaultSimulationName: string = _raw.defaultSimulation;

export const loadSimulation = (name: string): Config => {
  if (_parseError) throw new Error(_parseError);
  const sim = _raw.simulations.find((s) => s.name === name);
  if (!sim) throw new Error(`Simulation "${name}" not found in defaultConfig.json`);
  return buildConfig(sim);
};

export const configLoadResult: { config: Config | null; error?: string } = (() => {
  if (_parseError) return { config: null, error: _parseError };
  if (_raw.simulations.length === 0) {
    return { config: null, error: "defaultConfig.json no contiene simulaciones." };
  }
  const first = _raw.simulations[0];
  const target = _raw.simulations.find((s) => s.name === _raw.defaultSimulation) ?? first;
  const error =
    target === first && _raw.defaultSimulation !== first.name
      ? `Simulation "${_raw.defaultSimulation}" not found; using "${first.name}" as fallback.`
      : undefined;
  return { config: buildConfig(target), error };
})();

export const defaultConfig: Config | null = configLoadResult.config;
