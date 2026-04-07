import type { HighlightMode, Workitem, Workflow } from "../domain/types";
import { Column } from "./Column";

const LEVEL_HEADER_COLORS: Record<string, string> = {
  L3: "#4c1d95",
  L2: "#04288b",
  L1: "#ad4208",
  L0: "#2e4e3a",
};

type Props = {
  workflow: Workflow;
  items: Workitem[];
  highlightMode: HighlightMode;
  currentTick: number;
  onWipLimitChange: (statusId: string, value: number) => void;
};

export function Board({ workflow, items, highlightMode, currentTick, onWipLimitChange }: Props) {
  return (
    <div style={{ marginBottom: 3 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "white",
          background: LEVEL_HEADER_COLORS[workflow.level] ?? "#334155",
          padding: "0px 6px",
          lineHeight: "16px",
          borderRadius: "3px 3px 0 0",
          marginBottom: 2,
          display: "inline-block",
        }}
      >
       BOARD:  {workflow.level} — {workflow.name}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, width: "100%" }}>
        {workflow.statuses.map((status) => (
          <Column
            key={status.id}
            status={status}
            items={items.filter((w) => w.statusId === status.id)}
            highlightMode={highlightMode}
            currentTick={currentTick}
            onWipLimitChange={onWipLimitChange}
          />
        ))}
      </div>
    </div>
  );
}
