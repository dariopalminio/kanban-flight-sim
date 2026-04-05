import type { ViewMode } from "../domain/types";

interface SimulationSelectorProps {
  selectedSim: string;
  simulationNames: string[];
  viewMode: ViewMode;
  onSimChange: (name: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

export function SimulationSelector({
  selectedSim,
  simulationNames,
  viewMode,
  onSimChange,
  onViewModeChange,
}: SimulationSelectorProps) {

  const viewModeOptions: ViewMode[] = ["portafolio", "delivery", "full", "L3", "L2", "L1"];
  
  return (
    <>
      {/* Selección de Workflow a mostrar y simular */}
      <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>Simulations:</span>
      <select
        value={selectedSim}
        onChange={(e) => onSimChange(e.target.value)}
        style={{
          padding: "3px 6px",
          fontSize: 11,
          fontWeight: 600,
          borderRadius: 4,
          border: "1px solid #475569",
          background: "#0f172a",
          color: "white",
          cursor: "pointer",
        }}
      >
        {simulationNames.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      {/* Selección del modo de vista de tableros */}
      <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>View:</span>
      <select
        value={viewMode}
        onChange={(e) => onViewModeChange(e.target.value as ViewMode)}
        style={{
          background: "#1e293b",
          color: "white",
          border: "1px solid #475569",
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          padding: "2px 4px",
          cursor: "pointer",
        }}
      >
        {viewModeOptions.map((mode) => (
          <option key={mode} value={mode}>
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </option>
        ))}
      </select>
    </>
  );
}
