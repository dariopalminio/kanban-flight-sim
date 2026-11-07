## 1. Configuration changes

- [x] 1.1 Capture full-model engine baseline fixtures before refactoring, using scripted draws with L0 enabled/disabled and representative commitment, FIFO, WIP, ready-signal and demand states.
- [x] 1.2 Make raw/domain workflow maps optional by `WorkitemLevel`; add a shared typed helper for ordered configured/active workflows, root/leaf selection and non-empty consecutive hierarchy validation.
- [x] 1.3 Build only present workflows in the loader; validate configured workflow fields, matching levels and existing structural requirements, and surface startup/selected-model errors through the existing configuration-error contract.
- [x] 1.4 Update directly relevant README and simulation configuration documentation for optional consecutive levels, root parameter semantics and Without L0 applicability; keep the current SDDF file, its backup, four-level files and root JSON format unchanged.

## 2. Engine changes

- [x] 2.1 Initialize items, parentless IDs, counters and existing-palette root colors at the highest active workflow while keeping all four counter fields.
- [x] 2.2 Derive structural keys only for active workflows and gate Steps 1-7 without changing full-model scheduling or consuming draws for missing levels.
- [x] 2.3 Generalize autonomous leaf advancement into its own Step 1/3/5/7 slot, preserving right-to-left FIFO, readiness phases, target WIP and delivery stopping.
- [x] 2.4 Restrict spawning, downstream push, trigger-up progression and child-delivery blocking to active immediate parent-child relationships; retain existing child-entry WIP limits and auto-ready timing.
- [x] 2.5 Apply ancestor pull to the active leaf when it enters second-downstream, including L2 leaf with L3 parent, and reject an explicitly empty active hierarchy.
- [x] 2.6 Inject Step 8 demand at the highest active level using its counter, root ID/color rules and first-status WIP check; preserve input immutability and unchanged full-model colors.

## 3. Component changes

- [x] 3.1 Map WIP overrides and board rendering over typed present workflows; intersect existing view target sets with active levels while retaining board order and view-only state preservation.
- [x] 3.2 Pass active-level availability to SimulationSelector, filter empty view options and normalize unavailable selected views to Full.
- [x] 3.3 Offer the L0 toggle only when L0 and higher levels are configured; reconcile its preference before model initialization, preserving it only when applicable.
- [x] 3.4 Keep model switching, reset, manual Step and autoplay consistent with the effective hierarchy, including autoplay stop/speed reset and model-change WIP override clearing.

## 4. Verification

- [x] 4.1 Verify `simulation-configuration`: all 10 non-empty consecutive subsets load, reversed JSON key order yields the same hierarchy, and four-level files need no migration.
- [x] 4.2 Verify `per-model-config-files`: current SDDF L2/L1 loads; empty maps, gaps, unknown keys, mismatched levels, null workflows, empty statuses and missing structural statuses fail descriptively rather than with undefined-property errors.
- [x] 4.3 Verify `simulation-engine`: for representative fixtures of all 10 subsets with probability 1, demand 0, initial count 1 and two children per parent, root/child work reaches delivery within 200 ticks; absent levels never appear and frozen input state/config remain unchanged.
- [x] 4.4 Verify `workitem-lifecycle`: initial roots, child parent references, root/child ID shapes and counter values are correct for L2/L1 and each single-level case.
- [x] 4.5 Verify `continuous-demand`: root injection occurs exactly at ticks 5 and 10 for interval 5, never on intervening ticks or interval 0, and full entry WIP blocks injection without incrementing counters.
- [x] 4.6 Verify `trigger-up-rules`: leaf construction waits for active ancestor capacity, first child construction advances its parent in the existing slot, and all-child delivery preserves parent auto-ready/Phase 2 timing.
- [x] 4.7 Verify `workitem-color`: lower-level roots use the current palette/cumulative counter, L1 children inherit L2 root colors and full-model L2 own-color rules remain unchanged.
- [x] 4.8 Verify `board-view-mode`: Full/Delivery show only L2/L1 for SDDF, Portafolio shows only L2, single-level modes show their active board, and view-only changes do not alter tick/items.
- [x] 4.9 Verify `simulation-selector-component`: exact available options for L2/L1 and sole L0, correct selection callbacks and Full fallback when switching from L3 view to a model without L3.
- [x] 4.10 Verify `without-l0-mode`: full-model toggle behavior, automatic autonomous L1 when L0 is omitted, hidden toggle for sole L0/no-L0 models, preference retention/clearing and invalid empty-active-hierarchy rejection.
- [x] 4.11 Compare full-model results against the captured scripted-draw baselines; exercise SDDF Step, autoplay, reset, WIP edits and model switching in the browser with no missing-workflow runtime errors.
- [x] 4.12 Run `npm run build`, `npm run lint` and `openspec validate support-configured-levels --strict`; report any unrelated baseline failures separately and confirm no test-tool dependency upgrade or unrelated model edit.
