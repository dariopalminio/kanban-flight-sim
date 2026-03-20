import type { Workitem } from "../domain/types";

const LEVEL_COLORS: Record<string, string> = {
  L3: "#7c3aed",
  L2: "#1d4ed8",
  L1: "#1f6e79",
  L0: "#ea580c",
};

type Props = { item: Workitem; isBuffer?: boolean };

export function Card({ item, isBuffer }: Props) {
  const showReady = item.isReady && !isBuffer;
  return (
    <div
      style={{
        position: "relative",
        background: LEVEL_COLORS[item.level] ?? "#334155",
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
