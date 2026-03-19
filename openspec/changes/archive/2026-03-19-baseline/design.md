## Context

The Kanban Flight Simulator is a fully implemented React + TypeScript + Vite application. The codebase has no prior OpenSpec artifacts. This baseline is a retrospective documentation effort — reverse-engineering the design from the existing source code (`src/`) and the informal spec (`doc/mvp-software-spec.md`).

The system simulates multi-level Kanban workflows with four hierarchical levels (L3–L0). It runs as a browser SPA with no backend. All state is in-memory React state.

## Goals / Non-Goals

**Goals:**
- Document the architecture as implemented, without idealizing or proposing improvements
- Produce accurate, traceable specs for each major capability
- Establish a stable baseline that future changes can delta against

**Non-Goals:**
- Proposing improvements or refactors to the existing code
- Generating test plans (existing code has no tests)
- Documenting build/deploy configuration

## Decisions

### D1: Separate a spec per capability (not one monolithic spec)
Each of the five capabilities identified in the proposal gets its own `specs/<name>/spec.md`.
**Rationale:** Keeps specs focused and allows future changes to modify a single capability's spec in isolation without touching unrelated specs.

### D2: Use the source code as the authority, not the prose spec doc
`doc/mvp-software-spec.md` is thorough but occasionally uses intent language ("should", "must"). The `engine.ts` and `App.tsx` source files are the ground truth for what is *actually* implemented.
**Rationale:** A baseline spec must describe observable behavior, not aspirational behavior.

### D3: Describe the 7-step tick algorithm as an ordered list
The engine executes exactly 7 steps per tick in a fixed order. This structure is fundamental to correctness and must be made explicit in the spec rather than implied.
**Rationale:** Step ordering is a behavioral invariant — reordering steps would change results even if each step's logic is identical.

### D4: Capture WIP tracking as an intra-tick mutation contract
The `makeWipTracker` closure mutates a counter map during a single tick pass. This is an important implementation detail: it prevents multiple items from "sneaking through" a WIP limit in the same tick.
**Rationale:** Without this detail, a spec reader might expect WIP limits to be evaluated against the pre-tick snapshot only, leading to incorrect implementations.

## Risks / Trade-offs

- **Risk: Spec drift** — the specs describe a point-in-time snapshot. If the code changes without updating the specs, they become stale.
  → Mitigation: Any future change should open a new OpenSpec change and update the relevant specs as part of the task.

- **Risk: Prose ambiguity** — some behaviors (e.g., the exact semantics of `isBeforeCommitmentPoint` in the context of child creation) require careful reading of both spec and code to understand.
  → Mitigation: Specs use concrete examples drawn from the two bundled simulations to ground abstract rules.

- **Risk: Category derivation is implicit** — `category` is not in `defaultConfig.json`; it is derived at load time in `defaultConfig.ts`. A reader looking only at the JSON might miss this.
  → Mitigation: The `simulation-configuration` spec explicitly documents the derivation rule and where it runs.
