import assert from "node:assert/strict";
import fs from "node:fs";
import { loadTypescript } from "./load-typescript.mjs";

const { buildConfig } = loadTypescript("src\\config\\modelConfig.ts");
const { buildInitialState, tick } = loadTypescript("src\\simulation\\engine.ts");
const { getActiveHierarchy, canToggleL0 } = loadTypescript("src\\domain\\hierarchy.ts");
const { availableViews, visibleLevels, normalizeView } = loadTypescript("src\\domain\\views.ts");
const { SimulationSelector } = loadTypescript("src\\components\\SimulationSelector.tsx");
const template = JSON.parse(fs.readFileSync("src\\config\\models\\essential-kanban-fl.json", "utf8"));
const levels = ["L3", "L2", "L1", "L0"];

function model(subset) {
  const raw = structuredClone(template);
  raw.initialReleaseCount = 1;
  raw.advanceProbability = 1;
  raw.childrenPerParent = 2;
  raw.demandInterval = 0;
  raw.workflows = Object.fromEntries(subset.map((level) => [level, raw.workflows[level]]));
  for (const wf of Object.values(raw.workflows)) for (const status of wf.statuses) delete status.wipLimit;
  return raw;
}

function freeze(value) {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const child of Object.values(value)) freeze(child);
  }
  return value;
}

const subsets = [];
for (let first = 0; first < 4; first++) {
  for (let last = first; last < 4; last++) subsets.push(levels.slice(first, last + 1));
}
assert.equal(subsets.length, 10);
for (const subset of subsets) {
  const raw = model(subset);
  const config = freeze(buildConfig(raw));
  const reversed = { ...raw, workflows: Object.fromEntries(Object.entries(raw.workflows).reverse()) };
  assert.deepEqual(buildConfig(reversed), config, `${subset}: JSON key order`);
  const { root, leaf, workflows } = getActiveHierarchy(config);
  assert.equal(root.level, subset[0]);
  assert.equal(leaf.level, subset.at(-1));
  assert.deepEqual(workflows.map((wf) => wf.level), subset);
  let state = buildInitialState(config);
  assert.equal(state.workitems.length, 1);
  assert.equal(state.workitems[0].id, `${root.workitemName.slice(0, 4).toUpperCase()}-1`);
  assert.equal(state.workitems[0].parentId, undefined);
  assert.equal(state.workitems[0].color, "#0972b8");
  for (const level of levels) assert.equal(state.idCounters[level], level === root.level ? 1 : 0);
  for (let count = 0; count < 200; count++) {
    const before = structuredClone(state);
    const configBefore = structuredClone(config);
    state = tick(freeze(state), config);
    assert.equal(state.tick, before.tick + 1);
    assert.deepEqual(config, configBefore);
    assert.ok(state.workitems.every((item) => subset.includes(item.level)));
    if (state.workitems.every((item) => config.workflows[item.level].statuses.find((s) => s.id === item.statusId).isPosDeliveryPoint)) break;
  }
  assert.ok(state.tick <= 200);
  assert.ok(state.workitems.every((item) => config.workflows[item.level].statuses.find((s) => s.id === item.statusId).isPosDeliveryPoint), `${subset}: delivery within 200 ticks`);
  for (const [index, level] of subset.entries()) {
    assert.equal(state.idCounters[level], 2 ** index);
    assert.equal(state.workitems.filter((item) => item.level === level).length, 2 ** index);
  }
  for (const item of state.workitems.filter((item) => item.parentId)) {
    const parent = state.workitems.find((parent) => parent.id === item.parentId);
    assert.equal(subset.indexOf(parent.level), subset.indexOf(item.level) - 1);
    assert.match(item.id, new RegExp(`^${config.workflows[item.level].workitemName.slice(0, 4).toUpperCase()}-\\d+p${parent.id.split("p")[0]}$`));
    if (item.level === "L2") assert.notEqual(item.color, parent.color);
    else assert.equal(item.color, parent.color);
  }

  const demandConfig = buildConfig(raw);
  demandConfig.advanceProbability = 0;
  demandConfig.demandInterval = 5;
  let demandState = buildInitialState(demandConfig);
  for (let tickNumber = 1; tickNumber <= 10; tickNumber++) {
    demandState = tick(demandState, demandConfig);
    assert.equal(demandState.idCounters[root.level], 1 + Math.floor(tickNumber / 5));
    assert.equal(demandState.workitems.length, 1 + Math.floor(tickNumber / 5));
    if (tickNumber % 5 === 0) {
      const item = demandState.workitems.at(-1);
      assert.equal(item.enteredAt, tickNumber);
      assert.equal(item.statusId, root.statuses[0].id);
      assert.equal(item.parentId, undefined);
      assert.equal(item.color, tickNumber === 5 ? "#9b59b6" : "#e91e63");
    }
  }
  demandConfig.workflows[root.level].statuses[0].wipLimit = 1;
  const fullEntry = buildInitialState(demandConfig);
  fullEntry.tick = 4;
  const blocked = tick(freeze(fullEntry), freeze(demandConfig));
  assert.equal(blocked.workitems.length, 1);
  assert.deepEqual(blocked.idCounters, fullEntry.idCounters);
  assert.deepEqual(visibleLevels("full", subset), subset);
  for (const view of availableViews(subset)) assert.ok(visibleLevels(view, subset).length > 0);
}

