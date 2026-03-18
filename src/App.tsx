import { useState } from "react";

// =====================
// GENERIC WORKFLOW MODEL
// =====================
type StatusCategory = "TODO" | "IN_PROGRESS" | "DONE";

type Status = {
  id: string;
  name: string;
  order: number;
  nextStates: string[];
  streamType: "UPSTREAM" | "DOWNSTREAM";
  isCommitmentPoint: boolean;
  isDeliveryPoint: boolean;
  category: StatusCategory;
};

type Workflow = {
  id: string;
  name: string;
  level: string;
  statuses: Status[];
};

// =====================
// CATEGORY HELPER
// =====================

const assignCategory = (statuses: any[]) => {
  const last = statuses[statuses.length - 1].id;

  return statuses.map((s) => {
    if (s.streamType === "UPSTREAM") {
      return { ...s, category: "TODO" };
    }

    if (s.id === last) {
      return { ...s, category: "DONE" };
    }

    return { ...s, category: "IN_PROGRESS" };
  });
};

// =====================
// WORKFLOWS
// =====================

const releaseWorkflow: Workflow = {
  id: "wf-release",
  name: "Release",
  level: "L3",
  statuses: assignCategory([
    { id: "release-initial", name: "Initial", order: 1, nextStates: ["release-defining"], streamType: "UPSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "release-defining", name: "Defining", order: 2, nextStates: ["release-plan"], streamType: "UPSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "release-plan", name: "Plan", order: 3, nextStates: ["release-ready"], streamType: "UPSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "release-ready", name: "Ready", order: 4, nextStates: ["release-develop"], streamType: "UPSTREAM", isCommitmentPoint: true, isDeliveryPoint: false },
    { id: "release-develop", name: "Develop", order: 5, nextStates: ["release-to-integrate"], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "release-to-integrate", name: "To-Integrate", order: 6, nextStates: ["release-integration-uat"], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "release-integration-uat", name: "Integration-UAT", order: 7, nextStates: ["release-ready-for-prod"], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "release-ready-for-prod", name: "Ready-for-Prod", order: 8, nextStates: ["release-deploy"], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "release-deploy", name: "Deploy", order: 9, nextStates: ["release-released"], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "release-released", name: "Released", order: 10, nextStates: [], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: true }
  ])
};

const featWorkflow: Workflow = {
  id: "wf-feat",
  name: "Feat",
  level: "L2",
  statuses: assignCategory([
    { id: "feat-pending", name: "Pending", order: 1, nextStates: ["feat-refining"], streamType: "UPSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "feat-refining", name: "Refining", order: 2, nextStates: ["feat-ready"], streamType: "UPSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "feat-ready", name: "Ready-for-Develop", order: 3, nextStates: ["feat-developing"], streamType: "UPSTREAM", isCommitmentPoint: true, isDeliveryPoint: false },
    { id: "feat-developing", name: "Developing", order: 4, nextStates: ["feat-code-review"], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "feat-code-review", name: "Code-Review", order: 5, nextStates: ["feat-qa"], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "feat-qa", name: "QA-Validation", order: 6, nextStates: ["feat-acceptance"], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "feat-acceptance", name: "Acceptance", order: 7, nextStates: ["feat-ready-int"], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "feat-ready-int", name: "Ready-to-Integrate", order: 8, nextStates: ["feat-prod"], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "feat-prod", name: "In-Production", order: 9, nextStates: [], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: true }
  ])
};

const specWorkflow: Workflow = {
  id: "wf-spec",
  name: "Spec",
  level: "L1",
  statuses: assignCategory([
    { id: "spec-todo", name: "Todo", order: 1, nextStates: ["spec-specifying"], streamType: "UPSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "spec-specifying", name: "Specifying", order: 2, nextStates: ["spec-designing"], streamType: "UPSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "spec-designing", name: "Designing", order: 3, nextStates: ["spec-ready-impl"], streamType: "UPSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "spec-ready-impl", name: "Ready-for-Implement", order: 4, nextStates: ["spec-implementing"], streamType: "UPSTREAM", isCommitmentPoint: true, isDeliveryPoint: false },
    { id: "spec-implementing", name: "Implementing", order: 5, nextStates: ["spec-validation"], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "spec-validation", name: "Validation", order: 6, nextStates: ["spec-completed"], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: false },
    { id: "spec-completed", name: "Completed", order: 7, nextStates: [], streamType: "DOWNSTREAM", isCommitmentPoint: false, isDeliveryPoint: true }
  ])
};

// =====================
// MODELS
// =====================

type Item = {
  id: string;
  statusId: string;
  parentId?: string;
};

// =====================
// HELPERS
// =====================

const getNext = (wf: Workflow, statusId: string) => {
  const s = wf.statuses.find((x) => x.id === statusId);
  return s?.nextStates[0] || statusId;
};

const maybe = (p = 0.5) => Math.random() < p;

const clamp = (wf: Workflow, prev: string, next: string) => {
  const prevOrder = wf.statuses.find((s) => s.id === prev)?.order || 0;
  const nextOrder = wf.statuses.find((s) => s.id === next)?.order || 0;

  if (nextOrder > prevOrder + 1) {
    return wf.statuses.find((s) => s.order === prevOrder + 1)?.id || prev;
  }

  return next;
};

// =====================
// INITIAL STATE
// =====================

const initial = {
  releases: [{ id: "R1", statusId: "release-initial" } as Item],
  feats: [] as Item[],
  specs: [] as Item[]
};

// =====================
// SIMULATION
// =====================

function simulate(state: typeof initial) {
  const prev = structuredClone(state);
  let s = structuredClone(state);

  s.releases.forEach((r, i) => {
    let next = maybe() ? getNext(releaseWorkflow, r.statusId) : r.statusId;
    r.statusId = clamp(releaseWorkflow, prev.releases[i].statusId, next);
  });

  if (s.feats.length === 0 && s.releases[0].statusId === "release-ready") {
    for (let i = 1; i <= 3; i++) {
      s.feats.push({ id: `R1F${i}`, statusId: "feat-pending", parentId: "R1" });
    }
  }

  s.feats.forEach((f, i) => {
    let next = maybe() ? getNext(featWorkflow, f.statusId) : f.statusId;
    f.statusId = clamp(featWorkflow, prev.feats[i]?.statusId || f.statusId, next);
  });

  s.feats.forEach((f) => {
    if (f.statusId === "feat-ready" && !s.specs.some((sp) => sp.parentId === f.id)) {
      for (let i = 1; i <= 3; i++) {
        s.specs.push({ id: `${f.id}S${i}`, statusId: "spec-todo", parentId: f.id });
      }
    }
  });

  s.specs.forEach((sp, i) => {
    let next = maybe(0.7) ? getNext(specWorkflow, sp.statusId) : sp.statusId;
    sp.statusId = clamp(specWorkflow, prev.specs[i]?.statusId || sp.statusId, next);
  });

  return s;
}

// =====================
// UI
// =====================

function Board({ wf, items, highlightStream, highlightCategory, highlightCommitment, highlightDelivery }: any) {
  return (
    <div style={{ marginBottom: 10 }}>
      <h3 style={{ color: "white", fontSize: 12 }}>Board level: {wf.level} name: {wf.name}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {wf.statuses.map((col: Status) => {
          let bg = "#111";

          if (highlightStream) {
            bg = col.streamType === "UPSTREAM" ? "#1e3a8a" : "#065f46";
          }

          if (highlightCategory) {
            if (col.category === "TODO") bg = "#374151";
            if (col.category === "IN_PROGRESS") bg = "#1d4ed8";
            if (col.category === "DONE") bg = "#166534";
          }

          if (highlightCommitment && col.isCommitmentPoint) {
            bg = "#facc15"; // amarillo commitment
          }

          if (highlightDelivery && col.isDeliveryPoint) {
            bg = "#fde047"; // amarillo más claro delivery
          }

          return (
            <div key={col.id} style={{ width: 90, background: bg, padding: 4 }}>
              <div style={{ fontSize: 9, color: "#0f172a", fontWeight: 600 }}>{col.name}</div>
              {items
                .filter((i: Item) => i.statusId === col.id)
                .map((i: Item) => (
                  <div key={i.id} style={{ fontSize: 9, background: "#334155", marginTop: 2, color: "white" }}>
                    {i.id}
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(initial);
  const [highlightStream, setHighlightStream] = useState(false);
  const [highlightCategory, setHighlightCategory] = useState(false);
  const [highlightCommitment, setHighlightCommitment] = useState(false);
  const [highlightDelivery, setHighlightDelivery] = useState(false);

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", padding: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => setState(simulate(state))}>Step</button>
        <button onClick={() => setHighlightStream(!highlightStream)} style={{ marginLeft: 8 }}>
          Upstream vs Downstream vew
        </button>
        <button onClick={() => setHighlightCategory(!highlightCategory)} style={{ marginLeft: 8 }}>
          Status Category view
        </button>
        <button onClick={() => setHighlightCommitment(!highlightCommitment)} style={{ marginLeft: 8 }}>
          Commitment status View
        </button>
        <button onClick={() => setHighlightDelivery(!highlightDelivery)} style={{ marginLeft: 8 }}>
          Delivery status View
        </button>
      </div>

      <Board
        wf={releaseWorkflow}
        items={state.releases}
        highlightStream={highlightStream}
        highlightCategory={highlightCategory}
        highlightCommitment={highlightCommitment}
        highlightDelivery={highlightDelivery}
      />
      <Board
        wf={featWorkflow}
        items={state.feats}
        highlightStream={highlightStream}
        highlightCategory={highlightCategory}
        highlightCommitment={highlightCommitment}
        highlightDelivery={highlightDelivery}
      />
      <Board
        wf={specWorkflow}
        items={state.specs}
        highlightStream={highlightStream}
        highlightCategory={highlightCategory}
        highlightCommitment={highlightCommitment}
        highlightDelivery={highlightDelivery}
      />
    </div>
  );
}
