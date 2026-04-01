import { useEffect, useState } from "react";
import { Board } from "./components/Board";
import {
  configLoadResult,
  defaultSimulationName,
  loadSimulation,
  simulationNames,
} from "./config/defaultConfig";
import type { HighlightMode, SimState, ViewMode } from "./domain/types";
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
  const [viewMode, setViewMode] = useState<ViewMode>("delivery");

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
  const visibleLevels = viewMode === "portafolio" ? [3, 2] : viewMode === "delivery" ? [2, 1, 0] : [3, 2, 1, 0];

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", padding: "6px 8px", boxSizing: "border-box" }}>
      {configLoadResult.error && (
        <div style={{ background: "#854d0e", color: "#fef08a", padding: "8px 12px", borderRadius: 4, marginBottom: 8, fontSize: 12, fontWeight: 600 }}>
          ⚠ {configLoadResult.error}
        </div>
      )}
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

        {/* Board view mode selector */}
        <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}>View:</span>
        {(["portafolio", "delivery", "full"] as ViewMode[]).map((mode) => (
          <label
            key={mode}
            style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: "white", fontSize: 11, fontWeight: 600 }}
          >
            <input
              type="radio"
              name="viewMode"
              value={mode}
              checked={viewMode === mode}
              onChange={() => setViewMode(mode)}
              style={{ cursor: "pointer", accentColor: "#94a3b8" }}
            />
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </label>
        ))}

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
          Before Commitment Point
        </button>
        <button
          style={highlightMode === "delivery" ? BTN_ACTIVE_STYLE : BTN_STYLE}
          onClick={() => toggleView("delivery")}
        >
          Pos Delivery Point
        </button>
      </div>

      {/* Boards — L3 arriba, L0 abajo */}
      {visibleLevels.includes(3) && (
        <Board
          workflow={workflows.L3}
          items={workitems.filter((w) => w.level === "L3")}
          highlightMode={highlightMode}
        />
      )}
      {visibleLevels.includes(2) && (
        <Board
          workflow={workflows.L2}
          items={workitems.filter((w) => w.level === "L2")}
          highlightMode={highlightMode}
        />
      )}
      {visibleLevels.includes(1) && (
        <Board
          workflow={workflows.L1}
          items={workitems.filter((w) => w.level === "L1")}
          highlightMode={highlightMode}
        />
      )}
      {visibleLevels.includes(0) && (
        <Board
          workflow={workflows.L0}
          items={workitems.filter((w) => w.level === "L0")}
          highlightMode={highlightMode}
        />
      )}
    </div>
  );
}
