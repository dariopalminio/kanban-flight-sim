## ADDED Requirements

### Requirement: Flash animation on workitems advanced in current tick
The UI SHALL display a brief green border flash animation on any `Card` whose `item.enteredAt` equals the current simulation tick (`simState.tick`). The animation SHALL use the CSS keyframe `tick-flash` defined globally, producing a green outline (`#22c55e`) and glow (`box-shadow: 0 0 8px #22c55e`) that fades to transparent over approximately 0.6 seconds. Items that did not advance in the current tick SHALL NOT display the animation.

#### Scenario: Card flashes green when it advanced in the last tick
- **WHEN** a workitem's `enteredAt` equals the current `simState.tick` after a tick executes
- **THEN** the card displays the `tick-flash` CSS animation (green outline + glow fading out over ~0.6s)

#### Scenario: Card does not flash when it did not advance
- **WHEN** a workitem's `enteredAt` is less than the current `simState.tick`
- **THEN** no flash animation is applied to that card

#### Scenario: Flash coexists with ready-signal indicator
- **WHEN** a workitem has `isReady: true` and also advanced in the current tick
- **THEN** both the ready-signal indicator (left green border + `✓` badge) and the flash animation are visible simultaneously

---

### Requirement: tick-flash keyframe defined in global stylesheet
A CSS `@keyframes tick-flash` rule SHALL be defined once in `index.html` (inside a `<style>` block in `<head>`). The keyframe SHALL animate `outline` and `box-shadow` from `2px solid #22c55e` / `0 0 8px #22c55e` at `0%` to `2px solid transparent` / `none` at `100%`. No JavaScript SHALL modify this definition at runtime.

#### Scenario: Keyframe is available before any React component mounts
- **WHEN** the browser loads `index.html`
- **THEN** the `tick-flash` keyframe is already registered in the CSSOM before the React app hydrates

#### Scenario: Keyframe definition does not conflict with existing styles
- **WHEN** `index.html` is loaded
- **THEN** no other `@keyframes` rule in the document uses the name `tick-flash`