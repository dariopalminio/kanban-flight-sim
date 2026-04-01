import type { Config, SimState, Workitem, Workflow } from "../domain/types";

const WORKITEM_PALETTE: string[] = [
  "#0972b8", "#9b59b6", "#e91e63", "#116874", "#ff9800",
  "#e74c3c", "#e67e22", "#f1c40f", "#086830", "#1abc9c",
];

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

const anyAtOrPastOrder = (wf: Workflow, items: Workitem[], order: number): boolean =>
  items.some((w) => (wf.statuses.find((s) => s.id === w.statusId)?.order ?? 0) >= order);

// Returns the id of the front-of-queue item in the given column.
// Tie-break: earliest position in the items array.
const frontOfQueue = (items: Workitem[], statusId: string): string | undefined => {
  let front: Workitem | undefined;
  for (const w of items) {
    if (w.statusId !== statusId) continue;
    if (!front || w.enteredAt < front.enteredAt) front = w;
  }
  return front?.id;
};

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
// currentTick is used to stamp enteredAt on the new status.
const advanceOrSignal = (
  item: Workitem,
  wf: Workflow,
  wipFn: (from: string, to: string) => boolean,
  prob: number,
  currentTick: number
): Workitem => {
  const status = wf.statuses.find((s) => s.id === item.statusId);
  if (status?.hasReadySignal && !item.isReady) {
    if (!maybe(prob)) return item;
    return { ...item, isReady: true };
  }
  if (!maybe(prob)) return item;
  const next = getNextStatusId(wf, item.statusId);
  if (!wipFn(item.statusId, next)) return item;
  return { ...item, statusId: next, isReady: undefined, enteredAt: currentTick };
};

// Structural key status IDs derived from workflow properties
type WfKeys = {
  commitmentId: string;
  commitmentOrder: number;
  firstDownstreamId: string;
  firstDownstreamOrder: number;
  secondDownstreamId: string;
  secondDownstreamOrder: number;
  deliveryOrder: number;
};

