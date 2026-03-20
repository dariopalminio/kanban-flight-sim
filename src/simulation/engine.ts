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
  items.every((w) => wf.statuses.find((s) => s.id === w.statusId)?.isPosDeliveryPoint === true);

const anyInDownstream = (wf: Workflow, items: Workitem[]): boolean =>
  items.some((w) => wf.statuses.find((s) => s.id === w.statusId)?.streamType === "DOWNSTREAM");

// Mutable WIP tracker: initialized from current items snapshot.
// Each approved transition increments the target count so within-step
// collisions are prevented.
const makeWipTracker = (wf: Workflow, items: Workitem[]) => {
  const counts: Record<string, number> = {};
  for (const w of items) counts[w.statusId] = (counts[w.statusId] ?? 0) + 1;
  return (fromId: string, toId: string): boolean => {
    const toStatus = wf.statuses.find((s) => s.id === toId);
    if (toStatus?.wipLimit == null) return true;
    if ((counts[toId] ?? 0) >= toStatus.wipLimit) return false;
    counts[toId] = (counts[toId] ?? 0) + 1;
    counts[fromId] = (counts[fromId] ?? 0) - 1;
    return true;
  };
};

// Two-phase advancement for statuses with hasReadySignal:
//   Phase 1: !isReady → mark isReady:true (stays in same status)
//   Phase 2:  isReady → advance to next status (clears isReady)
// For statuses without hasReadySignal: advances normally in one step.
const advanceOrSignal = (
  item: Workitem,
  wf: Workflow,
  wipFn: (from: string, to: string) => boolean,
  prob: number
): Workitem => {
  const status = wf.statuses.find((s) => s.id === item.statusId);
  if (status?.hasReadySignal && !item.isReady) {
    if (!maybe(prob)) return item;
    return { ...item, isReady: true };
  }
  if (!maybe(prob)) return item;
  const next = getNextStatusId(wf, item.statusId);
  if (!wipFn(item.statusId, next)) return item;
  return { ...item, statusId: next, isReady: undefined };
};

// Structural key status IDs derived from workflow properties
type WfKeys = {
  commitmentId: string;
  commitmentOrder: number;
  firstDownstreamId: string;
  firstDownstreamOrder: number;
  deliveryOrder: number;
};

