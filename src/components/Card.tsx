import type { Workitem } from "../domain/types";

const LEVEL_COLORS: Record<string, string> = {
  L2: "#1d4ed8",
  L1: "#ea580c",
  L0: "#16a34a",
};

type Props = { item: Workitem };

export function Card({ item }: Props) {
  return (
    <div
      style={{
        background: LEVEL_COLORS[item.level] ?? "#334155",
        color: "white",
        fontSize: 9,
        fontWeight: 600,
        padding: "2px 4px",
        marginTop: 2,
        borderRadius: 2,
        textAlign: "center",
      }}
    >
      {item.id}
    </div>
  );
}
