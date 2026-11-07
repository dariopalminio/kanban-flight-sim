![kanban-flight-sim](./assets/images/kanban-flight-sim-logo-v1.png)


# Kanban Flight Simulator

A visual Kanban flow simulator for understanding multi-level hierarchical workflows. Built as an educational tool to explore concepts like upstream/downstream, commitment points, delivery points, and WIP limits across four levels of work.

## What it does

The simulator models work flowing through one to four consecutive hierarchical levels:

```
L3 (e.g. Project)  ─── contains ──▶  L2 (e.g. Epic)
L2 (e.g. Epic)     ─── contains ──▶  L1 (e.g. Story)
L1 (e.g. Story)    ─── contains ──▶  L0 (e.g. Subtask)
```

Each level has its own Kanban board with configurable statuses. Work items advance through their workflow tick by tick, following hierarchical rules: a parent item is unblocked only when its children complete their work; children are created automatically when a parent reaches its commitment point.

## Getting started

```bash
npm install
npm run dev
```

## Controls

| Button | Action |
|--------|--------|
| **Step** | Advance the simulation one tick |
| **Autoplay** | Run continuously (one tick/second). Press again to pause |
| **Reset** | Return to the initial state |
| **Upstream / Downstream** | Highlight columns by stream zone |
| **Status Category** | Highlight columns by category (TODO / IN-PROGRESS / DONE) |
| **Commitment Status** | Highlight the commitment point column on each board |
| **Delivery Status** | Highlight the delivery point column on each board |

Use the dropdown in the header to switch between available simulations.

## Configuration

Each simulation is a model file in [`src/config/models/`](src/config/models/).
[`src/config/defaultConfig.json`](src/config/defaultConfig.json) selects the startup model using `{ "defaultModel": "<name>" }`. Each model specifies:

- A non-empty consecutive subset of L3, L2, L1, L0, each with an ordered list of statuses. Omit unused outer levels; do not use null/empty placeholders. L2 + L1 and any single level are valid; L3 + L1 is rejected for missing L2. JSON key order does not affect hierarchy order.
- `advanceProbability` — probability each eligible work item advances per tick (default: `0.5`)
- `childrenPerParent` — how many child work items are created at the commitment point (default: `3`)
- `initialReleaseCount` — number of parentless work items at the highest active level to start with (default: `1`)
- `demandInterval` — inject one item at that same root every N ticks, subject to entry WIP; `0` disables demand (default: `0`)

The lowest active level advances autonomously. Only active neighboring levels spawn and synchronize children. **With L0 / Without L0** is available only when L0 and a higher level are configured; sole-L0 models cannot disable their only board. Views show only their available target boards and unavailable view options are hidden.
Existing four-level model files require no migration.

Focused checks (using the installed TypeScript compiler, no extra test dependencies):

```bash
node tests/configured-levels.mjs
node tests/engine-baseline.mjs
npm run build
```

The baseline fixtures retain pre-change full-model results with scripted probability draws, including L0-enabled and L0-disabled runs.

Each status supports:
- `streamType`: `UPSTREAM` or `DOWNSTREAM`
- `isBeforeCommitmentPoint`: marks the status where children are spawned
- `isPosDeliveryPoint`: marks the final status (work item stops here)
- `wipLimit`: optional cap on how many work items can occupy this column at once

Add a JSON file with `{ name, initialReleaseCount, advanceProbability, childrenPerParent, demandInterval?, workflows }` to the model directory — no code changes needed. Configured workflows must have matching level keys, required fields, consecutive ascending status orders, commitment/delivery markers and at least two downstream statuses. Invalid configurations produce descriptive errors rather than placeholder workflows.

## Bundled simulations

| Name | Levels |
|------|--------|
| **Simplified** | Project → Epic → Story → Subtask, 4 statuses each |
| **SDDF workflows** | Release (L2) → Feat (L1) |

## Architecture

```
src/
├── config/
│   ├── defaultConfig.json   # Startup model selection
│   ├── models/             # Model workflows and parameters
│   └── defaultConfig.ts    # Loads and validates model JSON
├── domain/
│   └── types.ts             # TypeScript types: Workitem, Workflow, Status, SimState, Config
├── simulation/
│   └── engine.ts            # Pure functions: buildInitialState() and tick()
├── components/
│   ├── Board.tsx            # One board per level
│   ├── Column.tsx           # One column per status
│   └── Card.tsx             # One card per work item
└── App.tsx                  # Root: state, controls, board composition
```

The simulation engine is a **pure function** — `tick(state, config) → state` — with no side effects. This makes it easy to test, replay, and drive with `setInterval` for autoplay.

## Documentation

Full requirements specification: [`doc/mvp-software-spec.md`](doc/mvp-software-spec.md)

## Stack

- React + Vite
- TypeScript
