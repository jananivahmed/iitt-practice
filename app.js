/* ============================================================
   IITT Case Practice — prototype
   Data source: IITT Adult (Slide Deck 2) & Paediatric (Slide Deck 3)
   All triage categories, criteria, checkpoint order, and teaching
   points are taken verbatim/near-verbatim from the source decks.
   No new cases, vital signs, findings, or triage decisions are
   invented here. Where the source itself does not give a clean
   yes/no (see adult-2), that is flagged for clinician review
   rather than silently resolved.
   ============================================================ */

var IMAGES = {"adult-1": "picture-adult-1.jpg", "adult-2": "picture-adult-2.jpg", "adult-3": "picture-adult-3.jpg", "adult-4": "picture-adult-4.jpg", "adult-5": "picture-adult-5.jpg", "peds-1": "picture-peds-1.jpg", "peds-2": "picture-peds-2.jpg", "peds-3": "picture-peds-3.jpg", "peds-4": "picture-peds-4.jpg", "peds-5": "picture-peds-5.jpg"};
var FACE_IMAGES = {"adult-1": "portrait-adult-1.jpg", "adult-2": "portrait-adult-2.jpg", "adult-3": "portrait-adult-3.jpg", "adult-4": "portrait-adult-4.jpg", "adult-5": "portrait-adult-5.jpg", "peds-1": "portrait-peds-1.jpg", "peds-2": "portrait-peds-2.jpg", "peds-3": "portrait-peds-3.jpg", "peds-4": "portrait-peds-4.jpg", "peds-5": "portrait-peds-5.jpg"};
var PDF_REFS = {"adult": "refcard-adult.png", "pediatric": "refcard-pediatric.png", "reference": "refcard-reference.png"};
var MODE_ICONS = {"guided": "ui-mode-guided.png", "triage": "ui-mode-triage.png"};
var LOGIN_AVATAR = "ui-login-avatar.jpg";

/* ---------------- fixed IITT criteria & question text ---------------- */
/* These are the tool's own criteria lists (constant per population),
   not case-specific — exactly what appears on the reference card and
   is repeated on every case slide in the source decks. */

var GROUP_META = {
  unresponsive:      { label: "Unresponsive",              level: "red",    question: "Is the patient unresponsive?" },
  airway_red:        { label: "Airway & breathing",        level: "red",    question: "Are there airway or breathing red criteria?" },
  circulation_red:   { label: "Circulation",                level: "red",    question: "Are there circulation red criteria?" },
  disability_red:    { label: "Disability",                 level: "red",    question: "Are there disability red criteria?" },
  other_red:         { label: "Other high-risk criteria",   level: "red",    question: "Does the patient meet any other high-risk red criteria?" },
  airway_yellow:     { label: "Airway & breathing",        level: "yellow", question: "Are there airway or breathing yellow criteria?" },
  circulation_yellow:{ label: "Circulation",                level: "yellow", question: "Are there circulation yellow criteria?" },
  disability_yellow: { label: "Disability",                 level: "yellow", question: "Are there disability yellow criteria?" },
  other_yellow:      { label: "Other criteria",             level: "yellow", question: "Are there any other yellow criteria?" },
  vitals:            { label: "High-risk vital signs",      level: "vitals", question: "Are any high-risk vital signs present?" }
};

var CRITERIA = {
  adult: {
    airway_red: ["Stridor", "Respiratory distress* or central cyanosis"],
    circulation_red: ["Capillary refill >3 sec", "Weak and fast pulse", "Heavy bleeding", "HR <50 or >150"],
    disability_red: ["Active convulsions", "Any two of: altered mental status, hypothermia or fever, stiff neck, headache", "Hypoglycaemia"],
    other_red: ["High-risk trauma*", "Poisoning/ingestion or dangerous chemical exposure*", "Threatened limb*", "Snake bite", "Acute chest or abdominal pain (>50 years old)", "ECG with acute ischaemia (if done)", "Violent or aggressive"],
    airway_yellow: ["Any swelling/mass of mouth, throat or neck", "Wheezing (no red criteria)"],
    circulation_yellow: ["Vomits everything or ongoing diarrhoea", "Unable to feed or drink", "Severe pallor (no red criteria)", "Ongoing bleeding (no red criteria)", "Recent fainting"],
    disability_yellow: ["Altered mental status or agitation (no red criteria)", "Acute general weakness", "Acute focal neurologic complaint", "Acute visual disturbance", "Severe pain (no red criteria)"],
    other_yellow: ["New rash worsening over hours or peeling (no red criteria)", "Visible acute limb deformity", "Open fracture", "Suspected dislocation", "Other trauma/burns (no red criteria)", "Known diagnosis requiring urgent surgical intervention", "Sexual assault", "Acute testicular/scrotal pain or priapism", "Unable to pass urine", "Exposure requiring time-sensitive prophylaxis (e.g. animal bite, needlestick)", "Pregnancy, referred for complications"],
    vitals: ["HR <60 or >130", "RR <10 or >30", "Temp <36\u00b0 or >39\u00b0C", "SpO\u2082 <92%", "AVPU other than A"]
  },
  pediatric: {
    airway_red: ["Stridor", "Respiratory distress* or central cyanosis"],
    circulation_red: ["Capillary refill >3 sec", "Weak and fast pulse", "Heavy bleeding", "Cold extremities", "Any two of: lethargy, sunken eyes, very slow skin pinch, drinks poorly"],
    disability_red: ["Active convulsions", "Altered mental status (confused, restless, continuously irritable, or lethargic) with stiff neck, hypothermia, or fever", "Hypoglycaemia (if known)"],
    other_red: ["Any infant <8 days old", "Age <2 months and temp <36\u00b0 or >39\u00b0C", "High-risk trauma*", "Threatened limb*", "Acute testicular/scrotal pain or priapism", "Snake bite", "Poisoning/ingestion or dangerous chemical exposure*", "Pregnant with adult red criteria"],
    airway_yellow: ["Any swelling/mass of mouth, throat or neck", "Wheezing (no red criteria)"],
    circulation_yellow: ["Unable to feed or drink", "Vomits everything", "Ongoing diarrhoea", "Dehydration", "Severe pallor (no red criteria)"],
    disability_yellow: ["Restless, continuously irritable, or lethargic", "Severe pain"],
    other_yellow: ["Any infant 8 days to 6 months old", "Malnutrition with visible severe wasting OR oedema of both feet", "Trauma/burn (no red criteria)", "Sexual assault", "Known diagnosis requiring urgent surgical intervention", "New rash worsening over hours or peeling (no red criteria)", "Exposure requiring time-sensitive prophylaxis (e.g. animal bite)", "Pregnancy (no red criteria)", "Headache (no red criteria)"],
    vitals: ["Temp <36\u00b0 or >39\u00b0C", "SpO\u2082 <92%", "AVPU other than A", "RR outside the age-band range below", "HR outside the age-band range below"]
  }
};

/* ---------------- case bank ----------------
   Each case: fixed vignette + an ordered list of checkpoints that
   exactly mirrors the sequence worked through in the source slides,
   stopping at the same point the source stops (first criterion met,
   or after high-risk vital signs if none are met). */

var CASES = [];

/* Deduped, in case-bank order. Built from the same ageBandRef values already
   authored on individual cases (see peds-2..5 above) so this reference can
   never drift from, or add numbers beyond, what's already been through
   authoring/review on a case. Adult thresholds aren't age-banded (see
   CRITERIA.adult.vitals), so this list is paediatric-only by construction. */
var AGE_BAND_VITALS = [];
function computeAgeBandVitals() {
  var seen = {};
  var list = [];
  CASES.forEach(function (c) {
    if (c.ageBandRef && !seen[c.ageBandRef.band]) {
      seen[c.ageBandRef.band] = true;
      list.push(c.ageBandRef);
    }
  });
  AGE_BAND_VITALS = list;
}

var CATEGORY_META = {
  red:      { label: "RED",       emoji: "\uD83D\uDD34", chip: "chip-red" },
  yellow:   { label: "YELLOW",    emoji: "\uD83D\uDFE1", chip: "chip-yellow" },
  green:    { label: "GREEN",     emoji: "\uD83D\uDFE2", chip: "chip-green" },
  uptriage: { label: "UP-TRIAGE", emoji: "\u26A0\uFE0F", chip: "chip-uptriage" }
};

/* ---------------- storage helpers ---------------- */
var STORE_RESPONSES = "iitt_practice_responses_v2";
var STORE_METADATA = "iitt_clinician_metadata_v1";
var STORE_SESSION = "iitt_session_id_v1";
var STORE_EVENTS = "iitt_practice_events_v1";
var STORE_LEARNER_NAME = "iitt_learner_name_v1";
var STORE_LEARNER_EMAIL = "iitt_learner_email_v1";
/* Cap on stored events so a long-lived device doesn't grow localStorage without
   bound before a real sync/export exists. Oldest events are dropped first. */
var EVENT_LOG_CAP = 4000;

function safeGet(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { return false; }
}
function safeRemove(key) {
  try { localStorage.removeItem(key); return true; }
  catch (e) { return false; }
}
function getLearnerName() { return safeGet(STORE_LEARNER_NAME, null); }
function setLearnerName(name) { safeSet(STORE_LEARNER_NAME, name); }
function getLearnerEmail() { return safeGet(STORE_LEARNER_EMAIL, null); }
function setLearnerEmail(email) { safeSet(STORE_LEARNER_EMAIL, email); }
/* Clears everything specific to the person currently practicing on this
   device — their responses, event log, and anonymous session id — so the
   next person starts from a clean slate and doesn't see (or get mixed into)
   the previous learner's progress. Clinician metadata overrides (case review
   status/notes) are content about the CASES, not the learner, so they are
   deliberately left untouched here. */
function resetForNewUser() {
  safeRemove(STORE_RESPONSES);
  safeRemove(STORE_EVENTS);
  safeRemove(STORE_SESSION);
  safeRemove(STORE_LEARNER_NAME);
  safeRemove(STORE_LEARNER_EMAIL);
  eventSeqCounter = 0;
  state.queue = [];
  state.qIndex = 0;
  state.results = [];
  state.progressOpen = false;
  state.resetConfirmOpen = false;
  resetCaseState();
  render();
}
function getSessionId() {
  var sid = safeGet(STORE_SESSION, null);
  if (!sid) {
    sid = "sess-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    safeSet(STORE_SESSION, sid);
  }
  return sid;
}
function getResponses() { return safeGet(STORE_RESPONSES, []); }
function addResponse(rec) {
  var all = getResponses();
  all.push(rec);
  safeSet(STORE_RESPONSES, all);
}

