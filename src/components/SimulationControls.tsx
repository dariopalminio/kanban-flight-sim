interface SimulationControlsProps {
  tickCount: number;
  autoplayIntervalMs: number;
  isPlaying: boolean;
  canSlower: boolean;
  canFaster: boolean;
  onStep: () => void;
  onTogglePlay: () => void;
  onReset: () => void;
  onSlower: () => void;
  onFaster: () => void;
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

export function SimulationControls({
  tickCount,
  autoplayIntervalMs,
  isPlaying,
  canSlower,
  canFaster,
  onStep,
  onTogglePlay,
  onReset,
  onSlower,
  onFaster,
}: SimulationControlsProps) {
  return (
    <>
      <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>
        Tick: {tickCount}
      </span>
      <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>
        Tick ms: {autoplayIntervalMs}
      </span>
      <button style={BTN_STYLE} onClick={onSlower} disabled={!canSlower}>
        Slower
      </button>
      <button style={BTN_STYLE} onClick={onFaster} disabled={!canFaster}>
        Faster
      </button>
      <button style={BTN_STYLE} onClick={onStep} disabled={isPlaying}>
        Step
      </button>
      <button
        style={isPlaying ? BTN_ACTIVE_STYLE : BTN_STYLE}
        onClick={onTogglePlay}
      >
        {isPlaying ? "Pause" : "Autoplay"}
      </button>
      <button style={BTN_STYLE} onClick={onReset}>
        Reset
      </button>
    </>
  );
}