const invalid = [
  ["empty", (raw) => { raw.workflows = {}; }, /at least one workflow/],
  ["gap", (raw) => { delete raw.workflows.L2; }, /missing intermediate workflow L2/],
  ["unknown", (raw) => { raw.workflows.L4 = raw.workflows.L3; }, /unknown workflow level "L4"/],
  ["mismatch", (raw) => { raw.workflows.L2.level = "L1"; }, /L2.level must match L2/],
  ["null", (raw) => { raw.workflows.L2 = null; }, /L2 must be an object/],
  ["missing field", (raw) => { delete raw.workflows.L2.id; }, /L2.id/],
  ["empty statuses", (raw) => { raw.workflows.L2.statuses = []; }, /L2.statuses must be a non-empty array/],
  ["null status", (raw) => { raw.workflows.L2.statuses[0] = null; }, /statuses\[0\] must be an object/],
  ["status type", (raw) => { raw.workflows.L2.statuses[0].isBeforeCommitmentPoint = "true"; }, /must be a boolean/],
  ["order gap", (raw) => { raw.workflows.L2.statuses[1].order = 20; }, /consecutive and ascending/],
  ["commitment", (raw) => { raw.workflows.L2.statuses.forEach((s) => { s.isBeforeCommitmentPoint = false; }); }, /missing commitment/],
  ["downstream", (raw) => { raw.workflows.L2.statuses.forEach((s) => { s.streamType = "UPSTREAM"; }); }, /secondDownstream/],
  ["delivery", (raw) => { raw.workflows.L2.statuses.forEach((s) => { s.isPosDeliveryPoint = false; }); }, /delivery/],
  ["parameter", (raw) => { delete raw.initialReleaseCount; }, /initialReleaseCount must be a finite number/],
];
for (const [name, mutate, expected] of invalid) {
  const raw = model(levels);
  mutate(raw);
  assert.throws(() => buildConfig(raw), expected, name);
}

