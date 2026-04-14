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
  fontWeight: 700,
  borderRadius: 8,
  border: "1px solid var(--bd-blue-shine)",
  cursor: "pointer",
  background: "var(--surface-panel-strong)",
  color: "var(--bd-blue-primary)",
};

const BTN_ACTIVE_STYLE: React.CSSProperties = {
  ...BTN_STYLE,
  background: "var(--bd-cyan)",
  borderColor: "var(--bd-cyan)",
  color: "var(--bd-black)",
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
      <span className="control-label">
        Tick: {tickCount}
      </span>
      <span className="control-label">
        Tick ms: {autoplayIntervalMs}
      </span>
      <button className="control-button" style={BTN_STYLE} onClick={onSlower} disabled={!canSlower}>
        <ChevronsLeft size={12} style={ICON_STYLE} />Slower
      </button>
      <button className="control-button" style={BTN_STYLE} onClick={onFaster} disabled={!canFaster}>
        <ChevronsRight size={12} style={ICON_STYLE} />Faster
      </button>
      <button className="control-button is-cta" style={BTN_STYLE} onClick={onStep} disabled={isPlaying}>
        <ChevronRight size={12} style={ICON_STYLE} />Step
      </button>
      <button
        className={`control-button ${isPlaying ? "is-active" : ""}`}
        style={isPlaying ? BTN_ACTIVE_STYLE : BTN_STYLE}
        onClick={onTogglePlay}
      >
        {isPlaying ? <><Pause size={12} style={ICON_STYLE} />Pause</> : <><Play size={12} style={ICON_STYLE} />Autoplay</>}
      </button>
      <button className="control-button" style={BTN_STYLE} onClick={onReset}>
        <RotateCcw size={12} style={ICON_STYLE} />Reset
      </button>
    </>
  );
}
