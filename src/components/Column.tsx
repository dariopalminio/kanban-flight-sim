import type { HighlightMode, Status, Workitem } from "../domain/types";
import { Card } from "./Card";

type Props = {
  status: Status;
  items: Workitem[];
  highlightMode: HighlightMode;
  currentTick: number;
};

const getBg = (status: Status, mode: HighlightMode): string => {
  if (mode === "stream") {
    return status.streamType === "UPSTREAM" ? "#e5b532" : "#2c85de";
  }
  if (mode === "category") {
    if (status.statusCategory === "TODO") return "#374151";
    if (status.statusCategory === "IN_PROGRESS") return "#1d4ed8";
    return "#166534";
  }
  if (mode === "commitment" && status.isBeforeCommitmentPoint) return "#ddb121";
  if (mode === "delivery" && status.isPosDeliveryPoint) return "#14532d";
  return "#1e293b";
};

const getBorder = (status: Status, mode: HighlightMode): string => {
  if (mode === "delivery" && status.isPosDeliveryPoint) return "1px solid #4ade80";
  return "1px solid #334155";
};

export function Column({ status, items, highlightMode, currentTick }: Props) {
  const sortedItems = [...items].sort((a, b) => a.enteredAt - b.enteredAt);
  return (
    <div
      style={{
        flex: 1,
        minWidth: 60,
        minHeight: 60,
        background: getBg(status, highlightMode),
        border: getBorder(status, highlightMode),
        borderRadius: 3,
        padding: "2px 4px",
        borderTop: status.isBuffer ? "2px solid #22c55e" : undefined,
      }}
    >
      <div title={status.description || undefined} style={{ fontSize: 9, color: "white", fontWeight: 600, lineHeight: "13px", marginBottom: 1, textDecoration: status.isBeforeCommitmentPoint ? "underline" : "none" }}>
        {status.name}{status.wipLimit != null ? ` [${items.length}/${status.wipLimit}]` : ""}{status.isBuffer && <span style={{ color: "#22c55e", marginLeft: 2 }}>✓</span>}
      </div>
      {sortedItems.map((item) => (
        <Card key={item.id} item={item} isBuffer={status.isBuffer} currentTick={currentTick} />
      ))}
    </div>
  );
}