/* ---------------- event-level telemetry ----------------
   addResponse() above logs one record per case (the final decision). That's
   enough to grade a session, but not enough to see *how* someone got there —
   which criterion groups they checked, in what order, how long they took at
   each step, whether they revised a plan before locking it in. Those details
   are exactly what turn "this learner got 6/10" into "this learner keeps
   missing circulation findings" or "checks yellow before ruling out red."
   logEvent() below captures one small record per meaningful action, tagged
   with a per-case attempt id and a running sequence number so the order of
   actions within a case can be reconstructed later. It writes to the same
   local, on-device store as addResponse() — there is no backend here — but
   the schema is meant to be sync-able as-is once one exists. */
var eventSeqCounter = 0;
function nextEventSeq() { eventSeqCounter += 1; return eventSeqCounter; }
function getEvents() { return safeGet(STORE_EVENTS, []); }
function addEventRecord(rec) {
  var all = getEvents();
  all.push(rec);
  if (all.length > EVENT_LOG_CAP) all = all.slice(all.length - EVENT_LOG_CAP);
  safeSet(STORE_EVENTS, all);
}
function logEvent(eventType, data) {
  var c = null;
  if (state.queue && state.queue.length && state.qIndex < state.queue.length) {
    c = caseById(state.queue[state.qIndex]);
  }
  var rec = {
    event_id: getSessionId() + "-" + nextEventSeq(),
    anonymous_session_id: getSessionId(),
    case_attempt_id: state.caseAttemptId || null,
    event_type: eventType,
    practice_mode: state.practiceMode || null,
    case_id: c ? c.id : null,
    adult_or_pediatric: c ? c.population : null,
    case_position: (state.queue && state.queue.length) ? state.qIndex + 1 : null,
    t: Date.now(),
    elapsed_ms_since_case_start: state.caseAttemptStart ? (Date.now() - state.caseAttemptStart) : null
  };
  if (data) {
    for (var k in data) { if (Object.prototype.hasOwnProperty.call(data, k)) rec[k] = data[k]; }
  }
  addEventRecord(rec);
}
/* Ordinal position of a gather-type action within the current case attempt
   (a tap, a plan toggle, a checkpoint answer) — lets later analysis reconstruct
   the order someone worked through a card, not just which items they ended up on. */
function nextGatherSeq() {
  state.gatherSeq += 1;
  return state.gatherSeq;
}
function getMetaOverrides() { return safeGet(STORE_METADATA, {}); }
function reviewStatusFor(id) {
  return (getMetaOverrides()[id] || {}).review_status || "Not yet reviewed";
}
function setMetaOverride(caseId, field, value) {
  var all = getMetaOverrides();
  if (!all[caseId]) all[caseId] = {};
  all[caseId][field] = value;
  safeSet(STORE_METADATA, all);
}

var INTERNAL_FIELDS = [
  { key: "primary_intended_challenge", label: "Primary intended challenge" },
  { key: "expected_common_error", label: "Expected common error" },
  { key: "predicted_wrong_category", label: "Predicted wrong category" },
  { key: "criterion_type", label: "Criterion type" },
  { key: "case_subtlety", label: "Case subtlety" }
];

/* ---------------- app state ---------------- */
var state = {
  mode: "practice",
  practiceMode: "walkthrough", /* walkthrough | decide */
  queue: [],
  qIndex: 0,
  phase: "arrival",      /* arrival | checkpoint | ready | decision | feedback */
  cpIndex: 0,
  cpSelected: null,
  cpLocked: false,
  cpLog: [],
  viewedKnown: [],
  viewedUnassessed: [],
  gatherLog: [],
  caseAttemptId: null,
  caseAttemptStart: null,
  gatherSeq: 0,
  selected: null,
  locked: false,
  answerStart: null,
  results: [],
  reviewOpenId: null,
  caseInfoOpen: false,
  refCardOpen: null,
  refZoomed: false,
  progressOpen: false,
  ageBandOpen: false,
  resetConfirmOpen: false,
  endSessionConfirmOpen: false
};

function shuffleArray(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}
function shuffledCaseOrder() {
  var ids = CASES.map(function (c) { return c.id; });
  return shuffleArray(ids);
}
function caseById(id) {
  for (var i = 0; i < CASES.length; i++) if (CASES[i].id === id) return CASES[i];
  return null;
}
function startPractice(mode) {
  state.practiceMode = mode || state.practiceMode || "walkthrough";
  state.queue = shuffledCaseOrder();
  state.qIndex = 0;
  state.results = [];
  resetCaseState();
  render();
}
function resetCaseState() {
  state.phase = "arrival";
  state.cpIndex = 0;
  state.cpSelected = null;
  state.cpLocked = false;
  state.cpLog = [];
  state.viewedKnown = [];
  state.viewedUnassessed = [];
  state.gatherLog = [];
  state.caseAttemptId = null;
  state.caseAttemptStart = null;
  state.gatherSeq = 0;
  state.selected = null;
  state.locked = false;
  state.answerStart = Date.now();
  state.caseInfoOpen = false;
  state.refCardOpen = null;
  state.refZoomed = false;
}

/* ---------------- scoring ---------------- */
function classify(correct, selected) {
  if (correct === selected) return "correct";
  if (correct === "uptriage") {
    return selected === "green" ? "under" : "over";
  }
  var rank = { green: 0, yellow: 1, red: 2 };
  if (rank[selected] < rank[correct]) return "under";
  return "over";
}
/* "decide" (Triage practice) gathers freely rather than walking every
   checkpoint in order; walkthrough mode does not. */
function isFreeMode() {
  return state.practiceMode === "decide";
}

/* ---------------- rendering ---------------- */
var appEl = document.getElementById("app");

function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c];
  });
}

/* This build is user-facing only: Clinician review and Case bank are cut from
   the nav and this dispatcher, but their render functions and data are left
   intact below so that chrome can be reinstated later without rebuilding it. */
function render() {
  if (!getLearnerName() || !getLearnerEmail()) { renderLogin(); window.scrollTo(0, 0); return; }
  renderPractice();
  window.scrollTo(0, 0);
}

var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---- Login (a name + email to keep one learner's practice history separate
   from the next person's on a shared device — not authentication; nothing is
   checked against anything, and nothing leaves this device; no email is
   sent from here). ---- */
function renderLogin() {
  var html = '<div class="card empty-hero" style="padding-bottom:24px;">' +
    '<img class="login-avatar" src="' + LOGIN_AVATAR + '" alt="">' +
    '<h2 class="section-title">Who’s practicing?</h2>' +
    '<p>Enter your name and email so your progress stays separate from other learners using this device, and so your feedback reports are tied to you.</p>' +
    '<div class="field-row" style="text-align:left; max-width:320px; margin:0 auto 4px;">' +
    '<input type="text" id="login-name-input" placeholder="Your name" maxlength="60" autocomplete="off" onkeydown="if(event.key===\'Enter\'){event.preventDefault();submitLogin();}">' +
    '<div id="login-name-error" class="login-error" hidden>Enter your name to continue.</div>' +
    '</div>' +
    '<div class="field-row" style="text-align:left; max-width:320px; margin:0 auto 4px;">' +
    '<input type="email" id="login-email-input" placeholder="you@example.com" maxlength="120" autocomplete="off" onkeydown="if(event.key===\'Enter\'){event.preventDefault();submitLogin();}">' +
    '<div id="login-email-error" class="login-error" hidden>Enter a valid email address to continue.</div>' +
    '</div>' +
    '<div class="cta-row"><button class="btn btn-primary" onclick="submitLogin()">Continue</button></div>' +
    '</div>';
  appEl.innerHTML = html;
  var input = document.getElementById("login-name-input");
  if (input) input.focus();
}
function submitLogin() {
  var nameInput = document.getElementById("login-name-input");
  var emailInput = document.getElementById("login-email-input");
  var name = nameInput ? nameInput.value.trim() : "";
  var email = emailInput ? emailInput.value.trim() : "";
  var nameErr = document.getElementById("login-name-error");
  var emailErr = document.getElementById("login-email-error");
  var nameOk = !!name;
  var emailOk = !!email && EMAIL_PATTERN.test(email);
  if (nameErr) nameErr.hidden = nameOk;
  if (emailErr) emailErr.hidden = emailOk;
  if (!nameOk || !emailOk) {
    (nameOk ? emailInput : nameInput).focus();
    return;
  }
  setLearnerName(name);
  setLearnerEmail(email);
  render();
}
function openResetConfirm() {
  state.resetConfirmOpen = true;
  render();
}
function closeResetConfirm() {
  state.resetConfirmOpen = false;
  render();
}
function renderResetConfirm() {
  var name = getLearnerName();
  var html = '<div class="card">';
  html += '<div class="stage-tag">Reset for new user</div>';
  html += '<h3 class="case-title">Clear progress on this device?</h3>';
  html += '<p class="vignette">This clears ' + (name ? '<b>' + esc(name) + '</b>’s' : 'the current') + ' saved responses, event history, name, and email from this device, and returns to the sign-in screen for the next learner. This can’t be undone.</p>';
  html += '<div class="restart-row">' +
    '<button class="btn btn-ghost" onclick="closeResetConfirm()">Cancel</button>' +
    '<button class="btn btn-danger" onclick="resetForNewUser()">Reset for new user</button>' +
    '</div>';
  html += '</div>';
  appEl.innerHTML = html;
}

function openEndSessionConfirm() {
  state.endSessionConfirmOpen = true;
  render();
}
function closeEndSessionConfirm() {
  state.endSessionConfirmOpen = false;
  render();
}
function endSessionNow() {
  state.endSessionConfirmOpen = false;
  state.qIndex = state.queue.length;
  render();
}
function renderEndSessionConfirm() {
  var doneCount = state.results.length;
  var html = '<div class="card">';
  html += '<div class="stage-tag">End session</div>';
  html += '<h3 class="case-title">End this practice session now?</h3>';
  html += '<p class="vignette">' + (doneCount
    ? 'You’ll get a feedback report on the ' + doneCount + ' case' + (doneCount === 1 ? "" : "s") + ' you’ve completed so far. The case in progress won’t be scored.'
    : 'You haven’t completed a case yet, so the report won’t have anything to show. You can also just keep going.') + '</p>';
  html += '<div class="restart-row">' +
    '<button class="btn btn-ghost" onclick="closeEndSessionConfirm()">Keep practicing</button>' +
    '<button class="btn btn-primary" onclick="endSessionNow()">End &amp; see report</button>' +
    '</div>';
  html += '</div>';
  appEl.innerHTML = html;
}

