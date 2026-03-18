import type { HighlightMode, Workitem, Workflow } from "../domain/types";
import { Column } from "./Column";

const LEVEL_HEADER_COLORS: Record<string, string> = {
  L2: "#1d4ed8",
  L1: "#ea580c",
  L0: "#16a34a",
};

type Props = {
  workflow: Workflow;
  items: Workitem[];
  highlightMode: HighlightMode;
};

export function Board({ workflow, items, highlightMode }: Props) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "white",
          background: LEVEL_HEADER_COLORS[workflow.level] ?? "#334155",
          padding: "3px 6px",
          borderRadius: "3px 3px 0 0",
          marginBottom: 4,
          display: "inline-block",
        }}
      >
        Kanban Board: {workflow.level} — {workflow.name}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {workflow.statuses.map((status) => (
          <Column
            key={status.id}
            status={status}
            items={items.filter((w) => w.statusId === status.id)}
            highlightMode={highlightMode}
          />
        ))}
      </div>
    </div>
  );
}
