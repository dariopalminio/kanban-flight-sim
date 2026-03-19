import { useEffect, useState } from "react";
import { Board } from "./components/Board";
import {
  defaultSimulationName,
  loadSimulation,
  simulationNames,
} from "./config/defaultConfig";
import type { HighlightMode, SimState } from "./domain/types";
import { buildInitialState, tick } from "./simulation/engine";

const AUTOPLAY_INTERVAL_MS = 1000;

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

export default function App() {
  const [selectedSim, setSelectedSim] = useState(defaultSimulationName);
  const config = loadSimulation(selectedSim);

  const [simState, setSimState] = useState<SimState>(buildInitialState(config));
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightMode, setHighlightMode] = useState<HighlightMode>("none");

  // Autoplay
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(
      () => setSimState((s) => tick(s, config)),
      AUTOPLAY_INTERVAL_MS
    );
    return () => clearInterval(id);
  }, [isPlaying, config]);

  const handleSimChange = (name: string) => {
    setSelectedSim(name);
    setSimState(buildInitialState(loadSimulation(name)));
    setIsPlaying(false);
  };

  const handleStep = () => setSimState((s) => tick(s, config));

  const handleReset = () => {
    setSimState(buildInitialState(config));
    setIsPlaying(false);
  };

  const toggleView = (mode: HighlightMode) =>
    setHighlightMode((prev) => (prev === mode ? "none" : mode));

  const { workflows } = config;
  const { workitems, tick: tickCount } = simState;

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", padding: "6px 8px", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
        {/* Simulation selector */}
                <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>
          Simulations:
        </span>
        <select
          value={selectedSim}
          onChange={(e) => handleSimChange(e.target.value)}
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

        <span style={{ color: "#475569", fontSize: 11 }}>|</span>

        <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>
          Tick: {tickCount}
        </span>

        {/* Simulation controls */}
        <button style={BTN_STYLE} onClick={handleStep} disabled={isPlaying}>
          Step
        </button>
        <button
          style={isPlaying ? BTN_ACTIVE_STYLE : BTN_STYLE}
          onClick={() => setIsPlaying((p) => !p)}
        >
          {isPlaying ? "Pause" : "Autoplay"}
        </button>
        <button style={BTN_STYLE} onClick={handleReset}>
          Reset
        </button>

        <span style={{ color: "#475569", fontSize: 11, marginLeft: 4 }}>|</span>

        {/* View toggles (mutually exclusive) */}
        <button
          style={highlightMode === "stream" ? BTN_ACTIVE_STYLE : BTN_STYLE}
          onClick={() => toggleView("stream")}
        >
          Upstream / Downstream
        </button>
        <button
          style={highlightMode === "category" ? BTN_ACTIVE_STYLE : BTN_STYLE}
          onClick={() => toggleView("category")}
        >
          Status Category
        </button>
        <button
          style={highlightMode === "commitment" ? BTN_ACTIVE_STYLE : BTN_STYLE}
          onClick={() => toggleView("commitment")}
        >
          Commitment Status
        </button>
        <button
          style={highlightMode === "delivery" ? BTN_ACTIVE_STYLE : BTN_STYLE}
          onClick={() => toggleView("delivery")}
        >
          Delivery Status
        </button>
      </div>

      {/* Boards — L3 arriba, L0 abajo */}
      <Board
        workflow={workflows.L3}
        items={workitems.filter((w) => w.level === "L3")}
        highlightMode={highlightMode}
      />
      <Board
        workflow={workflows.L2}
        items={workitems.filter((w) => w.level === "L2")}
        highlightMode={highlightMode}
      />
      <Board
        workflow={workflows.L1}
        items={workitems.filter((w) => w.level === "L1")}
        highlightMode={highlightMode}
      />
      <Board
        workflow={workflows.L0}
        items={workitems.filter((w) => w.level === "L0")}
        highlightMode={highlightMode}
      />
    </div>
  );
}
