## Context

The user-confirmed scope is a non-empty consecutive subset of L3-L0. With L2 + L1, initial work and continuous demand enter L2, while L1 advances without L0 dependencies.

The loader currently calls `buildWorkflow` for all four keys, causing the reported undefined `id` error. `Config`, initialization, structural-key derivation, WIP override mapping and board rendering also assume all workflows exist. Fixing only the loader would move the failure into the engine or interface.

The actual engine runs Steps 1-7 followed by demand injection in Step 8. Parent first-downstream progression depends on a child's second-downstream position; parent second-downstream completion depends on all children reaching delivery. Those existing rules, not obsolete descriptions of delivery blocking at first-downstream, are the compatibility baseline.

## Goals / Non-Goals

**Goals:**

- Load and run one to four consecutive configured levels without placeholder workflows.
- Derive root and leaf from the effective hierarchy, independently of JSON key order.
- Preserve full-model probabilistic, FIFO, ready-signal, WIP, ID, color and parent-child behavior.
- Make views, WIP editing, switching, reset and autoplay safe for partial models.
- Reject empty, gapped or malformed workflow definitions with actionable errors.

**Non-Goals:**

- Arbitrary gaps, new level names, multiple disconnected roots or connecting L3 directly to L1.
- Changing status semantics, random-number sources, advancement timing or existing WIP policy.
- Renaming JSON parameters, rebuilding the toolbar, adding an L0-only view option or replacing the styling system.
- Restoring removed SDDF workflows or changing unrelated model content.

## Decisions

### 1. Represent missing workflows explicitly and share ordered hierarchy derivation

Use an optional workflow map keyed by `WorkitemLevel` (for example `Partial<Record<WorkitemLevel, Workflow>>`). Keep the four ID counters; inactive counters remain zero. Introduce a small shared ordered-level helper used by loading, initialization, tick and interface code rather than independent hardcoded availability logic.

Validate the configured map before building workflows: at least one recognized key, no interior gaps, matching `workflow.level`, valid required workflow fields and non-empty valid statuses. Keep existing commitment, delivery and two-downstream structural requirements; partial hierarchies do not make malformed workflows valid. Errors identify the model and offending level or missing intermediate level.

The active hierarchy removes L0 only when `withoutL0` is enabled. Configured and active levels remain distinct so the UI can still offer re-enabling a configured L0. Reject an empty active hierarchy rather than creating a successful-looking empty simulation.

Alternatives rejected: filler workflows conceal missing configuration; retaining required four-key types with casts is unsafe; connecting across gaps changes the meaning of existing levels and is outside the confirmed scope.

### 2. Keep the original step order; gate behavior by active relationships

Do not move all work into Step 1 or introduce a new scheduling framework. Derive structural keys only for active workflows. Each level keeps its advancement slot:

| Active level | Advancement slot | Parent push slot |
|---|---|---|
| L0 | Step 1 | None |
| L1 | Step 3 | Step 2, only with active L0 |
| L2 | Step 5 | Step 4, only with active L1 |
| L3 | Step 7 | Step 6, only with active L2 |

Absent levels skip their slots without consuming probability draws. Parent push slots use the positions already produced by the lower advancement slot. Parent spawning, first-downstream synchronization and second-downstream completion operate only when the immediate lower workflow is active.

For the lowest active level, use the existing autonomous FIFO/ready-signal advancement pattern across all non-delivery statuses. L1 already has this behavior under `withoutL0`; generalize that leaf behavior to L2 and L3 as necessary. The ancestor pull rule applies when a leaf enters second-downstream; a parentless leaf has no ancestor restrictions. Preserve right-to-left processing, intra-step WIP counters and existing parent auto-ready timing.

For L2 + L1, Steps 1-2 and 6-7 do nothing, Step 3 advances L1 autonomously, Step 4 evaluates L2 push, and Step 5 advances L2 with L1 dependencies. Newly spawned L1 items wait until the next tick's Step 3.

**Purity contract:** No change to the existing `tick(state, config) -> state` contract: inputs remain unmodified, no logging or global mutable state is added to the engine, and the existing probabilistic mechanism is retained. This change does not introduce seeded determinism.

Alternative rejected: a wholesale generic engine rewrite risks changing random draw order, FIFO selection and same-tick synchronization for full models. Extract only shared logic needed for active hierarchy and leaf advancement.

### 3. Root initialization and demand share the same level selection

The highest active workflow receives `initialReleaseCount` items at initialization and one demand item on eligible Step 8 ticks, subject to the existing demand-entry WIP check. Root items have no parent suffix; update only their level's counter. Demand is appended after Steps 1-7, so injected work does not advance immediately.

Root colors use the existing palette and their own creation counter. Preserve L2's own-color rule when spawned from L3, and parent-color inheritance for spawned L1/L0. Do not change the palette to match outdated documentation.

Alternative rejected: requiring L3 for demand or using a separate root parameter defeats data-driven partial configuration.

### 4. Views are intersections with active levels

Keep existing view meanings: Portafolio targets L3/L2, Delivery targets L2/L1/L0, Full targets all configured active levels, and L3/L2/L1 target their named level. Hide options whose intersection is empty. Preserve Full as the current application's initial selection; fall back to Full if a model switch or toggle makes the selected view unavailable.

Do not reset the simulation when only a view changes. Map rendered boards and WIP overrides over actual workflows with typed presence checks. A model change resets work, tick, autoplay speed and WIP overrides as today; retain `withoutL0` only if it remains applicable, otherwise clear it. Reconcile effective configuration before rebuilding state.

Show the With L0 / Without L0 toggle only when L0 and at least one other workflow are configured. A sole L0 model remains simulatable through Full or Delivery, without a toggle that could remove its only level. No new single-level view value is required.

Alternative rejected: keeping empty options produces blank board areas and invalid selections after switching models.

## Risks / Trade-offs

- [Full-model scheduling regressions] -> Compare scripted draws and deterministic probability-1 fixtures against existing full-model behavior before changing scheduling logic.
- [An optional map becomes unchecked assertions] -> Use typed guards and shared ordered workflow entries; run strict TypeScript build.
- [Config errors escape module initialization] -> Return startup load failures through `configLoadResult` and retain descriptive selected-model errors through the existing error UI; never replace invalid data with fabricated workflows.
- [Stale toggle/view/WIP state after switching] -> Derive the next effective hierarchy before state initialization, filter view options and clear overrides on model changes.
- [Documentation contains older architecture descriptions] -> Update directly relevant hierarchy and parameter guidance; do not use this change to modernize unrelated specs or styling.
- [No test framework exists] -> Use focused assertion checks compatible with existing tooling and browser scenarios without a dependency upgrade; check full-model preservation as well as the reported two-level case.

## Migration Plan

1. Relax workflow-map types and introduce validation/ordered hierarchy helpers.
2. Gate Steps 1-7 and parameterize root creation/Step 8; wire interface availability and toggle normalization.
3. Validate the current SDDF L2 + L1 model, every single-level case, other consecutive subsets, invalid gaps/empty maps and full-model compatibility.
4. Update configuration guidance to show optional consecutive levels and unchanged parameter names.

The root `defaultConfig.json` stays `{ "defaultModel": "<name>" }`. Model files keep their existing fields; four-level models need no edits. Partial files omit unused outer keys instead of providing `null` or empty placeholders. Rollback is a normal code revert, but partial models then require restoring their missing workflows; the user's current model and backup are not modified by this proposal.

## Open Questions

None blocking. Consecutive levels and highest-level initial/periodic demand were explicitly confirmed by the user.
