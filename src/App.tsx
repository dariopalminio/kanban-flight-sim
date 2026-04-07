import { useEffect, useState } from "react";
import { Board } from "./components/Board";
import { KanbanSignalSelector } from "./components/KanbanSignalSelector";
import { SimulationControls } from "./components/SimulationControls";
import { SimulationSelector } from "./components/SimulationSelector";
import logoUrl from "./assets/logo-kanban-flight-sim.svg";
import {
  configLoadResult,
  defaultSimulationName,
  loadSimulation,
  simulationNames,
} from "./config/defaultConfig";
import type { HighlightMode, SimState, ViewMode } from "./domain/types";
import { buildInitialState, tick } from "./simulation/engine";

const AUTOPLAY_INTERVAL_MIN_MS = 100;
const AUTOPLAY_INTERVAL_MAX_MS = 5000;
const AUTOPLAY_INTERVAL_STEP_MS = 100;
const AUTOPLAY_INTERVAL_DEFAULT_MS = 500;

export default function App() {
  const [selectedSim, setSelectedSim] = useState(defaultSimulationName);
  const config = loadSimulation(selectedSim);

  const [simState, setSimState] = useState<SimState>(buildInitialState(config));
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayIntervalMs, setAutoplayIntervalMs] = useState(
    AUTOPLAY_INTERVAL_DEFAULT_MS
  );
  const [highlightMode, setHighlightMode] = useState<HighlightMode>("none");
  const [viewMode, setViewMode] = useState<ViewMode>("full");
  const [withoutL0, setWithoutL0] = useState(false);
  const [wipLimitOverrides, setWipLimitOverrides] = useState<Record<string, number>>({});

  const patchWorkflowWipLimits = (wf: typeof config.workflows) => {
    const patch = (statuses: typeof wf.L0.statuses) =>
      statuses.map((s) => (s.id in wipLimitOverrides ? { ...s, wipLimit: wipLimitOverrides[s.id] } : s));
    return {
      L3: { ...wf.L3, statuses: patch(wf.L3.statuses) },
      L2: { ...wf.L2, statuses: patch(wf.L2.statuses) },
      L1: { ...wf.L1, statuses: patch(wf.L1.statuses) },
      L0: { ...wf.L0, statuses: patch(wf.L0.statuses) },
    };
  };

  const effectiveConfig = { ...config, withoutL0, workflows: patchWorkflowWipLimits(config.workflows) };

  // Autoplay
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(
      () => setSimState((s) => tick(s, effectiveConfig)),
      autoplayIntervalMs
    );
    return () => clearInterval(id);
  }, [isPlaying, effectiveConfig, autoplayIntervalMs]);

  const clampAutoplayInterval = (value: number) =>
    Math.min(
      AUTOPLAY_INTERVAL_MAX_MS,
      Math.max(AUTOPLAY_INTERVAL_MIN_MS, value)
    );

  const handleWipLimitChange = (statusId: string, value: number) => {
    setWipLimitOverrides((prev) => ({ ...prev, [statusId]: value }));
  };

  const handleSimChange = (name: string) => {
    setSelectedSim(name);
    setSimState(buildInitialState(loadSimulation(name)));
    setIsPlaying(false);
    setAutoplayIntervalMs(AUTOPLAY_INTERVAL_DEFAULT_MS);
    setWipLimitOverrides({});
  };

  const handleStep = () => setSimState((s) => tick(s, effectiveConfig));

  const handleReset = () => {
    setSimState(buildInitialState(effectiveConfig));
    setIsPlaying(false);
    setAutoplayIntervalMs(AUTOPLAY_INTERVAL_DEFAULT_MS);
    setWipLimitOverrides({});
  };

  const handleWithoutL0Change = (v: boolean) => {
    setWithoutL0(v);
    setSimState(buildInitialState({ ...config, withoutL0: v }));
    setIsPlaying(false);
    setAutoplayIntervalMs(AUTOPLAY_INTERVAL_DEFAULT_MS);
  };

  const handleSlower = () =>
    setAutoplayIntervalMs((ms) =>
      clampAutoplayInterval(ms + AUTOPLAY_INTERVAL_STEP_MS)
    );

  const handleFaster = () =>
    setAutoplayIntervalMs((ms) =>
      clampAutoplayInterval(ms - AUTOPLAY_INTERVAL_STEP_MS)
    );

  const toggleView = (mode: HighlightMode) =>
    setHighlightMode((prev) => (prev === mode ? "none" : mode));

  const { workflows } = effectiveConfig;
  const { workitems, tick: tickCount } = simState;
  const VISIBLE_LEVELS: Record<ViewMode, number[]> = {
    portafolio: [3, 2],
    delivery: [2, 1, 0],
    full: [3, 2, 1, 0],
    L3: [3],
    L2: [2],
    L1: [1],
  };
  const visibleLevels = VISIBLE_LEVELS[viewMode].filter((l) => !(withoutL0 && l === 0));

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", padding: "6px 8px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0 6px 0" }}>
        <img
          src={logoUrl}
          alt="Kanba-Flight-Sim logo"
          height={28}
          width={28}
          style={{ display: "block" }}
        />
        <h1 style={{ margin: 0, color: "#e2e8f0", fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
          Kanba-Flight-Sim
        </h1>
        <h1 style={{ margin: 0, color: "#63a1f1", fontSize: 18, fontWeight: 500, lineHeight: 1 }}>
          Simulador de Vuelo Kanban
        </h1>
      </div>

      {configLoadResult.error && (
        <div style={{ background: "#854d0e", color: "#fef08a", padding: "8px 12px", borderRadius: 4, marginBottom: 8, fontSize: 12, fontWeight: 600 }}>
          ⚠ {configLoadResult.error}
        </div>
      )}
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
        <SimulationSelector
          selectedSim={selectedSim}
          simulationNames={simulationNames}
          viewMode={viewMode}
          withoutL0={withoutL0}
          onSimChange={handleSimChange}
          onViewModeChange={setViewMode}
          onWithoutL0Change={handleWithoutL0Change}
        />

        <span style={{ color: "#475569", fontSize: 11 }}>|</span>

        <SimulationControls
          tickCount={tickCount}
          autoplayIntervalMs={autoplayIntervalMs}
          isPlaying={isPlaying}
          canSlower={autoplayIntervalMs < AUTOPLAY_INTERVAL_MAX_MS}
          canFaster={autoplayIntervalMs > AUTOPLAY_INTERVAL_MIN_MS}
          onStep={handleStep}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onReset={handleReset}
          onSlower={handleSlower}
          onFaster={handleFaster}
        />

        <span style={{ color: "#475569", fontSize: 11, marginLeft: 4 }}>|</span>

        <KanbanSignalSelector
          highlightMode={highlightMode}
          onToggle={toggleView}
        />
      </div>

      {/* Boards — L3 arriba, L0 abajo */}
      {visibleLevels.includes(3) && (
        <Board
          workflow={workflows.L3}
          items={workitems.filter((w) => w.level === "L3")}
          highlightMode={highlightMode}
          currentTick={simState.tick}
          onWipLimitChange={handleWipLimitChange}
        />
      )}
      {visibleLevels.includes(2) && (
        <Board
          workflow={workflows.L2}
          items={workitems.filter((w) => w.level === "L2")}
          highlightMode={highlightMode}
          currentTick={simState.tick}
          onWipLimitChange={handleWipLimitChange}
        />
      )}
      {visibleLevels.includes(1) && (
        <Board
          workflow={workflows.L1}
          items={workitems.filter((w) => w.level === "L1")}
          highlightMode={highlightMode}
          currentTick={simState.tick}
          onWipLimitChange={handleWipLimitChange}
        />
      )}
      {visibleLevels.includes(0) && (
        <Board
          workflow={workflows.L0}
          items={workitems.filter((w) => w.level === "L0")}
          highlightMode={highlightMode}
          currentTick={simState.tick}
          onWipLimitChange={handleWipLimitChange}
        />
      )}
    </div>
  );
}
