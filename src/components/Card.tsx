import type { Workitem } from "../domain/types";

type Props = { item: Workitem; isBuffer?: boolean; currentTick: number };

export function Card({ item, isBuffer, currentTick }: Props) {
  const showReady = item.isReady && !isBuffer;
  const justMoved = item.enteredAt === currentTick;
  return (
    <div
      className="kanban-card"
      style={{
        background: item.color,
        borderLeft: showReady ? "3px solid var(--bd-cyan-bright)" : "3px solid transparent",
        boxShadow: showReady ? "0 0 8px rgba(43, 185, 255, 0.65)" : "none",
        animation: justMoved ? "tick-flash 0.6s ease-out" : "none",
      }}
    >
      {item.id}
      {showReady && (
        <span className="ready-badge">
          ✓
        </span>
      )}
    </div>
  );
}
