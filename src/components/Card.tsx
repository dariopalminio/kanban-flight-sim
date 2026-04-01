import type { Workitem } from "../domain/types";

type Props = { item: Workitem; isBuffer?: boolean; currentTick: number };

export function Card({ item, isBuffer, currentTick }: Props) {
  const showReady = item.isReady && !isBuffer;
  const justMoved = item.enteredAt === currentTick;
  return (
    <div
      style={{
        position: "relative",
        background: item.color,
        color: "white",
        fontSize: 9,
        fontWeight: 600,
        padding: "0px 4px",
        marginTop: 4,
        lineHeight: "18px",
        borderRadius: 2,
        textAlign: "center",
        borderLeft: showReady ? "3px solid #22c55e" : "3px solid transparent",
        boxShadow: showReady ? "0 0 5px #22c55e88" : "none",
        animation: justMoved ? "tick-flash 0.6s ease-out" : "none",
      }}
    >
      {item.id}
      {showReady && (
        <span
          style={{
            position: "absolute",
            right: -1,
            top: -4,
            fontSize: 9,
            fontWeight: 900,
            lineHeight: 1,
            color: "#0f172a",
            background: "#22c55e",
            borderRadius: "50%",
            width: 11,
            height: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✓
        </span>
      )}
    </div>
  );
}
