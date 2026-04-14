import type { HighlightMode } from "../domain/types";

interface KanbanSignalSelectorProps {
  highlightMode: HighlightMode;
  onToggle: (mode: HighlightMode) => void;
}

const BTN_STYLE: React.CSSProperties = {
  padding: "4px 10px",
  fontSize: 11,
  fontWeight: 700,
  borderRadius: 8,
  border: "1px solid var(--bd-blue-shine)",
  cursor: "pointer",
  background: "var(--surface-panel-strong)",
  color: "var(--bd-blue-primary)",
};

const BTN_ACTIVE_STYLE: React.CSSProperties = {
  ...BTN_STYLE,
  background: "var(--bd-cyan)",
  borderColor: "var(--bd-cyan)",
  color: "var(--bd-black)",
};

const TOGGLES: { mode: HighlightMode; label: string }[] = [
  { mode: "stream", label: "Upstream / Downstream" },
  { mode: "category", label: "Status Category" },
  { mode: "commitment", label: "Before Commitment Point" },
  { mode: "delivery", label: "Pos Delivery Point" },
];

export function KanbanSignalSelector({
  highlightMode,
  onToggle,
}: KanbanSignalSelectorProps) {
  return (
    <>
      {TOGGLES.map(({ mode, label }) => (
        <button
          className={`control-button ${highlightMode === mode ? "is-active" : ""}`}
          key={mode}
          style={highlightMode === mode ? BTN_ACTIVE_STYLE : BTN_STYLE}
          onClick={() => onToggle(mode)}
        >
          {label}
        </button>
      ))}
    </>
  );
}