const getWfKeys = (wf: Workflow): WfKeys => {
  const commitment = wf.statuses.find((s) => s.isBeforeCommitmentPoint);
  const downstreamStatuses = wf.statuses
    .filter((s) => s.streamType === "DOWNSTREAM")
    .sort((a, b) => a.order - b.order);
  const firstDownstream = downstreamStatuses[0];
  const secondDownstream = downstreamStatuses[1];
  const delivery = wf.statuses.find((s) => s.isPosDeliveryPoint);
  if (!commitment || !firstDownstream || !secondDownstream || !delivery) {
    throw new Error(
      `Workflow "${wf.id}" is missing commitment, firstDownstream, secondDownstream, or delivery status`
    );
  }
  return {
    commitmentId: commitment.id,
    commitmentOrder: commitment.order,
    firstDownstreamId: firstDownstream.id,
    firstDownstreamOrder: firstDownstream.order,
    secondDownstreamId: secondDownstream.id,
    secondDownstreamOrder: secondDownstream.order,
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
      enteredAt: 0,
      color: WORKITEM_PALETTE[i % WORKITEM_PALETTE.length],
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
  const currentTick = state.tick + 1;

  // --- PASO 1: Advance L0 autonomously (FIFO per column) ---
  const wipL0 = makeWipTracker(wfL0, items);
  // Build front-of-queue set for all L0 columns
  const l0Columns = new Set(items.filter((w) => w.level === "L0").map((w) => w.statusId));
  const l0Fronts = new Set<string>();
  for (const sid of l0Columns) {
    const fid = frontOfQueue(items.filter((w) => w.level === "L0"), sid);
    if (fid) l0Fronts.add(fid);
  }
  items = items.map((w) => {
    if (w.level !== "L0") return w;
    if (getOrder(wfL0, w.statusId) >= keysL0.deliveryOrder) return w;
    if (!l0Fronts.has(w.id)) return w; // FIFO: not the front of queue
    return advanceOrSignal(w, wfL0, wipL0, advanceProbability, currentTick);
  });

  // --- PASO 2: Push L1 to first downstream when any L0 child enters downstream ---
  const wipL1 = makeWipTracker(wfL1, items);
  items = items.map((w) => {
    if (w.level !== "L1") return w;
    if (getOrder(wfL1, w.statusId) >= keysL1.firstDownstreamOrder) return w;
    if (anyInDownstream(wfL0, childrenOf(items, w.id))) {
      if (!wipL1(w.statusId, keysL1.firstDownstreamId)) return w;
      return { ...w, statusId: keysL1.firstDownstreamId, enteredAt: currentTick };
    }
    return w;
  });

  // --- PASO 3: Advance L1 with rules (FIFO for general advancement) ---
  const newL0Children: Workitem[] = [];
  // Front-of-queue for L1 general block: all items not at firstDownstream, secondDownstream, or delivery
  const l1GeneralItems = items.filter((w) => {
    if (w.level !== "L1") return false;
    const o = getOrder(wfL1, w.statusId);
    return o < keysL1.deliveryOrder
      && o !== keysL1.firstDownstreamOrder
      && o !== keysL1.secondDownstreamOrder;
  });
  const l1GeneralColumns = new Set(l1GeneralItems.map((w) => w.statusId));
  const l1GeneralFronts = new Set<string>();
  for (const sid of l1GeneralColumns) {
    const fid = frontOfQueue(l1GeneralItems, sid);
    if (fid) l1GeneralFronts.add(fid);
  }

  items = items.map((w) => {
    if (w.level !== "L1") return w;

    const order = getOrder(wfL1, w.statusId);

    if (order >= keysL1.deliveryOrder) return w;

    if (order === keysL1.firstDownstreamOrder) {
      const myL0 = childrenOf([...items, ...newL0Children], w.id);
      if (anyAtOrPastOrder(wfL0, myL0, keysL0.secondDownstreamOrder)) {
        if (!wipL1(w.statusId, keysL1.secondDownstreamId)) return w;
        return { ...w, statusId: keysL1.secondDownstreamId, enteredAt: currentTick };
      }
      return w;
    }

    if (order === keysL1.secondDownstreamOrder) {
      const myL0 = childrenOf([...items, ...newL0Children], w.id);
      if (allAtDelivery(wfL0, myL0)) {
        if (!w.isReady) return { ...w, isReady: true };
        if (!maybe(advanceProbability)) return w;
        const next = getNextStatusId(wfL1, w.statusId);
        if (!wipL1(w.statusId, next)) return w;
        return { ...w, statusId: next, isReady: undefined, enteredAt: currentTick };
      }
      return w;
    }

    // General advancement (past secondDownstream): FIFO
    if (!l1GeneralFronts.has(w.id)) return w;

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
          newL0Children.push({ id, level: "L0", statusId: wfL0.statuses[0].id, parentId: w.id, enteredAt: currentTick, color: w.color });
        }
      }
    }
    return { ...w, statusId: next, isReady: undefined, enteredAt: currentTick };
  });

  items = [...items, ...newL0Children];

  // --- PASO 4: Push L2 to first downstream when any L1 child enters downstream ---
  const wipL2 = makeWipTracker(wfL2, items);
  items = items.map((w) => {
    if (w.level !== "L2") return w;
    if (getOrder(wfL2, w.statusId) >= keysL2.firstDownstreamOrder) return w;
    if (anyInDownstream(wfL1, childrenOf(items, w.id))) {
      if (!wipL2(w.statusId, keysL2.firstDownstreamId)) return w;
      return { ...w, statusId: keysL2.firstDownstreamId, enteredAt: currentTick };
    }
    return w;
  });

  // --- PASO 5: Advance L2 with rules (FIFO for general advancement) ---
  const newL1Children: Workitem[] = [];
  const l2GeneralItems = items.filter((w) => {
    if (w.level !== "L2") return false;
    const o = getOrder(wfL2, w.statusId);
    return o < keysL2.deliveryOrder
      && o !== keysL2.firstDownstreamOrder
      && o !== keysL2.secondDownstreamOrder;
  });
  const l2GeneralColumns = new Set(l2GeneralItems.map((w) => w.statusId));
  const l2GeneralFronts = new Set<string>();
  for (const sid of l2GeneralColumns) {
    const fid = frontOfQueue(l2GeneralItems, sid);
    if (fid) l2GeneralFronts.add(fid);
  }

  items = items.map((w) => {
    if (w.level !== "L2") return w;

    const order = getOrder(wfL2, w.statusId);

    if (order >= keysL2.deliveryOrder) return w;

    if (order === keysL2.firstDownstreamOrder) {
      const myL1 = childrenOf([...items, ...newL1Children], w.id);
      if (anyAtOrPastOrder(wfL1, myL1, keysL1.secondDownstreamOrder)) {
        if (!wipL2(w.statusId, keysL2.secondDownstreamId)) return w;
        return { ...w, statusId: keysL2.secondDownstreamId, enteredAt: currentTick };
      }
      return w;
    }

    if (order === keysL2.secondDownstreamOrder) {
      const myL1 = childrenOf([...items, ...newL1Children], w.id);
      if (allAtDelivery(wfL1, myL1)) {
        if (!w.isReady) return { ...w, isReady: true };
        if (!maybe(advanceProbability)) return w;
        const next = getNextStatusId(wfL2, w.statusId);
        if (!wipL2(w.statusId, next)) return w;
        return { ...w, statusId: next, isReady: undefined, enteredAt: currentTick };
      }
      return w;
    }

    // General advancement (past secondDownstream): FIFO
    if (!l2GeneralFronts.has(w.id)) return w;

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
          newL1Children.push({ id, level: "L1", statusId: wfL1.statuses[0].id, parentId: w.id, enteredAt: currentTick, color: w.color });
        }
      }
    }
    return { ...w, statusId: next, isReady: undefined, enteredAt: currentTick };
  });

  items = [...items, ...newL1Children];

  // --- PASO 6: Push L3 to first downstream when any L2 child enters downstream ---
  const wipL3 = makeWipTracker(wfL3, items);
  items = items.map((w) => {
    if (w.level !== "L3") return w;
    if (getOrder(wfL3, w.statusId) >= keysL3.firstDownstreamOrder) return w;
    if (anyInDownstream(wfL2, childrenOf(items, w.id))) {
      if (!wipL3(w.statusId, keysL3.firstDownstreamId)) return w;
      return { ...w, statusId: keysL3.firstDownstreamId, enteredAt: currentTick };
    }
    return w;
  });

  // --- PASO 7: Advance L3 with rules (FIFO for general advancement) ---
  const newL2Children: Workitem[] = [];
  const l3GeneralItems = items.filter((w) => {
    if (w.level !== "L3") return false;
    const o = getOrder(wfL3, w.statusId);
    return o < keysL3.deliveryOrder
      && o !== keysL3.firstDownstreamOrder
      && o !== keysL3.secondDownstreamOrder;
  });
  const l3GeneralColumns = new Set(l3GeneralItems.map((w) => w.statusId));
  const l3GeneralFronts = new Set<string>();
  for (const sid of l3GeneralColumns) {
    const fid = frontOfQueue(l3GeneralItems, sid);
    if (fid) l3GeneralFronts.add(fid);
  }

  items = items.map((w) => {
    if (w.level !== "L3") return w;

    const order = getOrder(wfL3, w.statusId);

    if (order >= keysL3.deliveryOrder) return w;

    if (order === keysL3.firstDownstreamOrder) {
      const myL2 = childrenOf([...items, ...newL2Children], w.id);
      if (anyAtOrPastOrder(wfL2, myL2, keysL2.secondDownstreamOrder)) {
        if (!wipL3(w.statusId, keysL3.secondDownstreamId)) return w;
        return { ...w, statusId: keysL3.secondDownstreamId, enteredAt: currentTick };
      }
      return w;
    }

    if (order === keysL3.secondDownstreamOrder) {
      const myL2 = childrenOf([...items, ...newL2Children], w.id);
      if (allAtDelivery(wfL2, myL2)) {
        if (!w.isReady) return { ...w, isReady: true };
        if (!maybe(advanceProbability)) return w;
        const next = getNextStatusId(wfL3, w.statusId);
        if (!wipL3(w.statusId, next)) return w;
        return { ...w, statusId: next, isReady: undefined, enteredAt: currentTick };
      }
      return w;
    }

    // General advancement (past secondDownstream): FIFO
    if (!l3GeneralFronts.has(w.id)) return w;

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
          newL2Children.push({ id, level: "L2", statusId: wfL2.statuses[0].id, parentId: w.id, enteredAt: currentTick, color: w.color });
        }
      }
    }
    return { ...w, statusId: next, isReady: undefined, enteredAt: currentTick };
  });

  items = [...items, ...newL2Children];

  // --- PASO 8: Inject new L3 demand item (respects wipLimit of first status) ---
  if (demandInterval > 0 && currentTick % demandInterval === 0) {
    const firstStatus = wfL3.statuses[0];
    const currentCount = items.filter((w) => w.statusId === firstStatus.id).length;
    if (firstStatus.wipLimit == null || currentCount < firstStatus.wipLimit) {
      const [id, newCounters] = nextId(counters, "L3", wfL3.workitemName);
      counters = newCounters;
      items = [...items, { id, level: "L3" as const, statusId: firstStatus.id, enteredAt: currentTick, color: WORKITEM_PALETTE[(newCounters.L3 - 1) % WORKITEM_PALETTE.length] }];
    }
  }

  return {
    tick: currentTick,
    idCounters: counters,
    workitems: items,
  };
};
