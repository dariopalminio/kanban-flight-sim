import type { ViewMode } from "../domain/types";

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

interface SimulationSelectorProps {
  selectedSim: string;
  simulationNames: string[];
  viewMode: ViewMode;
  withoutL0: boolean;
  onSimChange: (name: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onWithoutL0Change: (v: boolean) => void;
}

export function SimulationSelector({
  selectedSim,
  simulationNames,
  viewMode,
  withoutL0,
  onSimChange,
  onViewModeChange,
  onWithoutL0Change,
}: SimulationSelectorProps) {

  /* 
  El selector de simulaciones permite elegir entre las distintas simulaciones predefinidas, 
  y el selector de modo de vista permite cambiar la forma en que se muestran los tableros 
  (portafolio, delivery, full, o por nivel L3-L0).  La opción "full" muestra todos los tableros, 
  mientras que las opciones "L3", "L2" y "L1" muestran solo el tablero correspondiente a ese nivel, 
  la opción "portafolio" muestra solo los tableros de nivel L3 y L2, y la opción "delivery" 
  muestra solo el tablero de nivel L2 y L1.
  */
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
      {/* Toggle Without L0 */}
      <button
        style={withoutL0 ? BTN_ACTIVE_STYLE : BTN_STYLE}
        onClick={() => onWithoutL0Change(!withoutL0)}
      >
        {withoutL0 ? "Without L0" : "With L0"}
      </button>
    </>
  );
}