// Exercise the public glob loader's startup and selected-model error contracts.
function loader(raw, defaultModel = raw.name) {
  return loadTypescript("src\\config\\defaultConfig.ts", (source) => source
    .replace('import rootJson from "./defaultConfig.json";', `const rootJson = ${JSON.stringify({ defaultModel })};`)
    .replace(/const modules = import\.meta\.glob[^;]+;/, `const modules = ${JSON.stringify({ "./models/test.json": { default: raw } })};`));
}
for (const [, mutate, expected] of invalid) {
  const raw = model(levels);
  mutate(raw);
  const api = loader(raw);
  assert.equal(api.configLoadResult.config, null);
  assert.match(api.configLoadResult.error, expected);
  assert.match(api.configLoadResult.error, /Model "Essential Kanban FL"/);
  assert.throws(() => api.loadSimulation(raw.name), expected);
}
const sddf = JSON.parse(fs.readFileSync("src\\config\\models\\sddf-workflows.json", "utf8"));
const sddfApi = loader(sddf);
assert.deepEqual(Object.keys(sddfApi.loadSimulation(sddf.name).workflows), ["L2", "L1"]);
assert.ok(sddfApi.configLoadResult.config);
for (const raw of [null, [], {}, { name: 42 }]) {
  const api = loader(raw, "test");
  assert.equal(api.configLoadResult.config, null);
  assert.match(api.configLoadResult.error, /Model file.*(must be an object|name must be a non-empty string)/);
  assert.throws(() => api.loadSimulation("test"), /Model file/);
}
const sddfConfig = { ...sddfApi.loadSimulation(sddf.name), advanceProbability: 1, demandInterval: 0, initialReleaseCount: 1, childrenPerParent: 2 };
let sddfState = buildInitialState(sddfConfig);
for (let i = 0; i < 200; i++) sddfState = tick(freeze(sddfState), freeze(sddfConfig));
assert.ok(sddfState.workitems.every((item) => sddfConfig.workflows[item.level].statuses.find((s) => s.id === item.statusId).isPosDeliveryPoint), "Actual SDDF work delivered");
for (const file of fs.readdirSync("src\\config\\models")) {
  const raw = JSON.parse(fs.readFileSync(`src\\config\\models\\${file}`, "utf8"));
  assert.deepEqual(Object.keys(buildConfig(raw).workflows), levels.filter((level) => raw.workflows[level]));
}

// Pull capacity, FIFO, same-slot parent progression and auto-ready timing for each active pair.
for (const pair of [["L3", "L2"], ["L2", "L1"], ["L1", "L0"]]) {
  const config = buildConfig(model(pair));
  const parentWf = config.workflows[pair[0]];
  const childWf = config.workflows[pair[1]];
  parentWf.statuses[2].wipLimit = 1;
  const parent = { id: "parent", level: pair[0], statusId: parentWf.statuses[1].id, enteredAt: 0, color: "#0972b8" };
  const child = { id: "child", level: pair[1], parentId: parent.id, statusId: childWf.statuses[1].id, enteredAt: 0, color: parent.color, isReady: true };
  const follower = { ...child, id: "follower", enteredAt: 1 };
  const blocker = { ...parent, id: "blocker", statusId: parentWf.statuses[2].id };
  const state = { tick: 0, idCounters: { L0: 0, L1: 0, L2: 0, L3: 0 }, workitems: [parent, child, follower, blocker] };
  let result = tick(state, config);
  assert.equal(result.workitems.find((w) => w.id === child.id).statusId, child.statusId);
  assert.equal(result.workitems.find((w) => w.id === follower.id).statusId, child.statusId);
  result = tick({ ...state, workitems: [parent, child] }, config);
  assert.equal(result.workitems.find((w) => w.id === child.id).statusId, childWf.statuses[2].id);
  assert.equal(result.workitems.find((w) => w.id === parent.id).statusId, parentWf.statuses[2].id);
  const delivered = { ...child, statusId: childWf.statuses.find((s) => s.isPosDeliveryPoint).id };
  const workingParent = { ...parent, statusId: parentWf.statuses[2].id };
  config.advanceProbability = 0;
  result = tick({ ...state, workitems: [workingParent, delivered] }, config);
  assert.equal(result.workitems[0].statusId, workingParent.statusId);
  assert.equal(result.workitems[0].isReady, true);
  result = tick(result, config);
  assert.equal(result.workitems[0].statusId, workingParent.statusId);
  config.advanceProbability = 1;
  result = tick(result, config);
  assert.equal(result.workitems[0].statusId, parentWf.statuses[3].id);
  assert.equal(result.workitems[0].isReady, undefined);

  const spawning = buildConfig(model(pair));
  spawning.initialReleaseCount = 2;
  spawning.workflows[pair[1]].statuses[0].wipLimit = 1;
  const spawned = tick(buildInitialState(spawning), spawning);
  assert.equal(spawned.workitems.filter((w) => w.level === pair[1]).length, 1);
  assert.equal(spawned.workitems.filter((w) => w.level === pair[0] && w.statusId === parentWf.statuses[0].id).length, 1);
}