/* ---- Practice mode ---- */
function renderPractice() {
  if (state.resetConfirmOpen) { renderResetConfirm(); return; }
  if (state.endSessionConfirmOpen) { renderEndSessionConfirm(); return; }
  if (state.progressOpen) { renderProgress(); return; }
  if (!state.queue.length) { renderPracticeHome(); return; }
  if (state.qIndex >= state.queue.length) { renderPracticeSummary(); return; }
  var c = caseById(state.queue[state.qIndex]);
  if (state.refCardOpen) { renderRefCardViewer(); return; }
  if (state.ageBandOpen) { renderAgeBandVitals(); return; }
  if (state.phase !== "arrival" && state.caseInfoOpen) { renderCaseInfo(c); return; }
  if (state.phase === "arrival") renderArrival(c);
  else if (state.phase === "checkpoint") renderCheckpoint(c);
  else if (state.phase === "ready") renderReady(c);
  else if (state.phase === "decision") renderDecision(c);
  else renderFeedback(c);
}
function toggleCaseInfo() {
  state.caseInfoOpen = !state.caseInfoOpen;
  renderPractice();
}
function renderCaseInfo(c) {
  var num = state.qIndex + 1;
  var pct = Math.round(num / state.queue.length * 100);
  var html = '<div class="card">';
  html += caseHeader(c, num, pct);
  html += '<img class="case-image" src="' + IMAGES[c.image] + '" alt="Illustration of the patient described in this case" loading="lazy">';
  html += '<div class="stage-tag">Case info</div>';
  html += '<h3 class="case-title">' + esc(c.title) + '</h3>';
  html += '<p class="vignette">' + esc(c.arrival) + '</p>';
  var checked = checkedCheckpoints(c);
  if (checked.length) {
    html += '<div class="finding-block">';
    html += '<h4 style="font-size:12.5px; text-transform:uppercase; letter-spacing:.05em; color:var(--ink-faint); margin:0 0 10px; font-weight:700;">What you\u2019ve checked so far</h4>';
    html += '<div class="gather-list">';
    checked.forEach(function (cp) { html += renderCheckedItemCard(cp); });
    html += '</div></div>';
  }
  html += '<div class="cta-row"><button class="btn btn-primary" onclick="toggleCaseInfo()">Back to assessment</button></div>';
  html += '</div>';
  appEl.innerHTML = html;
}
function miniImageRow(c, showAgeBand, hideCaseInfoBtn) {
  return '<div class="mini-header">' +
    '<img class="case-image-mini" src="' + FACE_IMAGES[c.image] + '" alt="Portrait of the patient described in this case" loading="lazy">' +
    '<div class="case-info-row">' +
    (showAgeBand && AGE_BAND_VITALS.length ? '<button class="case-info-btn" onclick="openAgeBandVitals()">\uD83D\uDCCA Pediatric age-band vitals</button>' : '') +
    (hideCaseInfoBtn ? '' : '<button class="case-info-btn" onclick="toggleCaseInfo()">\uD83D\uDCCB Case info</button>') +
    '</div>' +
    '</div>';
}
var REF_CARD_META = {
  adult: { label: "Adult IITT card (age \u226512)", url: PDF_REFS.adult },
  pediatric: { label: "Paediatric IITT card (age <12)", url: PDF_REFS.pediatric },
  reference: { label: "Reference card (trauma, burns & other high-risk criteria)", url: PDF_REFS.reference }
};
function openRefCard(key) {
  state.refCardOpen = key;
  state.refZoomed = false;
  renderPractice();
}
function closeRefCard() {
  state.refCardOpen = null;
  state.refZoomed = false;
  renderPractice();
}
function toggleRefZoom() {
  state.refZoomed = !state.refZoomed;
  renderRefCardViewer();
}
function renderRefCardViewer() {
  var meta = REF_CARD_META[state.refCardOpen];
  var html = '<div class="card ref-viewer-card">';
  html += '<button type="button" class="back-link" onclick="closeRefCard()">\u2190 Back to case</button>';
  html += '<div class="stage-tag">Reference card</div>';
  html += '<h3 class="case-title">' + esc(meta.label) + '</h3>';
  html += '<p class="ref-viewer-hint">Pinch or use the zoom button to read the fine print.</p>';
  html += '<div class="ref-zoom-row">' +
    '<button type="button" class="btn btn-ghost btn-sm" onclick="toggleRefZoom()">' + (state.refZoomed ? '\u2212 Zoom out' : '+ Zoom in') + '</button>' +
    '</div>';
  html += '<div class="ref-viewer-wrap' + (state.refZoomed ? ' zoomed' : '') + '">' +
    '<img src="' + meta.url + '" alt="' + esc(meta.label) + '" loading="lazy">' +
    '</div>';
  html += '<div class="cta-row"><button class="btn btn-primary" onclick="closeRefCard()">Back to assessment</button></div>';
  html += '</div>';
  appEl.innerHTML = html;
}
function openAgeBandVitals() {
  state.ageBandOpen = true;
  renderPractice();
}
function closeAgeBandVitals() {
  state.ageBandOpen = false;
  renderPractice();
}
function renderAgeBandVitals() {
  var html = '<div class="card">';
  html += '<button type="button" class="back-link" onclick="closeAgeBandVitals()">← Back</button>';
  html += '<div class="stage-tag">Reference</div>';
  html += '<h3 class="case-title">Paediatric age-band vital sign thresholds</h3>';
  html += '<p class="ref-viewer-hint">High-risk heart rate and respiratory rate ranges by age band, as used in this case set.</p>';
  html += '<table class="pop-table"><thead><tr><th>Age band</th><th>Heart rate</th><th>Respiratory rate</th></tr></thead><tbody>';
  AGE_BAND_VITALS.forEach(function (b) {
    html += '<tr><td>' + esc(b.band) + '</td><td>' + esc(b.hr) + '</td><td>' + esc(b.rr) + '</td></tr>';
  });
  html += '</tbody></table>';
  html += '<p style="font-size:12.5px; color:var(--ink-soft); line-height:1.5; margin-top:10px;">Values shown outside these ranges meet high-risk vital sign criteria. For the complete official table (all age bands), use the Paediatric IITT reference card.</p>';
  html += '<div class="ref-links" style="margin-top:6px;"><button type="button" class="ref-link" onclick="openRefCard(\'pediatric\')">Paediatric IITT card (age &lt;12)</button></div>';
  html += '<div class="cta-row"><button class="btn btn-primary" onclick="closeAgeBandVitals()">Back to assessment</button></div>';
  html += '</div>';
  appEl.innerHTML = html;
}
function renderReferenceLinks() {
  return '<div class="ref-panel">' +
    '<div class="ref-panel-title">\uD83D\uDCC4 Use the official reference cards as you assess</div>' +
    '<div class="ref-links">' +
    '<button type="button" class="ref-link" onclick="openRefCard(\'adult\')">Adult IITT card (age \u226512)</button>' +
    '<button type="button" class="ref-link" onclick="openRefCard(\'pediatric\')">Paediatric IITT card (age &lt;12)</button>' +
    '<button type="button" class="ref-link" onclick="openRefCard(\'reference\')">Reference card (trauma, burns &amp; other high-risk criteria)</button>' +
    '</div></div>';
}

function renderPracticeHome() {
  var name = getLearnerName();
  appEl.innerHTML =
    (name ? '<div class="learner-bar"><span>👤 Practicing as <b>' + esc(name) + '</b></span><button type="button" class="learner-bar-link" onclick="openResetConfirm()">Switch user</button></div>' : '') +
    '<div class="card empty-hero" style="padding-bottom:6px;">' +
    '<img class="hero-image" src="ui-hero.jpg" alt="Nurse registering a patient at a triage desk">' +
    '<h2 class="section-title">Interagency Integrated Triage Tool Practice Companion</h2>' +
    '<p>Choose how you want to practice.</p>' +
    '</div>' +
    '<div class="card mode-card">' +
    '<h3 class="mode-card-title"><img class="mode-card-icon" src="' + MODE_ICONS.guided + '" alt=""> Guided Triage Practice</h3>' +
    '<p>You will be guided through each criteria in order before making a triage decision.</p>' +
    '<button class="btn btn-primary" onclick="startPractice(\'walkthrough\')">Start</button>' +
    '</div>' +
    '<div class="card mode-card">' +
    '<h3 class="mode-card-title"><img class="mode-card-icon" src="' + MODE_ICONS.triage + '" alt=""> Triage Practice</h3>' +
    '<p>You will decide when you have enough information to make a triage decision. Use the official reference cards to guide you and ask for more information if needed.</p>' +
    '<button class="btn btn-primary" onclick="startPractice(\'decide\')">Start</button>' +
    '</div>' +
    '<div class="restart-row" style="margin-top:2px;"><button class="btn btn-ghost" onclick="openProgress()">📊 My progress</button></div>' +
    '<details class="about-box"><summary>ℹ️ About</summary>' +
    '<p><b>IITT Practice Companion</b></p>' +
    '<p>Developed by <b>Janani Ahmed, MD MPH</b></p>' +
    '<p>Assistant Professor, Emergency Medicine, The Ohio State University</p>' +
    '<p class="about-version">' + (SITE.version ? 'Version ' + esc(SITE.version) : '') + (SITE.env === 'preview' ? ' (preview)' : '') + (SITE.build ? ' \u00b7 build ' + esc(SITE.build) : '') + '</p>' +
    '<p class="about-disclaimer"><b>Disclaimer:</b> This tool is for educational and training purposes only. It is not clinical decision support and does not replace clinical judgment, the official triage tools, or your facility\u2019s protocols.</p>' +
    '</details>';
}

/* ---- My progress (learner-facing, all-time on this device) ----
   Reads the same response/event stores the review tooling uses, but
   never shows anything beyond what the learner already produced
   themselves: their own accuracy, which criterion groups they most
   often hadn't checked yet when they got the category right anyway,
   and their own recent cases. No cross-learner or clinician content. */