const getWfKeys = (wf: Workflow): WfKeys => {
  const commitment = wf.statuses.find((s) => s.isBeforeCommitmentPoint);
  const firstDownstream = wf.statuses.find((s) => s.streamType === "DOWNSTREAM");
  const delivery = wf.statuses.find((s) => s.isPosDeliveryPoint);
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

const idPrefix = (workitemName: string): string =>
  workitemName.slice(0, 4).toUpperCase();

const nextId = (
  counters: SimState["idCounters"],
  level: "L0" | "L1" | "L2" | "L3",
  workitemName: string,
  parentId?: string
): [string, SimState["idCounters"]] => {
  const n = counters[level] + 1;
  const base = `${idPrefix(workitemName)}-${n}`;
  const id = parentId ? `${base}p${parentId.split("p")[0]}` : base;
  return [id, { ...counters, [level]: n }];
};

// =====================
// BUILD INITIAL STATE
// =====================

export const buildInitialState = (config: Config): SimState => {
  const prefix = idPrefix(config.workflows.L3.workitemName);
  return {
    tick: 0,
    idCounters: { L0: 0, L1: 0, L2: 0, L3: config.initialReleaseCount },
    workitems: Array.from({ length: config.initialReleaseCount }, (_, i) => ({
      id: `${prefix}-${i + 1}`,
      level: "L3" as const,
      statusId: config.workflows.L3.statuses[0].id,
    })),
  };
};

// =====================
// TICK — pure function
// =====================

export const tick = (state: SimState, config: Config): SimState => {
  const { workflows, advanceProbability, childrenPerParent, demandInterval } = config;
  const wfL3 = workflows.L3;
  const wfL2 = workflows.L2;
  const wfL1 = workflows.L1;
  const wfL0 = workflows.L0;

  const keysL3 = getWfKeys(wfL3);
  const keysL2 = getWfKeys(wfL2);
  const keysL1 = getWfKeys(wfL1);
  const keysL0 = getWfKeys(wfL0);

  let items = state.workitems.map((w) => ({ ...w }));
  let counters = { ...state.idCounters };

  // --- PASO 1: Advance L0 autonomously ---
  const wipL0 = makeWipTracker(wfL0, items);
  items = items.map((w) => {
    if (w.level !== "L0") return w;
    if (getOrder(wfL0, w.statusId) >= keysL0.deliveryOrder) return w;
    return advanceOrSignal(w, wfL0, wipL0, advanceProbability);
  });

  // --- PASO 2: Push L1 to first downstream when any L0 child enters downstream ---
  const wipL1 = makeWipTracker(wfL1, items);
  items = items.map((w) => {
    if (w.level !== "L1") return w;
    if (getOrder(wfL1, w.statusId) >= keysL1.firstDownstreamOrder) return w;
    if (anyInDownstream(wfL0, childrenOf(items, w.id))) {
      if (!wipL1(w.statusId, keysL1.firstDownstreamId)) return w;
      return { ...w, statusId: keysL1.firstDownstreamId };
    }
    return w;
  });

  // --- PASO 3: Advance L1 with rules ---
  const newL0Children: Workitem[] = [];

  items = items.map((w) => {
    if (w.level !== "L1") return w;

    const order = getOrder(wfL1, w.statusId);

    if (order >= keysL1.deliveryOrder) return w;

    if (order === keysL1.firstDownstreamOrder) {
      const myL0 = childrenOf([...items, ...newL0Children], w.id);
      if (allAtDelivery(wfL0, myL0)) {
        const next = getNextStatusId(wfL1, w.statusId);
        if (!wipL1(w.statusId, next)) return w;
        return { ...w, statusId: next };
      }
      return w;
    }

    const status = wfL1.statuses.find((s) => s.id === w.statusId);
    if (status?.hasReadySignal && !w.isReady) {
      return maybe(advanceProbability) ? { ...w, isReady: true } : w;
    }
    if (!maybe(advanceProbability)) return w;
    const next = getNextStatusId(wfL1, w.statusId);
    if (!wipL1(w.statusId, next)) return w;
    if (w.statusId === keysL1.commitmentId) {
      const hasChildren = items.some((x) => x.parentId === w.id && x.level === "L0");
      if (!hasChildren) {
        for (let i = 0; i < childrenPerParent; i++) {
          const [id, newCounters] = nextId(counters, "L0", wfL0.workitemName, w.id);
          counters = newCounters;
          newL0Children.push({ id, level: "L0", statusId: wfL0.statuses[0].id, parentId: w.id });
        }
      }
    }
    return { ...w, statusId: next, isReady: undefined };
  });

  items = [...items, ...newL0Children];

  // --- PASO 4: Push L2 to first downstream when any L1 child enters downstream ---
  const wipL2 = makeWipTracker(wfL2, items);
  items = items.map((w) => {
    if (w.level !== "L2") return w;
    if (getOrder(wfL2, w.statusId) >= keysL2.firstDownstreamOrder) return w;
    if (anyInDownstream(wfL1, childrenOf(items, w.id))) {
      if (!wipL2(w.statusId, keysL2.firstDownstreamId)) return w;
      return { ...w, statusId: keysL2.firstDownstreamId };
    }
    return w;
  });

  // --- PASO 5: Advance L2 with rules ---
  const newL1Children: Workitem[] = [];

  items = items.map((w) => {
    if (w.level !== "L2") return w;

    const order = getOrder(wfL2, w.statusId);

    if (order >= keysL2.deliveryOrder) return w;

    if (order === keysL2.firstDownstreamOrder) {
      const myL1 = childrenOf([...items, ...newL1Children], w.id);
      if (allAtDelivery(wfL1, myL1)) {
        const next = getNextStatusId(wfL2, w.statusId);
        if (!wipL2(w.statusId, next)) return w;
        return { ...w, statusId: next };
      }
      return w;
    }

    const status = wfL2.statuses.find((s) => s.id === w.statusId);
    if (status?.hasReadySignal && !w.isReady) {
      return maybe(advanceProbability) ? { ...w, isReady: true } : w;
    }
    if (!maybe(advanceProbability)) return w;
    const next = getNextStatusId(wfL2, w.statusId);
    if (!wipL2(w.statusId, next)) return w;
    if (w.statusId === keysL2.commitmentId) {
      const hasChildren = items.some((x) => x.parentId === w.id && x.level === "L1");
      if (!hasChildren) {
        for (let i = 0; i < childrenPerParent; i++) {
          const [id, newCounters] = nextId(counters, "L1", wfL1.workitemName, w.id);
          counters = newCounters;
          newL1Children.push({ id, level: "L1", statusId: wfL1.statuses[0].id, parentId: w.id });
        }
      }
    }
    return { ...w, statusId: next, isReady: undefined };
  });

  items = [...items, ...newL1Children];

  // --- PASO 6: Push L3 to first downstream when any L2 child enters downstream ---
  const wipL3 = makeWipTracker(wfL3, items);
  items = items.map((w) => {
    if (w.level !== "L3") return w;
    if (getOrder(wfL3, w.statusId) >= keysL3.firstDownstreamOrder) return w;
    if (anyInDownstream(wfL2, childrenOf(items, w.id))) {
      if (!wipL3(w.statusId, keysL3.firstDownstreamId)) return w;
      return { ...w, statusId: keysL3.firstDownstreamId };
    }
    return w;
  });

  // --- PASO 7: Advance L3 with rules ---
  const newL2Children: Workitem[] = [];

  items = items.map((w) => {
    if (w.level !== "L3") return w;

    const order = getOrder(wfL3, w.statusId);

    if (order >= keysL3.deliveryOrder) return w;

    if (order === keysL3.firstDownstreamOrder) {
      const myL2 = childrenOf([...items, ...newL2Children], w.id);
      if (allAtDelivery(wfL2, myL2)) {
        const next = getNextStatusId(wfL3, w.statusId);
        if (!wipL3(w.statusId, next)) return w;
        return { ...w, statusId: next };
      }
      return w;
    }

    const status = wfL3.statuses.find((s) => s.id === w.statusId);
    if (status?.hasReadySignal && !w.isReady) {
      return maybe(advanceProbability) ? { ...w, isReady: true } : w;
    }
    if (!maybe(advanceProbability)) return w;
    const next = getNextStatusId(wfL3, w.statusId);
    if (!wipL3(w.statusId, next)) return w;
    if (w.statusId === keysL3.commitmentId) {
      const hasChildren = items.some((x) => x.parentId === w.id && x.level === "L2");
      if (!hasChildren) {
        for (let i = 0; i < childrenPerParent; i++) {
          const [id, newCounters] = nextId(counters, "L2", wfL2.workitemName, w.id);
          counters = newCounters;
          newL2Children.push({ id, level: "L2", statusId: wfL2.statuses[0].id, parentId: w.id });
        }
      }
    }
    return { ...w, statusId: next, isReady: undefined };
  });

  items = [...items, ...newL2Children];

  // --- PASO 8: Inject new L3 demand item ---
  const nextTick = state.tick + 1;
  if (demandInterval > 0 && nextTick % demandInterval === 0) {
    const [id, newCounters] = nextId(counters, "L3", wfL3.workitemName);
    counters = newCounters;
    items = [...items, { id, level: "L3" as const, statusId: wfL3.statuses[0].id }];
  }

  return {
    tick: nextTick,
    idCounters: counters,
    workitems: items,
  };
};
