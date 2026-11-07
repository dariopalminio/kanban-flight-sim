import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadTypescript } from "./load-typescript.mjs";

const { buildInitialState, tick } = loadTypescript("src\\simulation\\engine.ts");
const fixturePath = path.resolve("tests\\fixtures\\full-model-baseline.json");
const hash = (state) => createHash("sha256").update(JSON.stringify(state)).digest("hex");
const draws = [0.1, 0.8, 0.3, 0.6, 0.05, 0.95, 0.4, 0.2, 0.7];

function run(config, initialState) {
  let state = structuredClone(initialState);
  let drawCount = 0;
  const originalRandom = Math.random;
  const results = [];
  Math.random = () => draws[drawCount++ % draws.length];
  try {
    for (let i = 0; i < 80; i++) {
      state = tick(state, config);
      results.push({ hash: hash(state), drawCount });
    }
  } finally {
    Math.random = originalRandom;
  }
  return results;
}

if (process.argv.includes("--capture")) {
  assert.ok(!fs.existsSync(fixturePath), "Do not overwrite a pre-refactoring baseline");
  const fixtures = [];
  for (const filename of fs.readdirSync("src\\config\\models")) {
    const raw = JSON.parse(fs.readFileSync(path.join("src\\config\\models", filename), "utf8"));
    if (!["L3", "L2", "L1", "L0"].every((level) => raw.workflows[level])) continue;
    for (const withoutL0 of [false, true]) {
      const config = { ...raw, initialReleaseCount: 3, childrenPerParent: 2, withoutL0 };
      delete config.name;
      const initial = buildInitialState(config);
      const mixed = structuredClone(initial);
      for (const level of ["L2", "L1", ...(withoutL0 ? [] : ["L0"])]) {
        const wf = config.workflows[level];
        const parentLevel = `L${Number(level[1]) + 1}`;
        const parentId = mixed.workitems.find((item) => item.level === parentLevel).id;
        wf.statuses.forEach((status, index) => {
          mixed.workitems.push({
            id: `${wf.workitemName.slice(0, 4).toUpperCase()}-${index + 1}p${parentId.split("p")[0]}`,
            level, statusId: status.id, parentId, enteredAt: index % 2,
            color: initial.workitems[0].color, isReady: index % 2 === 0,
          });
        });
        mixed.idCounters[level] = wf.statuses.length;
      }
      for (const [kind, initialState] of [["initial", initial], ["mixed", mixed]]) {
        fixtures.push({ name: `${filename}/${withoutL0}/${kind}`, config, initialState, results: run(config, initialState) });
      }
    }
  }
  fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
  fs.writeFileSync(fixturePath, JSON.stringify(fixtures));
  console.log(`Captured ${fixtures.length} pre-refactoring trajectories (80 ticks each).`);
} else {
  const fixtures = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  for (const fixture of fixtures) {
    assert.deepEqual(buildInitialState(fixture.config), {
      tick: 0,
      idCounters: { L0: 0, L1: 0, L2: 0, L3: fixture.config.initialReleaseCount },
      workitems: Array.from({ length: fixture.config.initialReleaseCount }, (_, i) => ({
        id: `${fixture.config.workflows.L3.workitemName.slice(0, 4).toUpperCase()}-${i + 1}`, level: "L3",
        statusId: fixture.config.workflows.L3.statuses[0].id, enteredAt: 0,
        color: ["#0972b8", "#9b59b6", "#e91e63"][i],
      })),
    }, `${fixture.name}: initialization`);
    assert.deepEqual(run(fixture.config, fixture.initialState), fixture.results, fixture.name);
  }
  console.log(`Full-model compatibility: ${fixtures.length} trajectories match state hashes and exact draw counts.`);
}