function openProgress() { state.progressOpen = true; render(); }
function closeProgress() { state.progressOpen = false; render(); }

function renderProgress() {
  var all = getResponses();
  var html = '<div class="card">';
  html += '<button class="back-link" onclick="closeProgress()">← Back</button>';
  html += '<h2 class="section-title">My progress</h2>';

  if (!all.length) {
    html += '<p class="section-sub">Complete a case to start building your progress history.</p>';
    html += '<div class="restart-row"><button class="btn btn-primary" onclick="closeProgress()">Back to practice</button></div>';
    html += '<div class="restart-row"><button class="btn btn-ghost" onclick="openResetConfirm()">👤 Reset for new user</button></div>';
    html += '</div>';
    appEl.innerHTML = html;
    return;
  }

  html += '<p class="section-sub">Based on ' + all.length + ' case' + (all.length === 1 ? "" : "s") + ' completed on this device, across all sessions.</p>';

  var totalCorrect = all.filter(function (r) { return r.response_classification === "correct"; }).length;
  var totalUnsupported = all.filter(function (r) { return r.response_classification === "correct_unsupported"; }).length;
  var totalUnder = all.filter(function (r) { return r.response_classification === "under"; }).length;
  var totalOver = all.filter(function (r) { return r.response_classification === "over"; }).length;

  html += '<div class="summary-stat-grid' + (totalUnsupported ? ' summary-stat-grid-4' : '') + '">';
  html += '<div class="summary-stat correct"><div class="s-num">' + totalCorrect + '</div><div class="s-label">Correct</div></div>';
  if (totalUnsupported) html += '<div class="summary-stat unsupported"><div class="s-num">' + totalUnsupported + '</div><div class="s-label">Right answer, no basis</div></div>';
  html += '<div class="summary-stat under"><div class="s-num">' + totalUnder + '</div><div class="s-label">Under-triaged</div></div>';
  html += '<div class="summary-stat over"><div class="s-num">' + totalOver + '</div><div class="s-label">Over-triaged</div></div>';
  html += '</div>';

  function bucketForMode(mode) {
    var subset = all.filter(function (r) { return r.practice_mode === mode; });
    return {
      n: subset.length,
      correct: subset.filter(function (r) { return r.response_classification === "correct"; }).length,
      unsupported: subset.filter(function (r) { return r.response_classification === "correct_unsupported"; }).length,
      under: subset.filter(function (r) { return r.response_classification === "under"; }).length,
      over: subset.filter(function (r) { return r.response_classification === "over"; }).length
    };
  }
  var walkB = bucketForMode("walkthrough");
  var decideB = bucketForMode("decide");
  if (walkB.n || decideB.n) {
    html += '<table class="pop-table"><thead><tr><th>Mode</th><th>Cases</th><th>Correct</th>' + (totalUnsupported ? '<th>No basis</th>' : '') + '<th>Under</th><th>Over</th></tr></thead><tbody>';
    if (walkB.n) html += '<tr><td>Guided triage practice</td><td>' + walkB.n + '</td><td>' + walkB.correct + '</td>' + (totalUnsupported ? '<td>' + walkB.unsupported + '</td>' : '') + '<td>' + walkB.under + '</td><td>' + walkB.over + '</td></tr>';
    if (decideB.n) html += '<tr><td>Triage practice</td><td>' + decideB.n + '</td><td>' + decideB.correct + '</td>' + (totalUnsupported ? '<td>' + decideB.unsupported + '</td>' : '') + '<td>' + decideB.under + '</td><td>' + decideB.over + '</td></tr>';
    html += '</tbody></table>';
  }

  var missTally = {};
  all.forEach(function (r) {
    (r.missing_gather_groups || []).forEach(function (g) {
      missTally[g] = (missTally[g] || 0) + 1;
    });
  });
  var missKeys = Object.keys(missTally).sort(function (a, b) { return missTally[b] - missTally[a]; });
  if (missKeys.length) {
    var maxMiss = missTally[missKeys[0]];
    html += '<h4 style="font-size:12.5px; text-transform:uppercase; letter-spacing:.05em; color:var(--ink-faint); margin:18px 0 8px; font-weight:700;">Criteria you most often hadn’t checked yet</h4>';
    missKeys.slice(0, 5).forEach(function (g) {
      var label = (GROUP_META[g] || {}).label || g;
      var count = missTally[g];
      var pct = Math.round((count / maxMiss) * 100);
      html += '<div class="missed-row"><span class="missed-label">' + esc(label) + '</span><div class="missed-bar-track"><div class="missed-bar-fill" style="width:' + pct + '%"></div></div><span class="missed-count">' + count + '</span></div>';
    });
    html += '<p style="font-size:12.5px; color:var(--ink-soft); line-height:1.5; margin-top:8px;">These are cases where you picked the right triage category in Triage practice mode without having checked the specific finding that determines it.</p>';
  }

  var decideResults = all.filter(function (r) { return r.practice_mode === "decide"; });
  var totalOvercheck = decideResults.reduce(function (sum, r) { return sum + (r.overcheck_count || 0); }, 0);
  if (decideResults.length && totalOvercheck > 0) {
    var avgOvercheck = Math.round((totalOvercheck / decideResults.length) * 10) / 10;
    html += '<div class="reassess-note" style="margin-top:14px;"><span>⏱️</span><span>In Triage practice, you’ve averaged ' + avgOvercheck + ' extra check' + (avgOvercheck === 1 ? "" : "s") + ' per case after already having enough to decide.</span></div>';
  }

  var recent = all.slice().sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); }).slice(0, 8);
  html += '<h4 style="font-size:12.5px; text-transform:uppercase; letter-spacing:.05em; color:var(--ink-faint); margin:18px 0 8px; font-weight:700;">Recent cases</h4>';
  html += '<div class="recent-list">';
  recent.forEach(function (r) {
    var c = caseById(r.case_id);
    var title = c ? c.title : r.case_id;
    var resultLabel = r.response_classification === "correct" ? "Correct"
      : r.response_classification === "correct_unsupported" ? "No basis yet"
      : r.response_classification === "under" ? "Under-triaged"
      : "Over-triaged";
    var resultColor = r.response_classification === "correct" ? "var(--green)"
      : r.response_classification === "correct_unsupported" ? "var(--uptriage)"
      : r.response_classification === "under" ? "var(--red)"
      : "var(--yellow-ink)";
    html += '<div class="recent-row"><span class="recent-title">' + esc(title) + '</span><span class="recent-badge" style="color:' + resultColor + '">' + resultLabel + '</span></div>';
  });
  html += '</div>';

  html += '<div class="restart-row" style="margin-top:18px;"><button class="btn btn-primary" onclick="closeProgress()">Back to practice</button></div>';
  html += '<div class="restart-row"><button class="btn btn-ghost" onclick="openResetConfirm()">👤 Reset for new user</button></div>';
  html += '</div>';
  appEl.innerHTML = html;
}

function caseHeader(c, num, pct) {
  var popLabel = c.population === "adult" ? "Adult" : "Paediatric";
  var html = '<div class="progress-row"><span class="progress-label">Case ' + num + ' of ' + state.queue.length + '</span><span class="pop-badge">' + popLabel + ' \u00b7 ' + esc(c.age) + '</span></div>';
  html += '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
  html += '<div class="end-session-row"><button type="button" class="end-session-link" onclick="openEndSessionConfirm()">End session &amp; see report</button></div>';
  return html;
}

function renderArrival(c) {
  var num = state.qIndex + 1;
  var pct = Math.round((num - 1) / state.queue.length * 100);
  var html = '<div class="card">';
  html += caseHeader(c, num, pct);
  html += '<img class="case-image" src="' + IMAGES[c.image] + '" alt="Illustration of the patient described in this case" loading="lazy">';
  html += '<div class="stage-tag">Arrival</div>';
  html += '<h3 class="case-title">' + esc(c.title) + '</h3>';
  html += '<p class="vignette">' + esc(c.arrival) + '</p>';
  html += '<div class="cta-row"><button class="btn btn-primary" onclick="beginAssessment()">Begin assessment</button></div>';
  html += '</div>';
  appEl.innerHTML = html;
}
function beginAssessment() {
  state.caseAttemptId = getSessionId() + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  state.caseAttemptStart = Date.now();
  state.gatherSeq = 0;
  state.phase = state.practiceMode === "walkthrough" ? "checkpoint" : "ready";
  logEvent("assessment_started", {});
  renderPractice();
}

function renderCheckpointTrail(c) {
  if (!state.cpLog.length) return "";
  var html = '<div class="cp-trail">';
  state.cpLog.forEach(function (log) {
    var meta = GROUP_META[log.g];
    if (isFreeMode()) {
      html += '<div class="cp-trail-item right">' +
        '<span class="cp-trail-icon">\u2713</span>' +
        '<span class="cp-trail-label">' + esc(meta.label) + '</span>' +
        '<span class="cp-trail-answer">Checked</span>' +
        '</div>';
    } else {
      var icon2 = log.isRight ? "\u2713" : "\u2717";
      html += '<div class="cp-trail-item ' + (log.isRight ? "right" : "wrong") + '">' +
        '<span class="cp-trail-icon">' + icon2 + '</span>' +
        '<span class="cp-trail-label">' + esc(meta.label) + '</span>' +
        '<span class="cp-trail-answer">' + (log.selected === "yes" ? "Yes" : "No") + '</span>' +
        '</div>';
    }
  });
  html += '</div>';
  return html;
}

