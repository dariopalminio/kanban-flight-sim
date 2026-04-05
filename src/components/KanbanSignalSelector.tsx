import type { HighlightMode } from "../domain/types";

interface KanbanSignalSelectorProps {
  highlightMode: HighlightMode;
  onToggle: (mode: HighlightMode) => void;
}

const BTN_STYLE: React.CSSProperties = {
  padding: "4px 10px",
  fontSize: 11,
  fontWeight: 600,
  borderRadius: 4,
  border: "1px solid #475569",
  cursor: "pointer",
  background: "#1e293b",
  color: "white",
};

const BTN_ACTIVE_STYLE: React.CSSProperties = {
  ...BTN_STYLE,
  background: "#334155",
  borderColor: "#94a3b8",
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
