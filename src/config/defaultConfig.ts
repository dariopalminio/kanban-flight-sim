import type { Config } from "../domain/types";
import { buildConfig, getModelName } from "./modelConfig";
import rootJson from "./defaultConfig.json";

let models: { name: string; value: unknown }[] = [];
let parseError: string | undefined;

try {
  const modules = import.meta.glob<{ default: unknown }>("./models/*.json", { eager: true });
  models = Object.keys(modules)
    .sort()
    .map((key) => ({
      name: getModelName(modules[key].default, `Model file "${key}"`),
      value: modules[key].default,
    }));
  if (models.length === 0) {
    parseError = "No se encontraron modelos en src/config/models/. Agrega al menos un archivo *.json.";
  }
} catch (e) {
  parseError = `Error al cargar modelos de simulacion: ${e instanceof Error ? e.message : String(e)}`;
}

export const simulationNames: string[] = models.map((model) => model.name);
export const defaultSimulationName: string = rootJson.defaultModel;

export const loadSimulation = (name: string): Config => {
  if (parseError) throw new Error(parseError);
  const model = models.find((model) => model.name === name);
  if (!model) throw new Error(`Simulation "${name}" not found in src/config/models/`);
  return buildConfig(model.value);
};

export const configLoadResult: { config: Config | null; error?: string } = (() => {
  if (parseError) return { config: null, error: parseError };
  if (models.length === 0) {
    return { config: null, error: "No se encontraron modelos de simulacion." };
  }
  const first = models[0];
  const target = models.find((model) => model.name === rootJson.defaultModel) ?? first;
  const error =
    target === first && rootJson.defaultModel !== first.name
      ? `Simulation "${rootJson.defaultModel}" not found; using "${first.name}" as fallback.`
      : undefined;
  try {
    return { config: buildConfig(target.value), error };
  } catch (e) {
    return { config: null, error: e instanceof Error ? e.message : String(e) };
  }
})();

export const defaultConfig: Config | null = configLoadResult.config;