function renderCheckpoint(c) {
  var num = state.qIndex + 1;
  var cp = c.checkpoints[state.cpIndex];
  var meta = GROUP_META[cp.g];
  var critList = CRITERIA[c.population][cp.g];
  var stepPct = Math.round((num - 1) / state.queue.length * 100 + (1 / state.queue.length) * ((state.cpIndex + (state.cpLocked ? 1 : 0.5)) / c.checkpoints.length) * 100);

  var html = '<div class="card">';
  html += caseHeader(c, num, stepPct);
  html += miniImageRow(c, true);
  html += '<div class="stage-tag">' + (meta.level === "red" ? "Red criteria" : meta.level === "yellow" ? "Yellow criteria" : "High-risk vital signs") + '</div>';
  html += '<h3 class="case-title" style="font-size:16px;">' + esc(c.title) + '</h3>';
  html += renderReferenceLinks();

  html += renderCheckpointTrail(c);

  html += '<div class="cp-current">';
  html += '<div class="cp-group-label ' + meta.level + '">' + esc(meta.label) + '</div>';

  if (cp.chips) {
    html += '<div class="vitals-grid">';
    Object.keys(cp.chips).forEach(function (k) {
      html += '<div class="vital"><div class="v-label">' + esc(k) + '</div><div class="v-value">' + esc(cp.chips[k]) + '</div></div>';
    });
    html += '</div>';
  }
  if (cp.g === "vitals" && c.ageBandRef) {
    html += '<div class="age-ref">High-risk thresholds for <b>' + esc(c.ageBandRef.band) + '</b>: heart rate outside <b>' + esc(c.ageBandRef.hr) + '</b>, respiratory rate outside <b>' + esc(c.ageBandRef.rr) + '</b>.</div>';
  }

  if (critList && critList.length) {
    html += '<ul class="criteria-list">';
    critList.forEach(function (item) { html += '<li>' + esc(item) + '</li>'; });
    html += '</ul>';
  }

  html += '<div class="decision-prompt" style="margin-top:16px;">' + esc(meta.question) + '</div>';
  html += '<div class="yesno-grid">';
  ["yes", "no"].forEach(function (v) {
    var sel = state.cpSelected === v ? " selected" : "";
    var dis = state.cpLocked ? " disabled" : "";
    html += '<button class="yesno-btn ' + v + sel + '" ' + dis + ' onclick="selectCheckpointAnswer(\'' + v + '\')" aria-pressed="' + (state.cpSelected === v) + '">' + (v === "yes" ? "Yes" : "No") + '</button>';
  });
  html += '</div>';

  if (!state.cpLocked) {
    html += '<div class="submit-row"><button class="btn btn-primary" ' + (state.cpSelected ? '' : 'disabled') + ' onclick="submitCheckpoint()">Confirm answer</button></div>';
  } else {
    var isRight = state.cpSelected === cp.correct;
    html += '<div class="cp-feedback ' + (isRight ? "right" : "wrong") + '">' +
      '<div class="cp-feedback-title">' + (isRight ? "Correct" : "Not quite") + '</div>' +
      '<div class="cp-feedback-body">Answer: <b>' + (cp.correct === "yes" ? "Yes" : "No") + '.</b> ' + esc(cp.why) + '</div>' +
      '</div>';
    html += '<div class="submit-row"><button class="btn btn-primary" onclick="advanceCheckpoint()">Continue</button></div>';
  }

  html += '</div></div>';
  appEl.innerHTML = html;
}

function selectCheckpointAnswer(v) {
  if (state.cpLocked) return;
  state.cpSelected = v;
  renderPractice();
}
function submitCheckpoint() {
  if (!state.cpSelected || state.cpLocked) return;
  state.cpLocked = true;
  var c = caseById(state.queue[state.qIndex]);
  var cp = c.checkpoints[state.cpIndex];
  var isRight = state.cpSelected === cp.correct;
  state.cpLog.push({ g: cp.g, selected: state.cpSelected, isRight: isRight });
  logEvent("checkpoint_answered", { group: cp.g, selected: state.cpSelected, correct_answer: cp.correct, is_right: isRight, seq: nextGatherSeq() });
  renderPractice();
}
function advanceCheckpoint() {
  var c = caseById(state.queue[state.qIndex]);
  var cp = c.checkpoints[state.cpIndex];
  var isLast = state.cpIndex >= c.checkpoints.length - 1;
  if (cp.correct === "yes" || isLast) {
    state.phase = "decision";
  } else {
    state.cpIndex += 1;
    state.cpSelected = null;
    state.cpLocked = false;
  }
  renderPractice();
}

/* ---- "Triage practice" phases ---- */
function getRevealCheckpoints(c) {
  return c.checkpoints.filter(function (cp) { return cp.reveal; });
}

/* Which checkpoint(s) actually determine the case's correct category.
   Red/Yellow/Up-triage: the single criterion whose answer is "yes" — that finding
   is what tips the case out of Green. Green: nothing is "yes", so every genuinely
   new piece of information (reveal checkpoint) needs to have been ruled out. */
function pivotalCheckpoints(c) {
  if (c.correct === "green") return getRevealCheckpoints(c);
  return c.checkpoints.filter(function (cp) { return cp.correct === "yes"; });
}
/* Of those pivotal checkpoints, only the ones flagged reveal:true require an active
   check in Triage practice — anything not reveal-flagged is already evident from
   the arrival vignette, so no separate gather step exists for it. */
function requiredGatherGroups(c) {
  return pivotalCheckpoints(c).filter(function (cp) { return cp.reveal; }).map(function (cp) { return cp.g; });
}
function hasSufficientBasis(c) {
  var required = requiredGatherGroups(c);
  if (!required.length) return true;
  var gathered = state.cpLog.map(function (l) { return l.g; });
  return required.every(function (g) { return gathered.indexOf(g) !== -1; });
}
function missingGatherLabels(c) {
  var gathered = state.cpLog.map(function (l) { return l.g; });
  return requiredGatherGroups(c)
    .filter(function (g) { return gathered.indexOf(g) === -1; })
    .map(function (g) { return GROUP_META[g].label; });
}
/* The gather-order position (see checkItem's seq) at which the required set was
   completed — i.e. the moment a supported decision first became possible.
   Returns 0 when nothing needed gathering at all, or null when the case was
   never actually made sufficient before the learner moved to a decision. */
function sufficiencySeq(c) {
  var required = requiredGatherGroups(c);
  if (!required.length) return 0;
  var seqByGroup = {};
  state.cpLog.forEach(function (l) { seqByGroup[l.g] = l.seq; });
  var allPresent = required.every(function (g) { return seqByGroup.hasOwnProperty(g); });
  if (!allPresent) return null;
  return Math.max.apply(Math, required.map(function (g) { return seqByGroup[g]; }));
}
/* How many further checks (of any kind) a learner made after they already had
   what they needed to decide. Over-checking costs nothing in the scoring itself
   — it's reported as a coaching signal, not a penalty — because in real triage
   it's assessment time spent, not a wrong answer. */
function extraChecksAfterSufficiency(c) {
  var suffSeq = sufficiencySeq(c);
  if (suffSeq === null) return 0;
  return state.gatherLog.filter(function (e) { return e.seq > suffSeq; }).length;
}

function renderCheckedItemCard(cp) {
  var gm = GROUP_META[cp.g];
  var itemC = caseById(state.queue[state.qIndex]);
  var html = '<div class="gather-item-checked">' +
    '<div class="gather-item-checked-head"><span class="gather-check">\u2713</span>' +
    '<span class="gather-item-checked-label">' + esc(gm.label) + '</span>' +
    '<span class="info-option-tag ' + gm.level + '">' + gm.level + '</span></div>';
  if (cp.chips) {
    html += '<div class="vitals-grid" style="margin-top:10px;">';
    Object.keys(cp.chips).forEach(function (k) {
      html += '<div class="vital"><div class="v-label">' + esc(k) + '</div><div class="v-value">' + esc(cp.chips[k]) + '</div></div>';
    });
    html += '</div>';
  }
  if (cp.g === "vitals" && itemC.ageBandRef) {
    html += '<div class="age-ref">High-risk thresholds for <b>' + esc(itemC.ageBandRef.band) + '</b>: heart rate outside <b>' + esc(itemC.ageBandRef.hr) + '</b>, respiratory rate outside <b>' + esc(itemC.ageBandRef.rr) + '</b>.</div>';
  }
  html += '<p class="gather-item-checked-why">' + esc(cp.why) + '</p>';
  html += '</div>';
  return html;
}
function checkedCheckpoints(c) {
  var reveals = getRevealCheckpoints(c);
  var byGroup = {};
  reveals.forEach(function (cp) { byGroup[cp.g] = cp; });
  return state.cpLog.map(function (l) { return byGroup[l.g]; }).filter(Boolean);
}

function renderKnownItemCard(cp) {
  var gm = GROUP_META[cp.g];
  var html = '<div class="gather-item-known">' +
    '<div class="gather-item-checked-head"><span class="gather-check gather-check-known">\u2713</span>' +
    '<span class="gather-item-checked-label">' + esc(gm.label) + '</span>' +
    '<span class="info-option-tag ' + gm.level + '">' + gm.level + '</span></div>' +
    '<p class="gather-item-checked-why"><span class="gather-known-flag">Already known from the case info.</span> ' + esc(cp.why) + '</p>' +
    '</div>';
  return html;
}
function renderUnassessedItemCard(g, c) {
  var gm = GROUP_META[g];
  var critList = CRITERIA[c.population] && CRITERIA[c.population][g];
  var html = '<div class="gather-item-known">' +
    '<div class="gather-item-checked-head"><span class="gather-check gather-check-known">\u2013</span>' +
    '<span class="gather-item-checked-label">' + esc(gm.label) + '</span>' +
    '<span class="info-option-tag ' + gm.level + '">' + gm.level + '</span></div>' +
    '<p class="gather-item-checked-why"><span class="gather-known-flag">Not documented for this case.</span> The source teaching material doesn\u2019t record a specific finding here \u2014 often because the assessment had already reached its answer by this point.</p>';
  if (critList && critList.length) {
    html += '<ul class="criteria-list" style="margin:8px 0 0; padding-left:18px;">';
    critList.forEach(function (item) { html += '<li>' + esc(item) + '</li>'; });
    html += '</ul>';
  }
  html += '</div>';
  return html;
}

