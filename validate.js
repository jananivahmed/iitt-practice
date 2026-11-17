#!/usr/bin/env node
/* Checks the case files before the site is published.
   Reports problems only; it never changes a file.
   Usage:  node tools/validate.js [folder]      (default: current folder)
   Exit code 1 if there is any ERROR (the publish step then stops).
   WARNINGs are shown but do not stop publishing. */
const fs = require("fs");
const path = require("path");
const root = path.resolve(process.argv[2] || ".");
const errors = [], warnings = [];
const err = (m) => errors.push(m), warn = (m) => warnings.push(m);
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
function json(p) {
  try { return JSON.parse(read(p)); } catch (e) { err(`${p}: ${e.message}`); return null; }
}

const STATUSES = ["draft", "ready", "live"];
const POPULATIONS = ["adult", "pediatric"];
const CATEGORIES = ["red", "yellow", "green", "uptriage"];
const REQUIRED = ["id", "status", "population", "title", "age", "sex", "domain", "image",
                  "arrival", "checkpoints", "correct", "keyCriterion", "feedbackWhy"];

// Checkpoint group names come from the app itself so the two can never drift apart.
let groups = [];
try {
  const app = read("assets/app.js");
  const block = app.match(/var GROUP_META = \{([\s\S]*?)\n\};/);
  groups = [...block[1].matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]);
} catch (e) { err("Could not read the checkpoint group names from assets/app.js"); }
const groupLevel = {};
try {
  const block = read("assets/app.js").match(/var GROUP_META = \{([\s\S]*?)\n\};/)[1];
  for (const m of block.matchAll(/^\s{2}(\w+):.*?level:\s*"(\w+)"/gm)) groupLevel[m[1]] = m[2];
} catch (e) {}

// Site files
const status = json("status.json");
if (status && typeof status.paused !== "boolean") err('status.json: "paused" must be true or false');
const version = json("version.json");
if (version && !version.version) err('version.json: missing "version"');

// Manifest
const manifest = json("cases/index.json");
const listed = (manifest && manifest.cases) || [];
if (manifest && !Array.isArray(manifest.cases)) err('cases/index.json: "cases" must be a list');
const seen = new Set();
for (const id of listed) {
  if (seen.has(id)) err(`cases/index.json: "${id}" is listed twice`);
  seen.add(id);
}
const onDisk = fs.readdirSync(path.join(root, "cases"))
  .filter((f) => f.endsWith(".json") && f !== "index.json" && !f.startsWith("_"))
  .map((f) => f.replace(/\.json$/, ""));
for (const id of onDisk) if (!seen.has(id)) warn(`cases/${id}.json exists but is not listed in cases/index.json, so it will not appear`);

const tagFile = json("tags.json");
const knownTags = tagFile && Array.isArray(tagFile.tags) ? tagFile.tags : null;

let liveCount = 0;
for (const id of listed) {
  const file = `cases/${id}.json`;
  if (!fs.existsSync(path.join(root, file))) { err(`${file}: listed in cases/index.json but the file does not exist`); continue; }
  const c = json(file);
  if (!c) continue;
  const E = (m) => err(`${file}: ${m}`), W = (m) => warn(`${file}: ${m}`);
  for (const k of REQUIRED) if (c[k] === undefined || c[k] === null || c[k] === "") E(`missing required field "${k}"`);
  if (c.id !== id) E(`"id" is "${c.id}" but the file name says "${id}". They must match, and an id must never change once learners have used it`);
  if (c.status && !STATUSES.includes(c.status)) E(`"status" must be one of ${STATUSES.join(", ")} (found "${c.status}")`);
  if (c.status === "live") liveCount++;
  if (c.population && !POPULATIONS.includes(c.population)) E(`"population" must be adult or pediatric (found "${c.population}")`);
  if (c.correct && !CATEGORIES.includes(c.correct)) E(`"correct" must be one of ${CATEGORIES.join(", ")} (found "${c.correct}")`);
  if (c.focusTags !== undefined && !Array.isArray(c.focusTags)) E('"focusTags" must be a list');
  else for (const t of c.focusTags || []) if (knownTags && !knownTags.includes(t)) W(`focus tag "${t}" is not in tags.json. Add it there first so tags stay consistent`);
  for (const kind of ["cases", "faces"]) {
    if (c.image && !fs.existsSync(path.join(root, `images/${kind}/${c.image}.jpg`))) E(`picture images/${kind}/${c.image}.jpg not found`);
  }
  if (Array.isArray(c.checkpoints)) {
    if (!c.checkpoints.length) E("has no checkpoints");
    c.checkpoints.forEach((cp, i) => {
      const at = `checkpoint ${i + 1}`;
      if (!groups.includes(cp.g)) E(`${at}: unknown group "${cp.g}" (allowed: ${groups.join(", ")})`);
      if (!["yes", "no"].includes(cp.correct)) E(`${at}: "correct" must be "yes" or "no"`);
      if (!cp.why) E(`${at}: missing "why" explanation`);
      if (cp.chips !== undefined && (typeof cp.chips !== "object" || Array.isArray(cp.chips))) E(`${at}: "chips" must be label/value pairs`);
    });
    // Structural cross-check only: the first "yes" decides the category.
    const firstYes = c.checkpoints.find((cp) => cp.correct === "yes");
    const expected = firstYes ? ({ red: "red", yellow: "yellow", vitals: "uptriage" })[groupLevel[firstYes.g]] : "green";
    if (expected && c.correct && expected !== c.correct) {
      W(`the first "yes" checkpoint points to ${expected} but "correct" is ${c.correct}. Please have a clinician confirm this is intended`);
    }
  }
  if (c.needsReview === true && c.status === "live") W('status is "live" but needsReview is true. Confirm the clinician review is done before leaving it live');
  if (c.needsReview === true && !c.reviewNote) W('needsReview is true but reviewNote is empty');
}
if (!liveCount) warn("no case has status \"live\": the live site would show no cases");

for (const w of warnings) console.log("WARNING  " + w);
for (const e of errors) console.log("ERROR    " + e);
console.log(`\nChecked ${listed.length} case(s): ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
