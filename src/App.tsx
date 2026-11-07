import { useEffect, useMemo, useState } from "react";
import "./App.css";
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
import type { Config, HighlightMode, SimState, ViewMode } from "./domain/types";
import { canToggleL0, getActiveHierarchy, getConfiguredWorkflows } from "./domain/hierarchy";
import { normalizeView, visibleLevels } from "./domain/views";
import { buildInitialState, tick } from "./simulation/engine";

const AUTOPLAY_INTERVAL_MIN_MS = 100;
const AUTOPLAY_INTERVAL_MAX_MS = 5000;
const AUTOPLAY_INTERVAL_STEP_MS = 100;
const AUTOPLAY_INTERVAL_DEFAULT_MS = 500;

export default function App() {
  const [selectedSim, setSelectedSim] = useState(
    simulationNames.includes(defaultSimulationName) ? defaultSimulationName : simulationNames[0]
  );
  const [config, setConfig] = useState<Config>(() => {
    if (!configLoadResult.config) throw new Error(configLoadResult.error ?? "No simulation configuration available");
    return configLoadResult.config;
  });
  const [loadError, setLoadError] = useState<Error | null>(null);

  const [simState, setSimState] = useState<SimState>(() => buildInitialState(config));
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayIntervalMs, setAutoplayIntervalMs] = useState(
    AUTOPLAY_INTERVAL_DEFAULT_MS
  );
  const [highlightMode, setHighlightMode] = useState<HighlightMode>("none");
  const [viewMode, setViewMode] = useState<ViewMode>("full");
  const [withoutL0, setWithoutL0] = useState(false);
  const [wipLimitOverrides, setWipLimitOverrides] = useState<Record<string, number>>({});

  const effectiveConfig = useMemo(() => {
    const workflows: Config["workflows"] = {};
    for (const wf of getConfiguredWorkflows(config.workflows)) {
      workflows[wf.level] = {
        ...wf,
        statuses: wf.statuses.map((s) => (
          s.id in wipLimitOverrides ? { ...s, wipLimit: wipLimitOverrides[s.id] } : s
        )),
      };
    }
    return { ...config, withoutL0, workflows };
  }, [config, withoutL0, wipLimitOverrides]);
  const activeWorkflows = getActiveHierarchy(effectiveConfig).workflows;
  const activeLevels = activeWorkflows.map((wf) => wf.level);

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
    let nextConfig: Config;
    try {
      nextConfig = loadSimulation(name);
    } catch (e) {
      setLoadError(e instanceof Error ? e : new Error(String(e)));
      setIsPlaying(false);
      return;
    }
    const nextWithoutL0 = withoutL0 && canToggleL0(nextConfig.workflows);
    const nextEffectiveConfig = { ...nextConfig, withoutL0: nextWithoutL0 };
    const nextState = buildInitialState(nextEffectiveConfig);
    setConfig(nextConfig);
    setSelectedSim(name);
    setWithoutL0(nextWithoutL0);
    setViewMode((mode) => normalizeView(mode, getActiveHierarchy(nextEffectiveConfig).workflows.map((wf) => wf.level)));
    setSimState(nextState);
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
    const nextConfig = { ...effectiveConfig, withoutL0: v };
    setWithoutL0(v);
    setViewMode((mode) => normalizeView(mode, getActiveHierarchy(nextConfig).workflows.map((wf) => wf.level)));
    setSimState(buildInitialState(nextConfig));
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

  const { workitems, tick: tickCount } = simState;
  const shownLevels = visibleLevels(viewMode, activeLevels);
  if (loadError) throw loadError;

  return (
    <div className="app-shell">
      <div className="app-panel">
        <div className="app-titlebar">
          <img
            src={logoUrl}
            alt="Kanba-Flight-Sim logo"
            height={28}
            width={28}
            style={{ display: "block" }}
          />
          <h1 className="app-title">Kanba-Flight-Sim</h1>
          <h2 className="app-subtitle">Simulador de Vuelo Kanban</h2>
        </div>

        {configLoadResult.error && (
          <div className="app-error-banner">Error: {configLoadResult.error}</div>
        )}

        <div className="app-toolbar">
          <SimulationSelector
            selectedSim={selectedSim}
            simulationNames={simulationNames}
            viewMode={viewMode}
            withoutL0={withoutL0}
            activeLevels={activeLevels}
            canToggleL0={canToggleL0(config.workflows)}
            onSimChange={handleSimChange}
            onViewModeChange={setViewMode}
            onWithoutL0Change={handleWithoutL0Change}
          />

          <span className="toolbar-separator">|</span>

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

          <span className="toolbar-separator">|</span>

          <KanbanSignalSelector
            highlightMode={highlightMode}
            onToggle={toggleView}
          />
        </div>

        {activeWorkflows.filter((wf) => shownLevels.includes(wf.level)).map((wf) => (
          <Board
            key={wf.level}
            workflow={wf}
            items={workitems.filter((w) => w.level === wf.level)}
            highlightMode={highlightMode}
            currentTick={simState.tick}
            onWipLimitChange={handleWipLimitChange}
          />
        ))}
      </div>
    </div>
  );
}