function renderReady(c) {
  var num = state.qIndex + 1;
  var reveals = getRevealCheckpoints(c);
  var checkedGs = state.cpLog.map(function (l) { return l.g; });
  var pct = Math.round((num - 1) / state.queue.length * 100 + (reveals.length ? (1 / state.queue.length) * (checkedGs.length / reveals.length) * 100 : 0));

  var html = '<div class="card">';
  html += caseHeader(c, num, pct);
  html += miniImageRow(c, false, true);
  html += '<div class="stage-tag">Case info</div>';
  html += '<h3 class="case-title" style="font-size:16px;">' + esc(c.title) + '</h3>';
  html += '<p class="vignette">' + esc(c.arrival) + '</p>';
  html += '<div class="divider"></div>';
  html += '<div class="stage-tag">Work through the card</div>';
  html += renderReferenceLinks();
  html += '<p style="font-size:13.5px; color:var(--ink-soft); margin:0 0 4px;">These choices represent all the actions on the full IITT card. Only select an item if checking it could give you new information that would change your triage decision. You can select a triage category whenever you feel you have enough information.</p>';

html += '<div class="gather-list">';
  var lastLevel = null;
  Object.keys(GROUP_META).forEach(function (g) {
    var gm = GROUP_META[g];
    if (gm.level !== lastLevel) {
      var sectionLabel = gm.level === "red" ? "Red criteria" : gm.level === "yellow" ? "Yellow criteria" : "High-risk vital signs";
      html += '<div class="gather-section-label">' + sectionLabel + '</div>';
      lastLevel = gm.level;
    }
    var cp = null;
    for (var i = 0; i < c.checkpoints.length; i++) { if (c.checkpoints[i].g === g) { cp = c.checkpoints[i]; break; } }
    if (cp) {
      var isChecked = cp.reveal ? (checkedGs.indexOf(g) !== -1) : (state.viewedKnown.indexOf(g) !== -1);
      if (isChecked) {
        html += cp.reveal ? renderCheckedItemCard(cp) : renderKnownItemCard(cp);
      } else {
        html += '<button type="button" class="info-option-btn" onclick="checkItem(\'' + g + '\')">' +
          '<span class="info-option-label">Check ' + esc(gm.label.toLowerCase()) + '</span>' +
          '</button>';
      }
    } else {
      var isViewed = state.viewedUnassessed.indexOf(g) !== -1;
      if (isViewed) {
        html += renderUnassessedItemCard(g, c);
      } else {
        html += '<button type="button" class="info-option-btn" onclick="checkItem(\'' + g + '\')">' +
          '<span class="info-option-label">Check ' + esc(gm.label.toLowerCase()) + '</span>' +
          '</button>';
      }
    }
  });
  html += '</div>';

  html += '<div class="cta-row"><button class="btn btn-primary" onclick="goToDecision()">I\u2019m ready to triage</button></div>';
  html += '</div>';
  appEl.innerHTML = html;
}

function checkItem(g) {
  var c = caseById(state.queue[state.qIndex]);
  var cp = null;
  for (var i = 0; i < c.checkpoints.length; i++) { if (c.checkpoints[i].g === g) { cp = c.checkpoints[i]; break; } }
  var itemKind, alreadySeen;
  var seq = nextGatherSeq();
  if (cp) {
    if (cp.reveal) {
      itemKind = "reveal";
      alreadySeen = state.cpLog.some(function (l) { return l.g === g; });
      if (!alreadySeen) state.cpLog.push({ g: g, seq: seq });
    } else {
      itemKind = "known";
      alreadySeen = state.viewedKnown.indexOf(g) !== -1;
      if (!alreadySeen) state.viewedKnown.push(g);
    }
  } else {
    itemKind = "unassessed";
    alreadySeen = state.viewedUnassessed.indexOf(g) !== -1;
    if (!alreadySeen) state.viewedUnassessed.push(g);
  }
  if (!alreadySeen) {
    state.gatherLog.push({ g: g, seq: seq, kind: itemKind });
    logEvent("item_checked", { group: g, item_kind: itemKind, seq: seq });
  }
  renderPractice();
}

function goToDecision() {
  logEvent("ready_to_triage", { items_gathered: state.cpLog.length });
  state.phase = "decision";
  renderPractice();
}

function renderDecision(c) {
  var num = state.qIndex + 1;
  var pct = Math.round(num / state.queue.length * 100 - (5 / state.queue.length));
  var html = '<div class="card">';
  html += caseHeader(c, num, pct);
  html += miniImageRow(c, !isFreeMode());
  if (isFreeMode() && !state.locked) {
    html += '<button type="button" class="back-link" onclick="backToReady()">\u2190 Back</button>';
  }
  html += '<div class="stage-tag">Triage decision</div>';
  html += '<h3 class="case-title" style="font-size:16px;">' + esc(c.title) + '</h3>';
  if (isFreeMode()) html += renderReferenceLinks();
  html += renderCheckpointTrail(c);
  html += '<div class="decision-prompt">Based on everything you found, what is the appropriate IITT triage category?</div>';
  html += '<div class="decision-grid">';
  ["red", "yellow", "green", "uptriage"].forEach(function (k) {
    var m = CATEGORY_META[k];
    var sel = state.selected === k ? " selected" : "";
    var dis = state.locked ? " disabled" : "";
    html += '<button class="decision-btn ' + k + sel + '" ' + dis + ' onclick="selectAnswer(\'' + k + '\')" aria-pressed="' + (state.selected === k) + '">' +
      '<span class="d-emoji">' + m.emoji + '</span><span class="d-label">' + m.label + '</span></button>';
  });
  html += '</div>';
  html += '<div class="submit-row"><button class="btn btn-primary" ' + (state.selected ? '' : 'disabled') + ' onclick="submitDecision()">Submit decision</button></div>';
  html += '</div>';
  appEl.innerHTML = html;
}
function selectAnswer(k) {
  if (state.locked) return;
  state.selected = k;
  renderPractice();
}
function backToReady() {
  if (state.locked) return;
  state.selected = null;
  state.phase = "ready";
  logEvent("returned_to_gathering", {});
  renderPractice();
}
function submitDecision() {
  if (!state.selected || state.locked) return;
  state.locked = true;
  var c = caseById(state.queue[state.qIndex]);
  var result = classify(c.correct, state.selected);
  if (isFreeMode() && result === "correct" && !hasSufficientBasis(c)) {
    result = "correct_unsupported";
  }
  var overcheckCount = isFreeMode() ? extraChecksAfterSufficiency(c) : 0;
  var responseTimeMs = state.answerStart ? (Date.now() - state.answerStart) : null;
  var rec = {
    anonymous_session_id: getSessionId(),
    case_attempt_id: state.caseAttemptId,
    case_id: c.id,
    adult_or_pediatric: c.population,
    correct_triage_category: c.correct,
    selected_triage_category: state.selected,
    response_classification: result,
    response_time_ms: responseTimeMs,
    case_position: state.qIndex + 1,
    practice_mode: state.practiceMode,
    info_items_gathered: state.cpLog.length,
    info_items_available: isFreeMode() ? getRevealCheckpoints(c).length : c.checkpoints.length,
    missing_gather_groups: (result === "correct_unsupported") ? requiredGatherGroups(c).filter(function (g) { return state.cpLog.map(function (l) { return l.g; }).indexOf(g) === -1; }) : [],
    overcheck_count: overcheckCount,
    timestamp: new Date().toISOString()
  };
  addResponse(rec);
  state.results.push(rec);
  logEvent("decision_submitted", {
    selected_triage_category: state.selected,
    correct_triage_category: c.correct,
    response_classification: result,
    response_time_ms: responseTimeMs,
    info_items_gathered: rec.info_items_gathered,
    info_items_available: rec.info_items_available,
    missing_gather_groups: rec.missing_gather_groups,
    overcheck_count: overcheckCount
  });
  state.phase = "feedback";
  renderPractice();
}

function renderFeedback(c) {
  var num = state.qIndex + 1;
  var rec = state.results[state.results.length - 1];
  var result = rec.response_classification;
  var meta = CATEGORY_META[c.correct];
  var selMeta = CATEGORY_META[state.selected];
  var bannerClass = result === "correct" ? "correct" : (result === "correct_unsupported" ? "neutral" : (result === "under" ? "under" : "over"));
  var bannerTitle = result === "correct" ? "Correct" : (result === "correct_unsupported" ? "Right category \u2014 not enough basis yet" : (result === "under" ? "Under-triage" : "Over-triage"));
  var bannerEmoji = result === "correct" ? "\u2705" : (result === "correct_unsupported" ? "\u2753" : (result === "under" ? "\u26A0\uFE0F" : "\u2139\uFE0F"));

  var rightCount = isFreeMode() ? 0 : state.cpLog.filter(function (l) { return l.isRight; }).length;
  var revealsCount = isFreeMode() ? getRevealCheckpoints(c).length : c.checkpoints.length;
  var infoLine;
  if (isFreeMode()) {
    infoLine = state.cpLog.length === 0
      ? 'You decided right away, without checking anything beyond the case info you started with.'
      : 'You checked ' + state.cpLog.length + ' of ' + revealsCount + ' available item' + (revealsCount === 1 ? "" : "s") + ' before deciding.';
  } else {
    infoLine = 'You correctly identified ' + rightCount + ' of ' + revealsCount + ' criteria checks along the way.';
  }

  var html = '<div class="card">';
  html += caseHeader(c, num, Math.round(num / state.queue.length * 100));
  html += miniImageRow(c);
  var bannerSub = "You selected <b>" + selMeta.label + "</b>";
  if (result === "under" || result === "over") bannerSub += " &middot; correct category was <b>" + meta.label + "</b>";
  else if (result === "correct_unsupported") bannerSub += " &middot; that’s the correct category, but not on the information you had at that point";
  html += '<div class="feedback-banner ' + bannerClass + '"><span class="f-emoji">' + bannerEmoji + '</span><div><div class="f-title">' + bannerTitle + '</div><div class="f-sub">' + bannerSub + '</div></div></div>';

  html += '<span class="answer-chip ' + meta.chip + '">' + meta.emoji + ' Correct IITT category: ' + meta.label + '</span>';
  if (result === "correct_unsupported") {
    var missingLabels = missingGatherLabels(c);
    html += '<div class="reassess-note" style="margin-top:10px;"><span>\u2753</span><span>You landed on the right category, but you hadn\u2019t checked <b>' + esc(missingLabels.join(", ")) + '</b> \u2014 the finding that actually determines it here. Picking the right answer without the information that supports it isn\u2019t a confirmed triage decision in real practice.</span></div>';
  }
  if (rec.overcheck_count > 0) {
    html += '<div class="reassess-note" style="margin-top:10px;"><span>\u23F1\uFE0F</span><span>You already had enough to decide, then checked ' + rec.overcheck_count + ' more item' + (rec.overcheck_count === 1 ? "" : "s") + ' before triaging. Not wrong \u2014 but in practice that\u2019s assessment time you didn\u2019t need to spend.</span></div>';
  }
  html += '<div class="reassess-note" style="margin-top:10px;"><span>\uD83D\uDCCB</span><span>' + infoLine + '</span></div>';

  html += '<div class="detail-section"><h4>Why</h4><p><b>' + esc(c.keyCriterion) + '.</b> ' + esc(c.feedbackWhy) + '</p></div>';
  if (c.teachingPoint) html += '<div class="detail-section"><h4>Key takeaway</h4><p>' + esc(c.teachingPoint) + '</p></div>';
  if (c.reassessment) html += '<div class="reassess-note"><span>\uD83D\uDD01</span><span>' + esc(c.reassessment) + '</span></div>';

  html += '<div class="restart-row"><button class="btn btn-primary" onclick="nextCase()">' + (state.qIndex + 1 >= state.queue.length ? "See summary" : "Next case") + '</button></div>';
  if (state.qIndex + 1 < state.queue.length) html += '<div class="restart-row" style="margin-top:6px;"><button class="btn btn-ghost" onclick="endSessionNow()">Finish here &amp; see my report</button></div>';
  html += '</div>';
  appEl.innerHTML = html;
}

