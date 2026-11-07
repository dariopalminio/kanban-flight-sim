import type { Config, Status, Workflow, WorkitemLevel } from "../domain/types";
import { configuredLevels } from "../domain/hierarchy";

const record = (value: unknown, context: string): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${context} must be an object`);
  }
  return value as Record<string, unknown>;
};

const text = (value: unknown, context: string): string => {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${context} must be a non-empty string`);
  return value;
};

const number = (value: unknown, context: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${context} must be a finite number`);
  return value;
};

const boolean = (value: unknown, context: string): boolean => {
  if (typeof value !== "boolean") throw new Error(`${context} must be a boolean`);
  return value;
};

function buildStatus(value: unknown, context: string): Status {
  const raw = record(value, context);
  const streamType = raw.streamType;
  const statusCategory = raw.statusCategory;
  if (streamType !== "UPSTREAM" && streamType !== "DOWNSTREAM") {
    throw new Error(`${context}.streamType must be UPSTREAM or DOWNSTREAM`);
  }
  if (statusCategory !== "TODO" && statusCategory !== "IN_PROGRESS" && statusCategory !== "DONE") {
    throw new Error(`${context}.statusCategory must be TODO, IN_PROGRESS or DONE`);
  }
  const status: Status = {
    id: text(raw.id, `${context}.id`),
    name: text(raw.name, `${context}.name`),
    order: number(raw.order, `${context}.order`),
    streamType, statusCategory,
    isBeforeCommitmentPoint: boolean(raw.isBeforeCommitmentPoint, `${context}.isBeforeCommitmentPoint`),
    isPosDeliveryPoint: boolean(raw.isPosDeliveryPoint, `${context}.isPosDeliveryPoint`),
  };
  if (raw.wipLimit !== undefined) {
    status.wipLimit = number(raw.wipLimit, `${context}.wipLimit`);
    if (!Number.isInteger(status.wipLimit) || status.wipLimit < 0) {
      throw new Error(`${context}.wipLimit must be a non-negative integer`);
    }
  }
  for (const field of ["hasReadySignal", "isBuffer"] as const) {
    if (raw[field] !== undefined) status[field] = boolean(raw[field], `${context}.${field}`);
  }
  for (const field of ["description", "definitionOfDone"] as const) {
    if (raw[field] !== undefined) {
      if (typeof raw[field] !== "string") throw new Error(`${context}.${field} must be a string`);
      status[field] = raw[field];
    }
  }
  return status;
}

function buildWorkflow(value: unknown, level: WorkitemLevel, context: string): Workflow {
  const raw = record(value, context);
  if (raw.level !== level) throw new Error(`${context}.level must match ${level}`);
  if (!Array.isArray(raw.statuses) || raw.statuses.length === 0) {
    throw new Error(`${context}.statuses must be a non-empty array`);
  }
  const statuses = raw.statuses.map((value, index) => buildStatus(value, `${context}.statuses[${index}]`));
  if (statuses.some((status, index) => !Number.isInteger(status.order) ||
    (index > 0 && status.order !== statuses[index - 1].order + 1))) {
    throw new Error(`${context}.statuses orders must be consecutive and ascending`);
  }
  if (!statuses.some((s) => s.isBeforeCommitmentPoint) ||
    statuses.filter((s) => s.streamType === "DOWNSTREAM").length < 2 ||
    !statuses.some((s) => s.isPosDeliveryPoint)) {
    throw new Error(`${context}: missing commitment, firstDownstream, secondDownstream, or delivery status`);
  }
  return {
    id: text(raw.id, `${context}.id`),
    name: text(raw.name, `${context}.name`),
    workitemName: text(raw.workitemName, `${context}.workitemName`),
    level, statuses,
  };
}

export function getModelName(value: unknown, context = "Model"): string {
  return text(record(value, context).name, `${context}.name`);
}

export function buildConfig(value: unknown): Config {
  const raw = record(value, "Model");
  const name = text(raw.name, "Model.name");
  const context = `Model "${name}"`;
  const levels = configuredLevels(raw.workflows, context);
  const rawWorkflows = record(raw.workflows, `${context}.workflows`);
  const workflows: Config["workflows"] = {};
  for (const level of levels) workflows[level] = buildWorkflow(rawWorkflows[level], level, `${context}.${level}`);
  return {
    initialReleaseCount: number(raw.initialReleaseCount, `${context}.initialReleaseCount`),
    advanceProbability: number(raw.advanceProbability, `${context}.advanceProbability`),
    childrenPerParent: number(raw.childrenPerParent, `${context}.childrenPerParent`),
    demandInterval: raw.demandInterval === undefined ? 0 : number(raw.demandInterval, `${context}.demandInterval`),
    workflows,
  };
}