assert.deepEqual(availableViews(["L2", "L1"]), ["portafolio", "delivery", "full", "L2", "L1"]);
assert.deepEqual(availableViews(["L0"]), ["delivery", "full"]);
assert.deepEqual(availableViews(["L3"]), ["portafolio", "full", "L3"]);
assert.deepEqual(visibleLevels("portafolio", ["L2", "L1"]), ["L2"]);
assert.deepEqual(visibleLevels("delivery", ["L2", "L1"]), ["L2", "L1"]);
assert.equal(normalizeView("L3", ["L2", "L1"]), "full");
assert.equal(normalizeView("L2", ["L2", "L1"]), "L2");
assert.equal(canToggleL0(buildConfig(model(levels)).workflows), true);
assert.equal(canToggleL0(buildConfig(model(["L0"])).workflows), false);
assert.equal(canToggleL0(buildConfig(model(["L2", "L1"])).workflows), false);
const emptyActive = { ...buildConfig(model(["L0"])), withoutL0: true };
assert.throws(() => buildInitialState(emptyActive), /empty active hierarchy/);
assert.throws(() => tick({ tick: 0, workitems: [], idCounters: {} }, emptyActive), /empty active hierarchy/);
const disabled = { ...buildConfig(model(levels)), withoutL0: true };
assert.deepEqual(getActiveHierarchy(disabled).workflows.map((wf) => wf.level), ["L3", "L2", "L1"]);

for (const level of levels) {
  const config = buildConfig(model([level]));
  config.initialReleaseCount = 12;
  const initial = buildInitialState(config);
  assert.equal(initial.workitems[10].color, initial.workitems[0].color);
  assert.equal(initial.workitems[11].color, initial.workitems[1].color);
  config.initialReleaseCount = 1;
  const wf = config.workflows[level];
  const readyStatus = wf.statuses.find((s) => s.hasReadySignal && !s.isPosDeliveryPoint);
  let state = buildInitialState(config);
  state.workitems[0].statusId = readyStatus.id;
  config.advanceProbability = 0;
  assert.equal(tick(state, config).workitems[0].isReady, undefined);
  config.advanceProbability = 1;
  state = tick(state, config);
  assert.equal(state.workitems[0].isReady, true);
  assert.equal(state.workitems[0].statusId, readyStatus.id);
  const next = wf.statuses.find((s) => s.order === readyStatus.order + 1);
  next.wipLimit = 0;
  assert.equal(tick(state, config).workitems[0].statusId, readyStatus.id);
  delete next.wipLimit;
  state = tick(state, config);
  assert.equal(state.workitems[0].statusId, next.id);
  assert.equal(state.workitems[0].isReady, undefined);
}

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object") return [];
  const children = node.props?.children;
  return [node, ...(Array.isArray(children) ? children.flatMap(elements) : elements(children))];
}
for (const activeLevels of [["L2", "L1"], ["L0"], levels]) {
  let selected;
  const nodes = elements(SimulationSelector({
    selectedSim: "test", simulationNames: ["test"], viewMode: "full", withoutL0: false,
    activeLevels, canToggleL0: activeLevels.length > 1 && activeLevels.includes("L0"),
    onSimChange: (value) => { selected = value; },
    onViewModeChange: (value) => { selected = value; },
    onWithoutL0Change: (value) => { selected = value; },
  }));
  const selects = nodes.filter((node) => node.type === "select");
  assert.deepEqual(elements(selects[1].props.children).filter((node) => node.type === "option").map((node) => node.props.value), availableViews(activeLevels));
  selects[1].props.onChange({ target: { value: "delivery" } });
  assert.equal(selected, "delivery");
  selects[0].props.onChange({ target: { value: "other" } });
  assert.equal(selected, "other");
  assert.equal(nodes.filter((node) => node.type === "button").length, activeLevels.length > 1 && activeLevels.includes("L0") ? 1 : 0);
}
console.log("Configured-level checks passed: 10 subsets, loader errors, delivery <=200 ticks, IDs/colors, demand, pull/FIFO/WIP/readiness, views and selector callbacks.");
