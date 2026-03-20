## ADDED Requirements

### Requirement: Split status expansion at config load time
When a status in `defaultConfig.json` has `"split": true`, `buildWorkflow` in `defaultConfig.ts` SHALL expand it into exactly two consecutive `Status` entries in the resulting `Workflow.statuses` array. The first entry has `splitRole: "doing"` and inherits the original `wipLimit`. The second has `splitRole: "ready"` and has no `wipLimit`. Both entries carry `splitGroup` set to the original status `id`. All `order` values in the workflow SHALL be reassigned sequentially after expansion so that the engine's order-based logic is unaffected.

#### Scenario: Split status becomes two statuses
- **WHEN** a workflow has a status `{ id: "analysis", order: 2, wipLimit: 2, split: true }`
- **THEN** the loaded workflow contains `{ id: "analysis-doing", order: 2, wipLimit: 2, splitGroup: "analysis", splitRole: "doing" }` followed by `{ id: "analysis-ready", order: 3, splitGroup: "analysis", splitRole: "ready" }`, and the status that was previously at order 3 is now at order 4

#### Scenario: Non-split status is unchanged
- **WHEN** a workflow status does not have `split: true`
- **THEN** its loaded `Status` object has no `splitGroup` or `splitRole` fields

#### Scenario: WIP limit applies only to Doing sub-status
- **WHEN** a split status has `wipLimit: 2`
- **THEN** `analysis-doing` has `wipLimit: 2` and `analysis-ready` has no `wipLimit`

---

### Requirement: Workitems flow through Doing then Ready
The engine treats `<id>-doing` and `<id>-ready` as two ordinary consecutive statuses. A workitem SHALL enter `<id>-doing` when advancing into a split column, then advance to `<id>-ready`, then advance to the next status in the workflow. No engine changes are required.

#### Scenario: Item enters split column via Doing
- **WHEN** a workitem advances from the status preceding a split column
- **THEN** its `statusId` becomes `<id>-doing`, not `<id>-ready`

#### Scenario: Item advances from Doing to Ready
- **WHEN** a workitem is in `<id>-doing` and the probability draw succeeds and WIP allows
- **THEN** its `statusId` becomes `<id>-ready`

#### Scenario: Item leaves split column from Ready
- **WHEN** a workitem is in `<id>-ready` and advances
- **THEN** its `statusId` becomes the status that follows `<id>-ready` in the workflow

---

### Requirement: Split column visual rendering
A pair of statuses sharing the same `splitGroup` SHALL be rendered as a single visual column with a shared top-level header showing the process name, and two side-by-side sub-columns labeled **Doing** and **Ready**. A thin vertical divider SHALL separate the two sub-columns. The layout MUST use inline CSS only (no CSS classes).

#### Scenario: Shared header shows process name
- **WHEN** statuses `analysis-doing` and `analysis-ready` are rendered
- **THEN** a single column header reading "Análisis" (the original status name) appears above both sub-columns

#### Scenario: Sub-column labels are shown
- **WHEN** a split column is rendered
- **THEN** "Doing" appears above the left sub-column and "Ready" appears above the right sub-column

#### Scenario: WIP indicator shown only on Doing sub-column
- **WHEN** a split status has `wipLimit: 2` and 1 item is in `analysis-doing`
- **THEN** the Doing sub-column header shows `[1/2]` and the Ready sub-column header shows no WIP indicator

#### Scenario: Non-split columns render identically to current behavior
- **WHEN** a status has no `splitGroup`
- **THEN** it renders as a standard column with no visual change
