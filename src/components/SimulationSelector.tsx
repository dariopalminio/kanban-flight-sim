import type { ViewMode, WorkitemLevel } from "../domain/types";
import { availableViews, VIEW_MODES } from "../domain/views";

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

interface SimulationSelectorProps {
  selectedSim: string;
  simulationNames: string[];
  viewMode: ViewMode;
  withoutL0: boolean;
  activeLevels: WorkitemLevel[];
  canToggleL0: boolean;
  onSimChange: (name: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onWithoutL0Change: (v: boolean) => void;
}

export function SimulationSelector({
  selectedSim,
  simulationNames,
  viewMode,
  withoutL0,
  activeLevels,
  canToggleL0,
  onSimChange,
  onViewModeChange,
  onWithoutL0Change,
}: SimulationSelectorProps) {

  const viewModeOptions = availableViews(activeLevels);
  
  return (
    <>
      {/* Selección de Workflow a mostrar y simular */}
      <span className="control-label">Simulations:</span>
      <select
        className="control-select"
        value={selectedSim}
        onChange={(e) => onSimChange(e.target.value)}
      >
        {simulationNames.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      {/* Selección del modo de vista de tableros */}
      <span className="control-label">View:</span>
      <select
        className="control-select"
        value={viewMode}
        onChange={(e) => {
          const mode = VIEW_MODES.find((mode) => mode === e.target.value);
          if (mode) onViewModeChange(mode);
        }}
      >
        {viewModeOptions.map((mode) => (
          <option key={mode} value={mode}>
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </option>
        ))}
      </select>
      {/* Toggle Without L0 */}
      {canToggleL0 && <button
        className={`control-button ${withoutL0 ? "is-active" : ""}`}
        style={withoutL0 ? BTN_ACTIVE_STYLE : BTN_STYLE}
        onClick={() => onWithoutL0Change(!withoutL0)}
      >
        {withoutL0 ? "Without L0" : "With L0"}
      </button>}
    </>
  );
}
