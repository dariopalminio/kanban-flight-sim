## 1. App State — WIP limit overrides

- [x] 1.1 Add `wipLimitOverrides` state (`Record<string, number>`) to `App.tsx` initialized as `{}`
- [x] 1.2 Add `handleWipLimitChange(statusId: string, value: number)` handler in `App.tsx` that updates `wipLimitOverrides`
- [x] 1.3 Reset `wipLimitOverrides` to `{}` inside `handleSimChange` in `App.tsx`
- [x] 1.4 Reset `wipLimitOverrides` to `{}` inside `handleReset` in `App.tsx`

## 2. effectiveConfig — merge overrides into workflow statuses

- [x] 2.1 Update `effectiveConfig` in `App.tsx` to patch each workflow's `statuses` array: for any status whose `id` appears in `wipLimitOverrides`, replace its `wipLimit` with the override value

## 3. Board — forward onWipLimitChange prop

- [x] 3.1 Add `onWipLimitChange: (statusId: string, value: number) => void` to `Board.tsx` Props type
- [x] 3.2 Pass `onWipLimitChange` from `Board` down to each `<Column>` in `Board.tsx`
- [x] 3.3 Pass `onWipLimitChange={handleWipLimitChange}` to all four `<Board>` usages in `App.tsx`

## 4. Column — inline editable WIP limit input

- [x] 4.1 Add `onWipLimitChange: (statusId: string, value: number) => void` to `Column.tsx` Props type
- [x] 4.2 Add local draft state `draftWipLimit: string` in `Column.tsx`, initialized from `status.wipLimit?.toString() ?? ""`
- [x] 4.3 Sync draft state with `status.wipLimit` via `useEffect` when `status.wipLimit` changes (handles external resets)
- [x] 4.4 Replace the static WIP limit number in the column header with an `<input type="number">` that shows `draftWipLimit`, updates draft on `onChange`, and fires `onWipLimitChange` on `onBlur` and on `Enter` key (`onKeyDown`)
- [x] 4.5 Add `Escape` key handler in `onKeyDown` to revert draft to `status.wipLimit?.toString() ?? ""`
- [x] 4.6 Style the input inline: small font (`fontSize: 9`), dark background (`#0f172a`), white text, no border or minimal border (`border: "none"`), width matching ~2–3 digit numbers (`width: 28`)
- [x] 4.7 Ensure columns where `status.wipLimit == null` still render the `[c: <count>]` display without any `<input>` element
