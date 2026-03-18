import type { Config, SimState, Workitem, Workflow } from "../domain/types";

// =====================
// HELPERS
// =====================

const maybe = (p: number) => Math.random() < p;

const getNextStatusId = (wf: Workflow, statusId: string): string => {
  const current = wf.statuses.find((s) => s.id === statusId);
  if (!current) return statusId;
  const next = wf.statuses.find((s) => s.order === current.order + 1);
  return next ? next.id : statusId;
};

const getOrder = (wf: Workflow, statusId: string): number =>
  wf.statuses.find((s) => s.id === statusId)?.order ?? 0;

const childrenOf = (items: Workitem[], parentId: string): Workitem[] =>
  items.filter((w) => w.parentId === parentId);

const allAtDelivery = (wf: Workflow, items: Workitem[]): boolean =>
  items.length > 0 &&
  items.every((w) => wf.statuses.find((s) => s.id === w.statusId)?.isDeliveryPoint === true);

const anyInDownstream = (wf: Workflow, items: Workitem[]): boolean =>
  items.some((w) => wf.statuses.find((s) => s.id === w.statusId)?.streamType === "DOWNSTREAM");

// Structural key status IDs derived from workflow properties
type WfKeys = {
  commitmentId: string;
  commitmentOrder: number;
  firstDownstreamId: string;
  firstDownstreamOrder: number;
  deliveryOrder: number;
};

const getWfKeys = (wf: Workflow): WfKeys => {
  const commitment = wf.statuses.find((s) => s.isCommitmentPoint);
  const firstDownstream = wf.statuses.find((s) => s.streamType === "DOWNSTREAM");
  const delivery = wf.statuses.find((s) => s.isDeliveryPoint);
  if (!commitment || !firstDownstream || !delivery) {
    throw new Error(`Workflow "${wf.id}" is missing commitment, firstDownstream, or delivery status`);
  }
  return {
    commitmentId: commitment.id,
    commitmentOrder: commitment.order,
    firstDownstreamId: firstDownstream.id,
    firstDownstreamOrder: firstDownstream.order,
    deliveryOrder: delivery.order,
  };
};

const nextId = (
  counters: SimState["idCounters"],
  level: "L0" | "L1" | "L2"
): [string, SimState["idCounters"]] => {
  const prefix = level === "L2" ? "RELE" : level === "L1" ? "FEAT" : "SPEC";
  const n = counters[level] + 1;
  return [`${prefix}-${n}`, { ...counters, [level]: n }];
};

// =====================
// BUILD INITIAL STATE
// =====================

export const buildInitialState = (config: Config): SimState => ({
  tick: 0,
  idCounters: { L0: 0, L1: 0, L2: config.initialReleaseCount },
  workitems: Array.from({ length: config.initialReleaseCount }, (_, i) => ({
    id: `RELE-${i + 1}`,
    level: "L2" as const,
    statusId: config.workflows.L2.statuses[0].id,
  })),
});

// =====================
// TICK — pure function
// =====================

export const tick = (state: SimState, config: Config): SimState => {
  const { workflows, advanceProbability, childrenPerParent } = config;
  const wfL2 = workflows.L2; // top level (Release)
  const wfL1 = workflows.L1; // mid level (Feat)
  const wfL0 = workflows.L0; // leaf level (Spec)

  const keysL2 = getWfKeys(wfL2);
  const keysL1 = getWfKeys(wfL1);
  const keysL0 = getWfKeys(wfL0);

  let items = state.workitems.map((w) => ({ ...w }));
  let counters = { ...state.idCounters };

  // --- PASO 1: Advance L0 autonomously ---
  items = items.map((w) => {
    if (w.level !== "L0") return w;
    if (getOrder(wfL0, w.statusId) >= keysL0.deliveryOrder) return w;
    if (!maybe(advanceProbability)) return w;
    return { ...w, statusId: getNextStatusId(wfL0, w.statusId) };
  });

  // --- PASO 2: Push L1 to first downstream when any L0 child enters downstream ---
  items = items.map((w) => {
    if (w.level !== "L1") return w;
    if (getOrder(wfL1, w.statusId) >= keysL1.firstDownstreamOrder) return w;
    if (anyInDownstream(wfL0, childrenOf(items, w.id))) {
      return { ...w, statusId: keysL1.firstDownstreamId };
    }
    return w;
  });

  // --- PASO 3: Advance L1 with rules ---
  const newL0Children: Workitem[] = [];

  items = items.map((w) => {
    if (w.level !== "L1") return w;

    const order = getOrder(wfL1, w.statusId);

    // At delivery: stop
    if (order >= keysL1.deliveryOrder) return w;

    // At first downstream: blocked until all L0 children at delivery
    if (order === keysL1.firstDownstreamOrder) {
      const myL0 = childrenOf([...items, ...newL0Children], w.id);
      if (allAtDelivery(wfL0, myL0)) {
        return { ...w, statusId: getNextStatusId(wfL1, w.statusId) };
      }
      return w;
    }

    // At commitment: spawn L0 children if not yet created
    if (w.statusId === keysL1.commitmentId) {
      const hasChildren = items.some((x) => x.parentId === w.id && x.level === "L0");
      if (!hasChildren) {
        for (let i = 0; i < childrenPerParent; i++) {
          const [id, newCounters] = nextId(counters, "L0");
          counters = newCounters;
          newL0Children.push({ id, level: "L0", statusId: wfL0.statuses[0].id, parentId: w.id });
        }
      }
    }

    // Autonomous advance (upstream or downstream after first downstream)
    if (!maybe(advanceProbability)) return w;
    return { ...w, statusId: getNextStatusId(wfL1, w.statusId) };
  });

  items = [...items, ...newL0Children];

  // --- PASO 4: Push L2 to first downstream when any L1 child enters downstream ---
  items = items.map((w) => {
    if (w.level !== "L2") return w;
    if (getOrder(wfL2, w.statusId) >= keysL2.firstDownstreamOrder) return w;
    if (anyInDownstream(wfL1, childrenOf(items, w.id))) {
      return { ...w, statusId: keysL2.firstDownstreamId };
    }
    return w;
  });

  // --- PASO 5: Advance L2 with rules ---
  const newL1Children: Workitem[] = [];

  items = items.map((w) => {
    if (w.level !== "L2") return w;

    const order = getOrder(wfL2, w.statusId);

    // At delivery: stop
    if (order >= keysL2.deliveryOrder) return w;

    // At first downstream: blocked until all L1 children at delivery
    if (order === keysL2.firstDownstreamOrder) {
      const myL1 = childrenOf([...items, ...newL1Children], w.id);
      if (allAtDelivery(wfL1, myL1)) {
        return { ...w, statusId: getNextStatusId(wfL2, w.statusId) };
      }
      return w;
    }

    // At commitment: spawn L1 children if not yet created
    if (w.statusId === keysL2.commitmentId) {
      const hasChildren = items.some((x) => x.parentId === w.id && x.level === "L1");
      if (!hasChildren) {
        for (let i = 0; i < childrenPerParent; i++) {
          const [id, newCounters] = nextId(counters, "L1");
          counters = newCounters;
          newL1Children.push({ id, level: "L1", statusId: wfL1.statuses[0].id, parentId: w.id });
        }
      }
    }

    // Autonomous advance (upstream or downstream after first downstream)
    if (!maybe(advanceProbability)) return w;
    return { ...w, statusId: getNextStatusId(wfL2, w.statusId) };
  });

  items = [...items, ...newL1Children];

  return {
    tick: state.tick + 1,
    idCounters: counters,
    workitems: items,
  };
};
