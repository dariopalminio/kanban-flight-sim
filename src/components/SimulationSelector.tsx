import type { ViewMode } from "../domain/types";

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
        onChange={(e) => onViewModeChange(e.target.value as ViewMode)}
      >
        {viewModeOptions.map((mode) => (
          <option key={mode} value={mode}>
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </option>
        ))}
      </select>
      {/* Toggle Without L0 */}
      <button
        className={`control-button ${withoutL0 ? "is-active" : ""}`}
        style={withoutL0 ? BTN_ACTIVE_STYLE : BTN_STYLE}
        onClick={() => onWithoutL0Change(!withoutL0)}
      >
        {withoutL0 ? "Without L0" : "With L0"}
      </button>
    </>
  );
}
