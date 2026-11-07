## MODIFIED Requirements

### Requirement: Pull rule — a child starts construction only if its ancestors can
An autonomous leaf item SHALL NOT enter its second-downstream status unless each active ancestor is already at/past its own second-downstream or has capacity there. The check SHALL stop at the first ancestor already in construction and SHALL apply in Step 1, 3, 5 or 7 according to the leaf's level. A root leaf SHALL have no ancestor restriction. FIFO SHALL still prevent a blocked front item from being overtaken.

#### Scenario: Story waits while its Epic has no capacity
- **WHEN** active L2 has no second-downstream capacity and is not yet in construction
- **THEN** its autonomous descendants SHALL remain before construction: L1 in Step 3 when L1 is the leaf, or L0 in Step 1 when L0 is active

#### Scenario: Work starts when capacity frees up
- **WHEN** capacity frees in the waiting ancestor's second-downstream
- **THEN** the front leaf descendant SHALL be eligible to start and subsequent parent advancement slots SHALL evaluate the updated child positions

#### Scenario: Children of a parent already in construction are not held back
- **WHEN** a leaf's parent is already at/past second-downstream
- **THEN** ancestor pull SHALL NOT block the leaf because that parent column is full

#### Scenario: The ancestor chain is checked
- **WHEN** an L0 item's L1 parent has capacity but an unstarted active L2 or L3 ancestor has none
- **THEN** Step 1 SHALL leave L0 at first-downstream

#### Scenario: Preparation is not held back
- **WHEN** an item advances before second-downstream
- **THEN** ancestor pull SHALL NOT be evaluated

#### Scenario: L2 leaf obeys its L3 parent capacity
- **WHEN** only L3 and L2 are active and L3 has no construction capacity
- **THEN** Step 5 SHALL block its front L2 child from entering second-downstream

### Requirement: L0 is not subject to trigger-up rules (no parent auto-progression or auto-ready)
L0 items SHALL advance autonomously in Step 1 without child-based progression or auto-ready, because they have no lower child workflow. Their positions SHALL still be used by active L1 parent rules in Steps 2-3. Ancestor pull SHALL apply at L0 second-downstream.

#### Scenario: L0 advances without triggering any parent rule
- **WHEN** Step 1 evaluates L0 advancement
- **THEN** it SHALL NOT evaluate child-based progression or auto-ready on L0 itself; Steps 2-3 SHALL retain evaluation of its active L1 parent

## ADDED Requirements

### Requirement: Trigger-up relationships exist only between active neighboring levels
First-downstream progression and child-delivery auto-ready SHALL apply only to parents with an active immediately lower workflow, in Step 3 for L1/L0, Step 5 for L2/L1 and Step 7 for L3/L2. Their existing target WIP and readiness timing SHALL remain unchanged. The lowest active level SHALL advance autonomously without child-based triggers; the highest active level SHALL have no upward parent relationship.

#### Scenario: Two-level trigger-up retains L2 child synchronization
- **WHEN** only L2 and L1 are active and an L1 child reaches second-downstream in Step 3
- **THEN** Step 5 SHALL allow its first-downstream L2 parent to progress subject to WIP, without evaluating L3

#### Scenario: Lowest active level does not wait for missing children
- **WHEN** L1 is the leaf at second-downstream
- **THEN** Step 3 SHALL use autonomous readiness and SHALL NOT wait for L0 delivery

#### Scenario: Active parent still waits for all children
- **WHEN** L2 is at second-downstream and one active L1 child is not delivered
- **THEN** Step 5 SHALL keep L2 blocked without auto-ready, as in full models