function nextCase() {
  state.qIndex += 1;
  resetCaseState();
  renderPractice();
}
function restartPractice() { startPractice(state.practiceMode); }
function goToPracticeHome() { state.queue = []; render(); }

function renderPracticeSummary() {
  var results = state.results;
  var totalCorrect = results.filter(function (r) { return r.response_classification === "correct"; }).length;
  var totalUnsupported = results.filter(function (r) { return r.response_classification === "correct_unsupported"; }).length;
  var totalUnder = results.filter(function (r) { return r.response_classification === "under"; }).length;
  var totalOver = results.filter(function (r) { return r.response_classification === "over"; }).length;

  function bucketFor(pop) {
    var subset = results.filter(function (r) { return r.adult_or_pediatric === pop; });
    return {
      correct: subset.filter(function (r) { return r.response_classification === "correct"; }).length,
      unsupported: subset.filter(function (r) { return r.response_classification === "correct_unsupported"; }).length,
      under: subset.filter(function (r) { return r.response_classification === "under"; }).length,
      over: subset.filter(function (r) { return r.response_classification === "over"; }).length
    };
  }
  var adultB = bucketFor("adult");
  var pedsB = bucketFor("pediatric");

  var uptriageResults = results.filter(function (r) { return r.correct_triage_category === "uptriage"; });
  var uptriageCorrect = uptriageResults.filter(function (r) { return r.response_classification === "correct"; }).length;

  var html = '<div class="card">';
  html += '<h2 class="section-title">Practice complete</h2>';
  var modeLabel = state.practiceMode === "decide" ? "Triage practice" : "Guided triage practice";
  html += '<p class="section-sub">Mode: ' + modeLabel + ' &middot; Cases completed: ' + results.length + '</p>';
  html += '<div class="summary-stat-grid' + (totalUnsupported ? ' summary-stat-grid-4' : '') + '">';
  html += '<div class="summary-stat correct"><div class="s-num">' + totalCorrect + '</div><div class="s-label">Correct</div></div>';
  if (totalUnsupported) html += '<div class="summary-stat unsupported"><div class="s-num">' + totalUnsupported + '</div><div class="s-label">Right answer, no basis</div></div>';
  html += '<div class="summary-stat under"><div class="s-num">' + totalUnder + '</div><div class="s-label">Under-triaged</div></div>';
  html += '<div class="summary-stat over"><div class="s-num">' + totalOver + '</div><div class="s-label">Over-triaged</div></div>';
  html += '</div>';

  html += '<table class="pop-table"><thead><tr><th>Population</th><th>Correct</th>' + (totalUnsupported ? '<th>No basis</th>' : '') + '<th>Under</th><th>Over</th></tr></thead><tbody>';
  html += '<tr><td>Adult</td><td>' + adultB.correct + '</td>' + (totalUnsupported ? '<td>' + adultB.unsupported + '</td>' : '') + '<td>' + adultB.under + '</td><td>' + adultB.over + '</td></tr>';
  html += '<tr><td>Paediatric</td><td>' + pedsB.correct + '</td>' + (totalUnsupported ? '<td>' + pedsB.unsupported + '</td>' : '') + '<td>' + pedsB.under + '</td><td>' + pedsB.over + '</td></tr>';
  html += '</tbody></table>';
  if (totalUnsupported) {
    html += '<p style="font-size:12.5px; color:var(--ink-soft); line-height:1.5; margin-top:8px;">&ldquo;Right answer, no basis&rdquo; means you picked the correct category, but hadn\u2019t yet checked the specific finding that determines it \u2014 these are not counted as correct.</p>';
  }

  if (uptriageResults.length) {
    html += '<div class="reassess-note" style="margin-top:16px;"><span>\u26A0\uFE0F</span><span>High-risk vital sign (up-triage) cases: ' + uptriageCorrect + ' of ' + uptriageResults.length + ' correctly identified as needing up-triage.</span></div>';
  }

  if (isFreeMode()) {
    var totalGathered = results.reduce(function (sum, r) { return sum + (r.info_items_gathered || 0); }, 0);
    var totalAvailable = results.reduce(function (sum, r) { return sum + (r.info_items_available || 0); }, 0);
    var avgPct = totalAvailable ? Math.round((totalGathered / totalAvailable) * 100) : 0;
    html += '<div class="reassess-note" style="margin-top:10px;"><span>\uD83D\uDCCA</span><span>On average, you gathered ' + avgPct + '% of the available checks per case before deciding.</span></div>';
    var totalOvercheck = results.reduce(function (sum, r) { return sum + (r.overcheck_count || 0); }, 0);
    if (totalOvercheck > 0) {
      var avgOvercheck = Math.round((totalOvercheck / results.length) * 10) / 10;
      html += '<div class="reassess-note" style="margin-top:10px;"><span>\u23F1\uFE0F</span><span>On average, you kept checking ' + avgOvercheck + ' extra item' + (avgOvercheck === 1 ? "" : "s") + ' per case after you already had enough to decide.</span></div>';
    }
  }

  html += '<div class="restart-row"><button class="btn btn-primary" onclick="restartPractice()">Restart (same mode)</button></div>';
  html += '<div class="restart-row"><button class="btn btn-ghost" onclick="goToPracticeHome()">Choose a different mode</button></div>';
  html += '<div class="restart-row"><button class="btn btn-ghost" onclick="openProgress()">📊 My progress</button></div>';
  html += '<div class="restart-row"><button class="btn btn-ghost" onclick="openResetConfirm()">👤 Reset for new user</button></div>';
  html += '</div>';
  appEl.innerHTML = html;
}

/* ---- Clinician review mode ---- */
function renderReview() {
  if (!state.reviewOpenId) { renderReviewList(); }
  else { renderReviewDetail(state.reviewOpenId); }
}

function renderReviewList() {
  var html = '<div class="card">';
  html += '<h2 class="section-title">Clinician review</h2>';
  html += '<p class="section-sub">Inspect each case&rsquo;s extracted content, checkpoint sequence, and source traceability. Tap a case to view and edit.</p>';
  CASES.forEach(function (c) {
    var meta = CATEGORY_META[c.correct];
    html += '<div class="review-list-item" onclick="openReview(\'' + c.id + '\')" role="button" tabindex="0">';
    html += '<img class="review-thumb" src="' + FACE_IMAGES[c.image] + '" alt="">';
    html += '<div><div class="r-title">' + esc(c.title) + '</div><div class="r-sub">' + (c.population === "adult" ? "Adult" : "Paediatric") + ' \u00b7 ' + meta.label + ' \u00b7 ' + c.checkpoints.length + ' checkpoints \u00b7 slides ' + esc(c.sourceSlides) + '</div></div>';
    if (c.needsReview) {
      var listStatus = reviewStatusFor(c.id);
      if (listStatus === "Reviewed \u2014 approved") html += '<span class="flag-pill confirmed">CONFIRMED</span>';
      else if (listStatus === "Reviewed \u2014 needs edits") html += '<span class="flag-pill edits">EDITS NOTED</span>';
      else html += '<span class="flag-pill">NEEDS REVIEW</span>';
    }
    html += '</div>';
  });
  html += '</div>';
  appEl.innerHTML = html;
}

function openReview(id) { state.reviewOpenId = id; render(); }
function closeReview() { state.reviewOpenId = null; render(); }

