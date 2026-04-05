import { ChevronRight, ChevronsLeft, ChevronsRight, Pause, Play, RotateCcw } from "lucide-react";

const ICON_STYLE: React.CSSProperties = { verticalAlign: "middle", marginRight: 3 };

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
        <ChevronsLeft size={12} style={ICON_STYLE} />Slower
      </button>
      <button style={BTN_STYLE} onClick={onFaster} disabled={!canFaster}>
        <ChevronsRight size={12} style={ICON_STYLE} />Faster
      </button>
      <button style={BTN_STYLE} onClick={onStep} disabled={isPlaying}>
        <ChevronRight size={12} style={ICON_STYLE} />Step
      </button>
      <button
        style={isPlaying ? BTN_ACTIVE_STYLE : BTN_STYLE}
        onClick={onTogglePlay}
      >
        {isPlaying ? <><Pause size={12} style={ICON_STYLE} />Pause</> : <><Play size={12} style={ICON_STYLE} />Autoplay</>}
      </button>
      <button style={BTN_STYLE} onClick={onReset}>
        <RotateCcw size={12} style={ICON_STYLE} />Reset
      </button>
    </>
  );
}
