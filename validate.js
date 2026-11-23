#!/usr/bin/env node
/* Checks the case files before the site is published.
   Reports problems only; it never changes a file.
   Usage:  node validate.js [folder]      (default: current folder)
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
  const app = read("app.js");
  const block = app.match(/var GROUP_META = \{([\s\S]*?)\n\};/);
  groups = [...block[1].matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]);
} catch (e) { err("Could not read the checkpoint group names from app.js"); }
const groupLevel = {};
try {
  const block = read("app.js").match(/var GROUP_META = \{([\s\S]*?)\n\};/)[1];
  for (const m of block.matchAll(/^\s{2}(\w+):.*?level:\s*"(\w+)"/gm)) groupLevel[m[1]] = m[2];
} catch (e) {}

// Site files
const status = json("status.json");
if (status && typeof status.paused !== "boolean") err('status.json: "paused" must be true or false');
const version = json("version.json");
if (version && !version.version) err('version.json: missing "version"');

// Data collection switch (off unless enabled with a Google script address)
if (fs.existsSync(path.join(root, "collection.json"))) {
  const col = json("collection.json");
  if (col) {
    if (typeof col.enabled !== "boolean") err('collection.json: "enabled" must be true or false');
    else if (col.enabled && !(typeof col.endpoint === "string" && col.endpoint.startsWith("https://script.google.com/"))) err('collection.json: "enabled" is true but "endpoint" is not a Google script web address (https://script.google.com/...)');
    else if (col.enabled) warn('collection.json: data collection is ON. Make sure consent wording and approvals are in place before real learners use this site');
  }
}

// Manifest
const manifest = json("cases.json");
const listed = (manifest && manifest.cases) || [];
if (manifest && !Array.isArray(manifest.cases)) err('cases.json: "cases" must be a list');
const seen = new Set();
for (const id of listed) {
  if (seen.has(id)) err(`cases.json: "${id}" is listed twice`);
  seen.add(id);
}
const onDisk = fs.readdirSync(root)
  .filter((f) => /^case-.+\.json$/.test(f) && !f.startsWith("case-_"))
  .map((f) => f.replace(/^case-/, "").replace(/\.json$/, ""));
for (const id of onDisk) if (!seen.has(id)) warn(`case-${id}.json exists but is not listed in cases.json, so it will not appear`);

const tagFile = json("tags.json");
const knownTags = tagFile && Array.isArray(tagFile.tags) ? tagFile.tags : null;

let liveCount = 0;
for (const id of listed) {
  const file = `case-${id}.json`;
  if (!fs.existsSync(path.join(root, file))) { err(`${file}: listed in cases.json but the file does not exist`); continue; }
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
    if (c.image && !fs.existsSync(path.join(root, `${kind === "cases" ? "picture" : "portrait"}-${c.image}.jpg`))) E(`picture ${kind === "cases" ? "picture" : "portrait"}-${c.image}.jpg not found`);
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
  // Findings shown in Triage Practice when a learner checks a section of the card.
  if (c.findings === undefined) W('no "findings" for Triage Practice: every section will say "No additional findings recorded"');
  else if (typeof c.findings !== "object" || Array.isArray(c.findings)) E('"findings" must be a set of group names with their findings');
  else {
    for (const g of Object.keys(c.findings)) {
      const f = c.findings[g];
      if (!groups.includes(g)) E(`findings: unknown group "${g}" (allowed: ${groups.join(", ")})`);
      else if (!f || typeof f !== "object" || (!f.text && !f.chips)) E(`findings.${g}: needs "text" and/or "chips"`);
      else if (f.chips !== undefined && (typeof f.chips !== "object" || Array.isArray(f.chips))) E(`findings.${g}: "chips" must be label/value pairs`);
    }
    const missing = groups.filter((g) => !c.findings[g]);
    if (missing.length) W(`findings are missing for ${missing.length} card section(s) (${missing.join(", ")}). A learner can tell where the decision was made when later sections are empty, so fill in every section`);
    if (c.status === "live" && c.findingsReviewed !== true) W('findings have not been reviewed by a clinician ("findingsReviewed" is not true). Findings must be neutral observations that never state the answer');
  }
  if (c.needsReview === true && c.status === "live") W('status is "live" but needsReview is true. Confirm the clinician review is done before leaving it live');
  if (c.needsReview === true && !c.reviewNote) W('needsReview is true but reviewNote is empty');
}
if (!liveCount) warn("no case has status \"live\": the live site would show no cases");

for (const w of warnings) console.log("WARNING  " + w);
for (const e of errors) console.log("ERROR    " + e);
console.log(`\nChecked ${listed.length} case(s): ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
