import type { Config, Status, StatusCategory, WorkitemLevel } from "../domain/types";
import rootJson from "./defaultConfig.json";

// =====================
// CATEGORY HELPER
// =====================

type RawStatus = Omit<Status, "category" | "wipLimit"> & { statusCategory: StatusCategory; wipLimit?: number };

interface RawWorkflow {
  id: string;
  name: string;
  level: string;
  workitemName: string;
  statuses: RawStatus[];
}

interface RawModel {
  name: string;
  initialReleaseCount: number;
  advanceProbability: number;
  childrenPerParent: number;
  demandInterval?: number;
  workflows: { L3: RawWorkflow; L2: RawWorkflow; L1: RawWorkflow; L0: RawWorkflow };
}

interface RawRootConfig {
  defaultModel: string;
}

// =====================
// BUILD CONFIG FROM MODEL
// =====================

const buildWorkflow = (wf: RawWorkflow) => ({
  id: wf.id,
  name: wf.name,
  level: wf.level as WorkitemLevel,
  workitemName: wf.workitemName,
  statuses: wf.statuses.map((s) => ({ ...s })),
});

const buildConfig = (model: RawModel): Config => ({
  initialReleaseCount: model.initialReleaseCount,
  advanceProbability: model.advanceProbability,
  childrenPerParent: model.childrenPerParent,
  demandInterval: model.demandInterval ?? 0,
  workflows: {
    L3: buildWorkflow(model.workflows.L3),
    L2: buildWorkflow(model.workflows.L2),
    L1: buildWorkflow(model.workflows.L1),
    L0: buildWorkflow(model.workflows.L0),
  },
});

// =====================
// LOAD ALL MODEL FILES VIA GLOB
// Models are sorted alphabetically by filename for deterministic order.
// =====================

const _root = rootJson as RawRootConfig;

let _models: RawModel[] = [];
let _parseError: string | undefined;

try {
  const modules = import.meta.glob<{ default: RawModel }>("./models/*.json", { eager: true });
  _models = Object.keys(modules)
    .sort()
    .map((key) => modules[key].default);
  if (_models.length === 0) {
    _parseError = "No se encontraron modelos en src/config/models/. Agrega al menos un archivo *.json.";
  }
} catch (e) {
  _parseError = `Error al cargar modelos de simulación: ${(e as Error).message}`;
}

// =====================
// PUBLIC API
// =====================

export const simulationNames: string[] = _models.map((m) => m.name);
export const defaultSimulationName: string = _root.defaultModel;

export const loadSimulation = (name: string): Config => {
  if (_parseError) throw new Error(_parseError);
  const model = _models.find((m) => m.name === name);
  if (!model) throw new Error(`Simulation "${name}" not found in src/config/models/`);
  return buildConfig(model);
};

export const configLoadResult: { config: Config | null; error?: string } = (() => {
  if (_parseError) return { config: null, error: _parseError };
  if (_models.length === 0) {
    return { config: null, error: "No se encontraron modelos de simulación." };
  }
  const first = _models[0];
  const target = _models.find((m) => m.name === _root.defaultModel) ?? first;
  const error =
    target === first && _root.defaultModel !== first.name
      ? `Simulation "${_root.defaultModel}" not found; using "${first.name}" as fallback.`
      : undefined;
  return { config: buildConfig(target), error };
})();

export const defaultConfig: Config | null = configLoadResult.config;
