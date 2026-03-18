import type { Config, SimState, Workitem, Workflow } from "../domain/types";

// =====================
// HELPERS
// =====================

const maybe = (p: number) => Math.random() < p;

const getNextStatusId = (wf: Workflow, statusId: string): string => {
  const statuses = wf.statuses;
  const current = statuses.find((s) => s.id === statusId);
  if (!current) return statusId;
  const next = statuses.find((s) => s.order === current.order + 1);
  return next ? next.id : statusId;
};

const getOrder = (wf: Workflow, statusId: string): number =>
  wf.statuses.find((s) => s.id === statusId)?.order ?? 0;

const childrenOf = (items: Workitem[], parentId: string): Workitem[] =>
  items.filter((w) => w.parentId === parentId);

const allInStatus = (items: Workitem[], statusId: string): boolean =>
  items.length > 0 && items.every((w) => w.statusId === statusId);

const anyInStatus = (items: Workitem[], statusId: string): boolean =>
  items.some((w) => w.statusId === statusId);

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
  const wfL3 = workflows.L2;
  const wfL2 = workflows.L1;
  const wfL1 = workflows.L0;

  let items = state.workitems.map((w) => ({ ...w }));
  let counters = { ...state.idCounters };

  // --- PASO 1: Avanzar Specs (L0) autónomamente ---
  items = items.map((w) => {
    if (w.level !== "L0") return w;
    if (!maybe(advanceProbability)) return w;
    const next = getNextStatusId(wfL1, w.statusId);
    return { ...w, statusId: next };
  });

  // --- PASO 2: Regla 6 — Feat (L1) → Developing si alguna Spec hija está en Implementing ---
  const featDevelopOrder = getOrder(wfL2, "feat-developing");
  items = items.map((w) => {
    if (w.level !== "L1") return w;
    const myOrder = getOrder(wfL2, w.statusId);
    if (myOrder >= featDevelopOrder) return w; // ya está en Developing o más adelante
    const mySpecs = childrenOf(items, w.id);
    if (anyInStatus(mySpecs, "spec-implementing")) {
      return { ...w, statusId: "feat-developing" };
    }
    return w;
  });

  // --- PASO 3: Avanzar Feats (L1) con reglas ---
  const newItems: Workitem[] = [];

  items = items.map((w) => {
    if (w.level !== "L1") return w;

    const order = getOrder(wfL2, w.statusId);
    const featReadyOrder = getOrder(wfL2, "feat-ready");
    const featDevelopingOrder = getOrder(wfL2, "feat-developing");

    // Regla 5: crear Specs al llegar a Ready-for-Develop
    if (w.statusId === "feat-ready") {
      const hasSpecs = items.some((x) => x.parentId === w.id && x.level === "L0");
      if (!hasSpecs) {
        for (let i = 0; i < childrenPerParent; i++) {
          const [id, newCounters] = nextId(counters, "L0");
          counters = newCounters;
          newItems.push({ id, level: "L0", statusId: wfL1.statuses[0].id, parentId: w.id });
        }
      }
    }

    // Regla 7 + 8: en Developing, bloqueado hasta que TODAS las Specs estén Completed
    if (w.statusId === "feat-developing") {
      const mySpecs = childrenOf(
        [...items, ...newItems],
        w.id
      );
      if (allInStatus(mySpecs, "spec-completed")) {
        // Regla 8: avanzar a Code-Review
        return { ...w, statusId: "feat-code-review" };
      }
      // Bloqueado
      return w;
    }

    // Upstream (antes de Ready-for-Develop): avance autónomo 50%
    if (order < featReadyOrder) {
      if (!maybe(advanceProbability)) return w;
      return { ...w, statusId: getNextStatusId(wfL2, w.statusId) };
    }

    // En Ready-for-Develop: avance autónomo 50% hacia Developing
    if (order === featReadyOrder) {
      if (!maybe(advanceProbability)) return w;
      return { ...w, statusId: getNextStatusId(wfL2, w.statusId) };
    }

    // Downstream después de Developing (Code-Review en adelante): autónomo 50%
    if (order > featDevelopingOrder) {
      if (!maybe(advanceProbability)) return w;
      return { ...w, statusId: getNextStatusId(wfL2, w.statusId) };
    }

    return w;
  });

  items = [...items, ...newItems];

  // --- PASO 4: Reglas de Release (L2) basadas en estado de Feats ---
  items = items.map((w) => {
    if (w.level !== "L2") return w;

    const myFeats = childrenOf(items, w.id);

    // Regla 2: Ready → Develop cuando primera Feat está en Developing
    if (w.statusId === "release-ready" && anyInStatus(myFeats, "feat-developing")) {
      return { ...w, statusId: "release-develop" };
    }

    // Regla 3: Develop → To-Validate cuando TODAS las Feats están en Done
    if (w.statusId === "release-develop" && allInStatus(myFeats, "feat-done")) {
      return { ...w, statusId: "release-to-validate" };
    }

    return w;
  });

  // --- PASO 5: Avanzar Releases (L2) con reglas ---
  const releaseReadyOrder    = getOrder(wfL3, "release-ready");
  const releaseReleasedOrder = getOrder(wfL3, "release-released");
  const releaseToValidOrder  = getOrder(wfL3, "release-to-validate");

  const newReleaseChildren: Workitem[] = [];

  items = items.map((w) => {
    if (w.level !== "L2") return w;

    const order = getOrder(wfL3, w.statusId);

    // Regla 1: crear Feats al llegar a Ready
    if (w.statusId === "release-ready") {
      const hasFeats = items.some((x) => x.parentId === w.id && x.level === "L1");
      if (!hasFeats) {
        for (let i = 0; i < childrenPerParent; i++) {
          const [id, newCounters] = nextId(counters, "L1");
          counters = newCounters;
          newReleaseChildren.push({ id, level: "L1", statusId: wfL2.statuses[0].id, parentId: w.id });
        }
      }
      // Bloqueado — espera Regla 2 (ya aplicada en Paso 4)
      return w;
    }

    // Bloqueado en Develop (espera Regla 3, ya aplicada en Paso 4)
    if (w.statusId === "release-develop") return w;

    // Estado final Released: no avanza
    if (order >= releaseReleasedOrder) return w;

    // Upstream (antes de Ready): avance autónomo 50%
    if (order < releaseReadyOrder) {
      if (!maybe(advanceProbability)) return w;
      return { ...w, statusId: getNextStatusId(wfL3, w.statusId) };
    }

    // Downstream desde To-Validate hasta Deploy (antes de Released): autónomo 50%
    if (order >= releaseToValidOrder && order < releaseReleasedOrder) {
      if (!maybe(advanceProbability)) return w;
      return { ...w, statusId: getNextStatusId(wfL3, w.statusId) };
    }

    return w;
  });

  items = [...items, ...newReleaseChildren];

  return {
    tick: state.tick + 1,
    idCounters: counters,
    workitems: items,
  };
};
