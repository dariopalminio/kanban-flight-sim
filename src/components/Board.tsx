import type { HighlightMode, Workitem, Workflow } from "../domain/types";
import { Column } from "./Column";

const LEVEL_HEADER_COLORS: Record<string, string> = {
  L3: "var(--bd-blue-primary)",
  L2: "var(--bd-blue)",
  L1: "var(--bd-cyan-dark)",
  L0: "var(--bd-blue-deep)",
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
    <div className="board-wrap">
      <div
        className="board-chip"
        style={{
          background: LEVEL_HEADER_COLORS[workflow.level] ?? "var(--bd-blue-deep)",
        }}
      >
       BOARD:  {workflow.level} — {workflow.name}
      </div>
      <div className="board-columns">
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
