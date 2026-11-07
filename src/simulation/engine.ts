import type { Config, SimState, Workitem, Workflow } from "../domain/types";
import { getActiveHierarchy } from "../domain/hierarchy";

const WORKITEM_PALETTE: string[] = [
  "#0972b8", "#9b59b6", "#e91e63", "#116874", "#ff9800",
  "#e74c3c", "#e67e22", "#f1c40f", "#086830", "#1abc9c",
];

// =====================
// HELPERS
// =====================

const maybe = (p: number) => Math.random() < p;

// Own color for an L2 item: cycles through the palette, skipping its parent's color.
const ownColor = (counter: number, parentColor: string): string => {
  const available = WORKITEM_PALETTE.filter((c) => c !== parentColor);
  return available[(counter - 1) % available.length];
};

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
  const { root } = getActiveHierarchy(config);
  const prefix = idPrefix(root.workitemName);
  return {
    tick: 0,
    idCounters: { L0: 0, L1: 0, L2: 0, L3: 0, [root.level]: config.initialReleaseCount },
    workitems: Array.from({ length: config.initialReleaseCount }, (_, i) => ({
      id: `${prefix}-${i + 1}`,
      level: root.level,
      statusId: root.statuses[0].id,
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
  const { root } = getActiveHierarchy(config);
  const wfL3 = workflows.L3;
  const wfL2 = workflows.L2;
  const wfL1 = workflows.L1;
  const wfL0 = config.withoutL0 ? undefined : workflows.L0;

  const keysL3 = wfL3 && getWfKeys(wfL3);
  const keysL2 = wfL2 && getWfKeys(wfL2);
  const keysL1 = wfL1 && getWfKeys(wfL1);
  const keysL0 = wfL0 && getWfKeys(wfL0);

  let items = state.workitems.map((w) => ({ ...w }));
  let counters = { ...state.idCounters };
  const currentTick = state.tick + 1;

  const levels = {
    L0: { wf: wfL0, keys: keysL0 },
    L1: { wf: wfL1, keys: keysL1 },
    L2: { wf: wfL2, keys: keysL2 },
    L3: { wf: wfL3, keys: keysL3 },
  };

  // Pull rule: an item may start construction only if every ancestor is already there
  // or has room to enter, so a parent's WIP limit holds its children back.
  const ancestorsCanStart = (item: Workitem): boolean => {
    let parent = items.find((x) => x.id === item.parentId);
    while (parent) {
      const { wf, keys } = levels[parent.level];
      if (!wf || !keys) throw new Error(`Inactive ancestor workflow ${parent.level}`);
      if (getOrder(wf, parent.statusId) >= keys.secondDownstreamOrder) return true;
      const limit = wf.statuses.find((s) => s.id === keys.secondDownstreamId)?.wipLimit;
      if (limit != null && items.filter((x) => x.statusId === keys.secondDownstreamId).length >= limit) return false;
      const { parentId } = parent;
      parent = items.find((x) => x.id === parentId);
    }
    return true;
  };

  const advanceLeaf = (wf: Workflow, keys: WfKeys, wip = makeWipTracker(wf, items)) => {
    // Walk right-to-left: process columns in descending order so freed WIP slots are visible immediately
    const columns = [...new Set(items.filter((w) => w.level === wf.level).map((w) => w.statusId))]
      .sort((a, b) => getOrder(wf, b) - getOrder(wf, a));
    for (const sid of columns) {
      if (getOrder(wf, sid) >= keys.deliveryOrder) continue;
      const fid = frontOfQueue(items.filter((w) => w.level === wf.level), sid);
      if (!fid) continue;
      items = items.map((w) => w.id !== fid ? w : advanceOrSignal(
        w,
        wf,
        (from, to) => (to !== keys.secondDownstreamId || ancestorsCanStart(w)) && wip(from, to),
        advanceProbability,
        currentTick
      ));
    }
  };

  // --- PASO 1: Advance active L0 autonomously ---
  if (wfL0 && keysL0) advanceLeaf(wfL0, keysL0);

  // --- PASO 2: Push L1 to first downstream when any L0 child enters downstream ---
  if (wfL1 && keysL1) {
    const wipL1 = makeWipTracker(wfL1, items);
    if (wfL0 && keysL0) {
      items = items.map((w) => {
        if (w.level !== "L1") return w;
        if (getOrder(wfL1, w.statusId) >= keysL1.firstDownstreamOrder) return w;
        if (anyInDownstream(wfL0, childrenOf(items, w.id))) {
          if (!wipL1(w.statusId, keysL1.firstDownstreamId)) return w;
          return { ...w, statusId: keysL1.firstDownstreamId, enteredAt: currentTick };
        }
        return w;
      });

      // --- PASO 3: Advance L1 with rules ---
      const newL0Children: Workitem[] = [];

      // firstDownstream and secondDownstream: hierarchical rules, parallel
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
        return w;
      });

      // General L1 advancement: walk right-to-left
      const l1GeneralColumns = [...new Set(
        items.filter((w) => {
          if (w.level !== "L1") return false;
          const o = getOrder(wfL1, w.statusId);
          if (o >= keysL1.deliveryOrder) return false;
          if (o === keysL1.firstDownstreamOrder || o === keysL1.secondDownstreamOrder) return false;
          return true;
        }).map((w) => w.statusId)
      )].sort((a, b) => getOrder(wfL1, b) - getOrder(wfL1, a));
      for (const sid of l1GeneralColumns) {
        const fid = frontOfQueue(items.filter((w) => w.level === "L1"), sid);
        if (!fid) continue;
        items = items.map((w) => {
          if (w.id !== fid) return w;
          const status = wfL1.statuses.find((s) => s.id === w.statusId);
          if (status?.hasReadySignal && !w.isReady) {
            return maybe(advanceProbability) ? { ...w, isReady: true } : w;
          }
          if (!maybe(advanceProbability)) return w;
          if (w.statusId === keysL1.commitmentId) {
            const hasChildrenGuard = items.some((x) => x.parentId === w.id && x.level === "L0");
            if (!hasChildrenGuard) {
              const l0First = wfL0.statuses[0];
              if (l0First.wipLimit != null) {
                const count =
                  items.filter((x) => x.statusId === l0First.id).length +
                  newL0Children.filter((x) => x.statusId === l0First.id).length;
                if (count >= l0First.wipLimit) return w;
              }
            }
          }
          const next = getNextStatusId(wfL1, w.statusId);
          if (next === keysL1.secondDownstreamId && !ancestorsCanStart(w)) return w;
          if (!wipL1(w.statusId, next)) return w;
          if (w.statusId === keysL1.commitmentId) {
            const hasChildren = items.some((x) => x.parentId === w.id && x.level === "L0");
            if (!hasChildren) {
              const l0FirstStatus = wfL0.statuses[0];
              for (let i = 0; i < childrenPerParent; i++) {
                if (l0FirstStatus.wipLimit != null) {
                  const count = items.filter((x) => x.statusId === l0FirstStatus.id).length + newL0Children.filter((x) => x.statusId === l0FirstStatus.id).length;
                  if (count >= l0FirstStatus.wipLimit) break;
                }
                const [id, newCounters] = nextId(counters, "L0", wfL0.workitemName, w.id);
                counters = newCounters;
                newL0Children.push({ id, level: "L0", statusId: l0FirstStatus.id, parentId: w.id, enteredAt: currentTick, color: w.color });
              }
            }
          }
          return { ...w, statusId: next, isReady: undefined, enteredAt: currentTick };
        });
      }

      items = [...items, ...newL0Children];
    } else {
      // --- PASO 3: L1 is the autonomous leaf ---
      advanceLeaf(wfL1, keysL1, wipL1);
    }
  }

  // --- PASO 4: Push L2 to first downstream when any L1 child enters downstream ---
  if (wfL2 && keysL2) {
    const wipL2 = makeWipTracker(wfL2, items);
    if (wfL1 && keysL1) {
      items = items.map((w) => {
        if (w.level !== "L2") return w;
        if (getOrder(wfL2, w.statusId) >= keysL2.firstDownstreamOrder) return w;
        if (anyInDownstream(wfL1, childrenOf(items, w.id))) {
          if (!wipL2(w.statusId, keysL2.firstDownstreamId)) return w;
          return { ...w, statusId: keysL2.firstDownstreamId, enteredAt: currentTick };
        }
        return w;
      });

      // --- PASO 5: Advance L2 with rules ---
      const newL1Children: Workitem[] = [];

      // firstDownstream and secondDownstream: hierarchical rules, parallel
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
        return w;
      });

      // General L2 advancement: walk right-to-left
      const l2GeneralColumns = [...new Set(
        items.filter((w) => {
          if (w.level !== "L2") return false;
          const o = getOrder(wfL2, w.statusId);
          return o < keysL2.deliveryOrder && o !== keysL2.firstDownstreamOrder && o !== keysL2.secondDownstreamOrder;
        }).map((w) => w.statusId)
      )].sort((a, b) => getOrder(wfL2, b) - getOrder(wfL2, a));
      for (const sid of l2GeneralColumns) {
        const fid = frontOfQueue(items.filter((w) => w.level === "L2"), sid);
        if (!fid) continue;
        items = items.map((w) => {
          if (w.id !== fid) return w;
          const status = wfL2.statuses.find((s) => s.id === w.statusId);
          if (status?.hasReadySignal && !w.isReady) {
            return maybe(advanceProbability) ? { ...w, isReady: true } : w;
          }
          if (!maybe(advanceProbability)) return w;
          if (w.statusId === keysL2.commitmentId) {
            const hasChildrenGuard = items.some((x) => x.parentId === w.id && x.level === "L1");
            if (!hasChildrenGuard) {
              const l1First = wfL1.statuses[0];
              if (l1First.wipLimit != null) {
                const count =
                  items.filter((x) => x.statusId === l1First.id).length +
                  newL1Children.filter((x) => x.statusId === l1First.id).length;
                if (count >= l1First.wipLimit) return w;
              }
            }
          }
          const next = getNextStatusId(wfL2, w.statusId);
          if (!wipL2(w.statusId, next)) return w;
          if (w.statusId === keysL2.commitmentId) {
            const hasChildren = items.some((x) => x.parentId === w.id && x.level === "L1");
            if (!hasChildren) {
              const l1FirstStatus = wfL1.statuses[0];
              for (let i = 0; i < childrenPerParent; i++) {
                if (l1FirstStatus.wipLimit != null) {
                  const count = items.filter((x) => x.statusId === l1FirstStatus.id).length + newL1Children.filter((x) => x.statusId === l1FirstStatus.id).length;
                  if (count >= l1FirstStatus.wipLimit) break;
                }
                const [id, newCounters] = nextId(counters, "L1", wfL1.workitemName, w.id);
                counters = newCounters;
                newL1Children.push({ id, level: "L1", statusId: l1FirstStatus.id, parentId: w.id, enteredAt: currentTick, color: w.color });
              }
            }
          }
          return { ...w, statusId: next, isReady: undefined, enteredAt: currentTick };
        });
      }

      items = [...items, ...newL1Children];
    } else {
      // --- PASO 5: L2 is the autonomous leaf ---
      advanceLeaf(wfL2, keysL2, wipL2);
    }
  }

  // --- PASO 6: Push L3 to first downstream when any L2 child enters downstream ---
  if (wfL3 && keysL3) {
    const wipL3 = makeWipTracker(wfL3, items);
    if (wfL2 && keysL2) {
      items = items.map((w) => {
        if (w.level !== "L3") return w;
        if (getOrder(wfL3, w.statusId) >= keysL3.firstDownstreamOrder) return w;
        if (anyInDownstream(wfL2, childrenOf(items, w.id))) {
          if (!wipL3(w.statusId, keysL3.firstDownstreamId)) return w;
          return { ...w, statusId: keysL3.firstDownstreamId, enteredAt: currentTick };
        }
        return w;
      });

      // --- PASO 7: Advance L3 with rules ---
      const newL2Children: Workitem[] = [];

      // firstDownstream and secondDownstream: hierarchical rules, parallel
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
        return w;
      });

      // General L3 advancement: walk right-to-left
      const l3GeneralColumns = [...new Set(
        items.filter((w) => {
          if (w.level !== "L3") return false;
          const o = getOrder(wfL3, w.statusId);
          return o < keysL3.deliveryOrder && o !== keysL3.firstDownstreamOrder && o !== keysL3.secondDownstreamOrder;
        }).map((w) => w.statusId)
      )].sort((a, b) => getOrder(wfL3, b) - getOrder(wfL3, a));
      for (const sid of l3GeneralColumns) {
        const fid = frontOfQueue(items.filter((w) => w.level === "L3"), sid);
        if (!fid) continue;
        items = items.map((w) => {
          if (w.id !== fid) return w;
          const status = wfL3.statuses.find((s) => s.id === w.statusId);
          if (status?.hasReadySignal && !w.isReady) {
            return maybe(advanceProbability) ? { ...w, isReady: true } : w;
          }
          if (!maybe(advanceProbability)) return w;
          if (w.statusId === keysL3.commitmentId) {
            const hasChildrenGuard = items.some((x) => x.parentId === w.id && x.level === "L2");
            if (!hasChildrenGuard) {
              const l2First = wfL2.statuses[0];
              if (l2First.wipLimit != null) {
                const count =
                  items.filter((x) => x.statusId === l2First.id).length +
                  newL2Children.filter((x) => x.statusId === l2First.id).length;
                if (count >= l2First.wipLimit) return w;
              }
            }
          }
          const next = getNextStatusId(wfL3, w.statusId);
          if (!wipL3(w.statusId, next)) return w;
          if (w.statusId === keysL3.commitmentId) {
            const hasChildren = items.some((x) => x.parentId === w.id && x.level === "L2");
            if (!hasChildren) {
              const l2FirstStatus = wfL2.statuses[0];
              for (let i = 0; i < childrenPerParent; i++) {
                if (l2FirstStatus.wipLimit != null) {
                  const count = items.filter((x) => x.statusId === l2FirstStatus.id).length + newL2Children.filter((x) => x.statusId === l2FirstStatus.id).length;
                  if (count >= l2FirstStatus.wipLimit) break;
                }
                const [id, newCounters] = nextId(counters, "L2", wfL2.workitemName, w.id);
                counters = newCounters;
                newL2Children.push({ id, level: "L2", statusId: l2FirstStatus.id, parentId: w.id, enteredAt: currentTick, color: ownColor(newCounters.L2, w.color) });
              }
            }
          }
          return { ...w, statusId: next, isReady: undefined, enteredAt: currentTick };
        });
      }

      items = [...items, ...newL2Children];
    } else {
      // --- PASO 7: L3 is the autonomous leaf ---
      advanceLeaf(wfL3, keysL3, wipL3);
    }
  }

  // --- PASO 8: Inject root demand (respects first-status WIP) ---
  if (demandInterval > 0 && currentTick % demandInterval === 0) {
    const firstStatus = root.statuses[0];
    const currentCount = items.filter((w) => w.statusId === firstStatus.id).length;
    if (firstStatus.wipLimit == null || currentCount < firstStatus.wipLimit) {
      const [id, newCounters] = nextId(counters, root.level, root.workitemName);
      counters = newCounters;
      items = [...items, { id, level: root.level, statusId: firstStatus.id, enteredAt: currentTick, color: WORKITEM_PALETTE[(newCounters[root.level] - 1) % WORKITEM_PALETTE.length] }];
    }
  }

  return {
    tick: currentTick,
    idCounters: counters,
    workitems: items,
  };
};
