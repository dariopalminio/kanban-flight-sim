import type { Config, Workflow, WorkitemLevel } from "./types";

export const WORKITEM_LEVELS = ["L3", "L2", "L1", "L0"] as const;

export const isWorkitemLevel = (value: string): value is WorkitemLevel =>
  WORKITEM_LEVELS.some((level) => level === value);

export function configuredLevels(value: unknown, context = "Configuration"): WorkitemLevel[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${context}: workflows must be an object`);
  }
  const keys = Object.keys(value);
  const unknown = keys.find((key) => !isWorkitemLevel(key));
  if (unknown) throw new Error(`${context}: unknown workflow level "${unknown}"`);
  const levels = WORKITEM_LEVELS.filter((level) => keys.includes(level));
  if (levels.length === 0) throw new Error(`${context}: at least one workflow is required`);
  const first = WORKITEM_LEVELS.indexOf(levels[0]);
  const last = WORKITEM_LEVELS.indexOf(levels[levels.length - 1]);
  for (const level of WORKITEM_LEVELS.slice(first, last + 1)) {
    if (!keys.includes(level)) throw new Error(`${context}: missing intermediate workflow ${level}`);
  }
  return levels;
}

export function getConfiguredWorkflows(workflows: Config["workflows"]): Workflow[] {
  return configuredLevels(workflows).map((level) => {
    const workflow = workflows[level];
    if (!workflow || workflow.level !== level) {
      throw new Error(`Configuration: invalid workflow ${level}; level must match its key`);
    }
    return workflow;
  });
}

export function getActiveHierarchy(config: Config) {
  const workflows = getConfiguredWorkflows(config.workflows)
    .filter((wf) => !(config.withoutL0 && wf.level === "L0"));
  const root = workflows[0];
  const leaf = workflows[workflows.length - 1];
  if (!root || !leaf) throw new Error("Configuration: empty active hierarchy");
  return { workflows, root, leaf };
}

export function canToggleL0(workflows: Config["workflows"]): boolean {
  const configured = getConfiguredWorkflows(workflows);
  return configured.some((wf) => wf.level === "L0") && configured.length > 1;
}