function renderReviewDetail(id) {
  var c = caseById(id);
  var overrides = getMetaOverrides()[id] || {};
  var meta = CATEGORY_META[c.correct];

  var html = '<button class="back-link" onclick="closeReview()">\u2190 All cases</button>';
  html += '<div class="card">';
  if (c.needsReview) {
    var detailStatus = overrides.review_status || "Not yet reviewed";
    var bannerClass = detailStatus === "Reviewed \u2014 approved" ? " confirmed" : (detailStatus === "Reviewed \u2014 needs edits" ? " edits" : "");
    html += '<div class="review-flag-banner' + bannerClass + '">';
    html += '\uD83D\uDEA9 <b>Needs clinician review:</b> ' + esc(c.reviewNote);
    if (detailStatus === "Reviewed \u2014 approved") html += '<div style="margin-top:6px; font-weight:700;">\u2713 Confirmed as extracted.</div>';
    else if (detailStatus === "Reviewed \u2014 needs edits") html += '<div style="margin-top:6px; font-weight:700;">\u270E Edits requested \u2014 see notes below.</div>';
    html += '<div class="review-flag-actions">' +
      '<button type="button" class="btn btn-primary btn-sm" onclick="confirmCaseReview(\'' + id + '\')">\u2713 Confirm as extracted</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" onclick="requestCaseEdits(\'' + id + '\')">\u270E Request edits</button>' +
      '</div>';
    html += '<div class="field-row" style="margin-top:12px; margin-bottom:0;"><label>Resolution notes</label><textarea rows="3" data-case="' + id + '" data-field="review_resolution_notes" onchange="onMetaEdit(this)" placeholder="Add corrections, clarifications, or the reasoning for confirming this as-is...">' + esc(overrides.review_resolution_notes || "") + '</textarea></div>';
    html += '</div>';
  }
  html += '<img class="case-image" src="' + IMAGES[c.image] + '" alt="">';
  html += '<h3 class="case-title">' + esc(c.title) + '</h3>';
  html += '<div class="kv"><span><b>Population:</b> ' + (c.population === "adult" ? "Adult" : "Paediatric") + '</span><span><b>Age:</b> ' + esc(c.age) + '</span><span><b>Sex:</b> ' + esc(c.sex) + '</span></div>';
  html += '<div class="kv" style="margin-top:6px;"><span><b>Clinical domain:</b> ' + esc(c.domain) + '</span></div>';
  html += '<div class="kv" style="margin-top:6px;"><span><b>Source:</b> ' + esc(c.sourceDeck) + ', slides ' + esc(c.sourceSlides) + '</span></div>';

  html += '<div class="detail-section"><h4>Case info</h4><p>' + esc(c.arrival) + '</p></div>';

  html += '<div class="detail-section"><h4>Checkpoint sequence (' + c.checkpoints.length + ' \u2014 used in Guided triage practice)</h4>';
  html += '<ol class="cp-review-list">';
  c.checkpoints.forEach(function (cp) {
    var gm = GROUP_META[cp.g];
    html += '<li><b>' + esc(gm.label) + ' (' + gm.level + '):</b> ' + esc(gm.question) + ' &rarr; <b>' + (cp.correct === "yes" ? "Yes" : "No") + '.</b> ' + esc(cp.why);
    if (cp.chips) {
      html += ' <i>(' + Object.keys(cp.chips).map(function (k) { return k + ": " + cp.chips[k]; }).join(", ") + ')</i>';
    }
    if (cp.reveal) {
      html += ' <span class="flag-pill" style="margin-left:6px; background:var(--primary-soft); color:var(--primary-dark);">DECIDE-MODE STEP</span>';
    }
    html += '</li>';
  });
  html += '</ol>';
  html += '<p style="font-size:12.5px; color:var(--ink-soft); line-height:1.5; margin-top:8px;">Steps tagged <b>DECIDE-MODE STEP</b> are the only ones offered as \u201cwhat would you check next\u201d options in Triage practice \u2014 they mark where the source slides show genuinely new information (an \u201cAdditional information\u201d reveal) rather than something already evident from the case info. This filtering is an editorial judgment call; please confirm it against the source slides.</p>';
  html += '</div>';

  html += '<div class="detail-section"><h4>Correct triage category</h4><span class="answer-chip ' + meta.chip + '">' + meta.emoji + ' ' + meta.label + '</span></div>';
  html += '<div class="detail-section"><h4>Key IITT criterion</h4><p>' + esc(c.keyCriterion) + '</p></div>';
  html += '<div class="detail-section"><h4>Feedback</h4><p>' + esc(c.feedbackWhy) + '</p></div>';
  if (c.teachingPoint) html += '<div class="detail-section"><h4>Teaching point</h4><p>' + esc(c.teachingPoint) + '</p></div>';
  if (c.reassessment) html += '<div class="detail-section"><h4>Reassessment note</h4><p>' + esc(c.reassessment) + '</p></div>';

  html += '<div class="divider"></div>';
  html += '<h4 style="font-size:12.5px; text-transform:uppercase; letter-spacing:.05em; color:var(--ink-faint); margin-bottom:12px;">Educational-design metadata (for clinician completion)</h4>';
  INTERNAL_FIELDS.forEach(function (f) {
    var val = overrides[f.key] || "";
    html += '<div class="field-row"><label>' + esc(f.label) + '</label><textarea rows="2" data-case="' + id + '" data-field="' + f.key + '" onchange="onMetaEdit(this)" placeholder="Not yet reviewed">' + esc(val) + '</textarea></div>';
  });
  html += '<div class="field-row"><label>Review status</label><select data-case="' + id + '" data-field="review_status" onchange="onMetaEdit(this)">';
  ["Not yet reviewed", "In review", "Reviewed \u2014 approved", "Reviewed \u2014 needs edits"].forEach(function (opt) {
    var sel = (overrides.review_status || "Not yet reviewed") === opt ? " selected" : "";
    html += '<option' + sel + '>' + opt + '</option>';
  });
  html += '</select></div>';
  html += '<div class="save-note" id="save-note-' + id + '"></div>';

  html += '</div>';
  appEl.innerHTML = html;
}

function onMetaEdit(el) {
  var id = el.getAttribute("data-case");
  var field = el.getAttribute("data-field");
  setMetaOverride(id, field, el.value);
  if (field === "review_status" && state.mode === "review" && state.reviewOpenId === id) {
    renderReviewDetail(id);
    return;
  }
  var note = document.getElementById("save-note-" + id);
  if (note) {
    note.textContent = "Saved";
    setTimeout(function () { if (note) note.textContent = ""; }, 1400);
  }
}
function confirmCaseReview(id) {
  setMetaOverride(id, "review_status", "Reviewed \u2014 approved");
  renderReviewDetail(id);
}
function requestCaseEdits(id) {
  setMetaOverride(id, "review_status", "Reviewed \u2014 needs edits");
  renderReviewDetail(id);
  var el = document.querySelector && document.querySelector('textarea[data-case="' + id + '"][data-field="review_resolution_notes"]');
  if (el && el.focus) el.focus();
}

/* ---- Case bank coverage mode ---- */
function renderCoverage() {
  var adultCases = CASES.filter(function (c) { return c.population === "adult"; });
  var pedsCases = CASES.filter(function (c) { return c.population === "pediatric"; });

  function catCounts(list) {
    var counts = { red: 0, yellow: 0, green: 0, uptriage: 0 };
    list.forEach(function (c) { counts[c.correct]++; });
    return counts;
  }
  var aCounts = catCounts(adultCases);
  var pCounts = catCounts(pedsCases);

  var html = '<div class="card">';
  html += '<h2 class="section-title">Case bank coverage</h2>';
  html += '<p class="section-sub">Current coverage across the 10 seed cases, to guide which new cases should be developed next.</p>';

  html += '<table class="pop-table"><thead><tr><th>Category</th><th>Adult</th><th>Paediatric</th><th>Total</th></tr></thead><tbody>';
  ["red", "yellow", "green", "uptriage"].forEach(function (k) {
    var m = CATEGORY_META[k];
    html += '<tr><td>' + m.emoji + ' ' + m.label + '</td><td>' + aCounts[k] + '</td><td>' + pCounts[k] + '</td><td>' + (aCounts[k] + pCounts[k]) + '</td></tr>';
  });
  html += '</tbody></table>';

  html += '<div class="divider"></div>';
  html += '<h4 style="font-size:12.5px; text-transform:uppercase; letter-spacing:.05em; color:var(--ink-faint); margin-bottom:6px;">Clinical domains represented</h4>';
  CASES.forEach(function (c) {
    html += '<div class="coverage-domain-row"><span>' + esc(c.domain) + '</span><span class="c-count">' + (c.population === "adult" ? "Adult" : "Peds") + '</span></div>';
  });

  html += '<div class="divider"></div>';
  html += '<h4 style="font-size:12.5px; text-transform:uppercase; letter-spacing:.05em; color:var(--ink-faint); margin-bottom:6px;">Criterion types &amp; intended challenges</h4>';
  html += '<p style="font-size:13px; color:var(--ink-soft); line-height:1.5;">Not yet populated &mdash; complete the educational-design metadata for each case in Clinician review to build this out.</p>';

  html += '</div>';
  appEl.innerHTML = html;
}

/* ---------------- site config, pause switch, case loading ----------------
   The site is published twice by the GitHub Action: the live copy at the
   root and a preview copy under /preview. config.json (written by the
   Action) says which one this is. Missing config.json = live (the safe
   default: only cases whose status is "live" are shown).
   status.json is the pause switch: set "paused": true and the live site
   shows a message instead of the app. If status.json can't be fetched the
   app stays open (a network hiccup should not lock learners out).
   Cases are separate files listed in cases.json. */
var SITE = { env: "live", build: "", version: "" };
var STATUS_RECHECK_MS = 5 * 60 * 1000;

function fetchJson(url) {
  var u = url + (url.indexOf("?") < 0 ? "?" : "&") + "t=" + Date.now();
  return fetch(u, { cache: "no-store" }).then(function (r) {
    if (!r.ok) throw new Error(url + " returned " + r.status);
    return r.json();
  });
}

function showPausedScreen(message) {
  var msg = message || "This practice tool is temporarily unavailable. Please check back soon.";
  appEl.innerHTML =
    '<div class="card paused-card">' +
    '<h2 class="section-title">Temporarily unavailable</h2>' +
    '<p class="section-sub">' + esc(msg) + '</p>' +
    '</div>';
}

function showLoadError(detail) {
  appEl.innerHTML =
    '<div class="card paused-card">' +
    '<h2 class="section-title">Couldn’t load the practice cases</h2>' +
    '<p class="section-sub">Please check your internet connection and try again.</p>' +
    '<div class="restart-row"><button class="btn btn-primary" onclick="boot()">Try again</button></div>' +
    '</div>';
  if (window.console) console.error("Case loading failed:", detail);
}

function caseVisibleHere(c) {
  if (SITE.env === "preview") return true;
  return c.status === "live";
}

function checkPausedAgain() {
  if (SITE.env !== "live") return;
  fetchJson("status.json").then(function (s) {
    if (s && s.paused === true) showPausedScreen(s.message);
  }).catch(function () { /* fail open */ });
}

function boot() {
  appEl.innerHTML = '<div class="card paused-card"><p class="section-sub">Loading…</p></div>';
  fetchJson("config.json").catch(function () { return {}; }).then(function (cfg) {
    SITE.env = cfg.env === "preview" ? "preview" : "live";
    SITE.build = cfg.build || "";
    if (SITE.env === "preview" && !document.getElementById("preview-banner")) {
      var b = document.createElement("div");
      b.id = "preview-banner";
      b.className = "preview-banner";
      b.textContent = "PREVIEW — not the live site. Draft cases may appear.";
      document.body.insertBefore(b, document.body.firstChild);
    }
    return Promise.all([
      fetchJson("version.json").catch(function () { return {}; }),
      fetchJson("status.json").catch(function () { return { paused: false }; })
    ]);
  }).then(function (res) {
    SITE.version = (res[0] && res[0].version) || "";
    var status = res[1] || {};
    if (SITE.env === "live" && status.paused === true) {
      showPausedScreen(status.message);
      return null;
    }
    return fetchJson("cases.json").then(function (manifest) {
      return Promise.all((manifest.cases || []).map(function (id) {
        return fetchJson("case-" + id + ".json");
      }));
    }).then(function (loaded) {
      CASES = loaded.filter(caseVisibleHere);
      computeAgeBandVitals();
      render();
      if (!window.__statusTimer) window.__statusTimer = setInterval(checkPausedAgain, STATUS_RECHECK_MS);
    });
  }).catch(showLoadError);
}

boot();

