import { useEffect, useRef, useState } from "react";
import type { HighlightMode, Status, Workitem } from "../domain/types";
import { Card } from "./Card";

const DONE_COLUMN_SCROLL_THRESHOLD = 5;
const CARD_HEIGHT_PX = 18;

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
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [dodOpen, setDodOpen] = useState(false);

  useEffect(() => {
    if (status.statusCategory === "DONE" && sortedItems.length > DONE_COLUMN_SCROLL_THRESHOLD && cardsContainerRef.current) {
      cardsContainerRef.current.scrollTop = cardsContainerRef.current.scrollHeight;
    }
  }, [sortedItems.length, status.statusCategory]);
  return (
    <div
      style={{
        flex: 1,
        minWidth: 60,
        minHeight: 60,
        position: "relative",
        background: getBg(status, highlightMode),
        border: getBorder(status, highlightMode),
        borderRadius: 3,
        padding: "2px 4px",
        borderTop: status.isBuffer ? "2px solid #8f9290" : undefined,
      }}
    >
      <div title={status.description || undefined} style={{ fontSize: 9, color: "white", fontWeight: 600, lineHeight: "13px", marginBottom: 1, textDecoration: status.isBeforeCommitmentPoint ? "underline" : "none" }}>
        {status.name} {status.wipLimit != null ? ` [ w: ${items.length}/ l: ${status.wipLimit}]` : ` [c: ${items.length}]`}{status.isBuffer && <span style={{ color: "#22c55e", marginLeft: 2 }}>✓</span>}
        {status.definitionOfDone && (
          <button onClick={() => setDodOpen(v => !v)} style={{ marginLeft: 4, fontSize: 7, padding: "0 3px", background: "#334155", color: "#94a3b8", border: "1px solid #475569", borderRadius: 2, cursor: "pointer", lineHeight: "11px" }}>DoD</button>
        )}
      </div>
      {dodOpen && status.definitionOfDone && (
        <div style={{ position: "absolute", zIndex: 10, top: 14, left: 0, right: 0, background: "#0f172a", border: "1px solid #475569", borderRadius: 3, padding: "4px 6px", color: "#e2e8f0", fontSize: 9, whiteSpace: "pre-wrap", lineHeight: "13px" }}>
          {status.definitionOfDone}
        </div>
      )}
      <div
        ref={cardsContainerRef}
        style={{
          overflowY: status.statusCategory === "DONE" && sortedItems.length > DONE_COLUMN_SCROLL_THRESHOLD ? "auto" : undefined,
          maxHeight: status.statusCategory === "DONE" && sortedItems.length > DONE_COLUMN_SCROLL_THRESHOLD ? DONE_COLUMN_SCROLL_THRESHOLD * CARD_HEIGHT_PX : undefined,
        }}
      >
        {sortedItems.map((item) => (
          <Card key={item.id} item={item} isBuffer={status.isBuffer} currentTick={currentTick} />
        ))}
      </div>
    </div>
  );
}
