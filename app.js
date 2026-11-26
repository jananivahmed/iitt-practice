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
var MODE_ICONS = {"example": "ui-mode-example.png", "guided": "ui-mode-guided.png", "triage": "ui-mode-triage.png"};
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
  red:      { label: "RED",       emoji: "", chip: "chip-red" },
  yellow:   { label: "YELLOW",    emoji: "", chip: "chip-yellow" },
  green:    { label: "GREEN",     emoji: "", chip: "chip-green" },
  uptriage: { label: "UP-TRIAGE", emoji: "", chip: "chip-uptriage" }
};

/* ---------------- storage helpers ---------------- */
var STORE_RESPONSES = "iitt_practice_responses_v2";
var STORE_METADATA = "iitt_clinician_metadata_v1";
var STORE_SESSION = "iitt_session_id_v1";
var STORE_EVENTS = "iitt_practice_events_v1";
var STORE_LEARNER_NAME = "iitt_learner_name_v1";
var STORE_LEARNER_EMAIL = "iitt_learner_email_v1";
var STORE_PROFILE = "iitt_learner_profile_v1";
var STORE_OUTBOX = "iitt_outbox_v1";
var STORE_CASE_COUNT = "iitt_case_count_v1";
var STORE_RUN = "iitt_run_in_progress_v1";
var STORE_INTRO = "iitt_intro_seen_v1";
var STORE_EX_SEEN = "iitt_examples_watched_v1";
var ROLES = ["Nurse", "Physician", "Clinical officer or other clinician", "Student", "Other"];
var COUNTRIES = ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua & Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia & Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Caribbean Netherlands", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo - Brazzaville", "Congo - Kinshasa", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curaçao", "Cyprus", "Czechia", "Côte d’Ivoire", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard & McDonald Islands", "Honduras", "Hong Kong SAR China", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao SAR China", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea", "North Macedonia", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territories", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn Islands", "Poland", "Portugal", "Puerto Rico", "Qatar", "Romania", "Russia", "Rwanda", "Réunion", "Samoa", "San Marino", "Sark", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia & South Sandwich Islands", "South Korea", "South Sudan", "Spain", "Sri Lanka", "St. Barthélemy", "St. Helena", "St. Kitts & Nevis", "St. Lucia", "St. Martin", "St. Pierre & Miquelon", "St. Vincent & Grenadines", "Sudan", "Suriname", "Svalbard & Jan Mayen", "Sweden", "Switzerland", "Syria", "São Tomé & Príncipe", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad & Tobago", "Tunisia", "Turkmenistan", "Turks & Caicos Islands", "Tuvalu", "Türkiye", "U.S. Outlying Islands", "U.S. Virgin Islands", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Wallis & Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe", "Åland Islands"];
/* Data collection is off unless collection.json says otherwise. */
var COLLECT = { enabled: false, endpoint: "", notice: "" };
var CONFIDENCE = [
  { k: "not_sure", label: "Not sure" },
  { k: "fairly_sure", label: "Fairly sure" },
  { k: "certain", label: "Certain" }
];
function confidenceLabel(k) {
  for (var i = 0; i < CONFIDENCE.length; i++) if (CONFIDENCE[i].k === k) return CONFIDENCE[i].label;
  return "";
}
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
function getProfile() { return safeGet(STORE_PROFILE, null); }
function setProfile(p) { safeSet(STORE_PROFILE, p); }
function getLearnerEmail() { return safeGet(STORE_LEARNER_EMAIL, null); }
function setLearnerEmail(email) { safeSet(STORE_LEARNER_EMAIL, email); }
/* Clears everything specific to the person currently practising on this
   device — their responses, event log, and anonymous session id — so the
   next person starts from a clean slate and doesn't see (or get mixed into)
   the previous learner's progress. Clinician metadata overrides (case review
   status/notes) are content about the CASES, not the learner, so they are
   deliberately left untouched here. */
function resetForNewUser() {
  safeRemove(STORE_RUN);
  safeRemove(STORE_EX_SEEN);
  safeRemove(STORE_RESPONSES);
  safeRemove(STORE_EVENTS);
  safeRemove(STORE_SESSION);
  safeRemove(STORE_LEARNER_NAME);
  safeRemove(STORE_LEARNER_EMAIL);
  safeRemove(STORE_PROFILE);
  /* The outbox is left alone on purpose: details already submitted at sign-in
     are still sent even if the next learner starts on this device. */
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
function getResponses() { return safeGet(STORE_RESPONSES, []).map(normResp); }
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
  checked: [],
  caseAttemptId: null,
  caseAttemptStart: null,
  gatherSeq: 0,
  selected: null,
  locked: false,
  answerStart: null,
  results: [],
  reviewOpenId: null,
  caseInfoOpen: false,
  example: null,
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
  return shuffleArray(ids).slice(0, getCaseCount());
}
/* How many cases a practice run contains: 1 up to every case available (10 at most). */
function maxCaseCount() { return Math.max(1, Math.min(10, CASES.length)); }
function getCaseCount() {
  var n = parseInt(safeGet(STORE_CASE_COUNT, 5), 10);
  if (isNaN(n)) n = 5;
  return Math.max(1, Math.min(maxCaseCount(), n));
}
function changeCaseCount(delta) {
  safeSet(STORE_CASE_COUNT, getCaseCount() + delta);
  renderPracticeHome();
}
function caseById(id) {
  for (var i = 0; i < CASES.length; i++) if (CASES[i].id === id) return CASES[i];
  return null;
}
function startPractice(mode) {
  state.example = null;
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
  state.checked = [];
  state.caseAttemptId = null;
  state.caseAttemptStart = null;
  state.gatherSeq = 0;
  state.selected = null;
  state.confidence = null;
  state.reason = null;
  state.locked = false;
  state.answerStart = Date.now();
  state.caseInfoOpen = false;
  state.collapsed = {};
  state.refCardOpen = null;
  state.refZoomed = false;
}

/* ---------------- scoring ---------------- */
/* Urgency order, least to most: green, yellow, up-triage, red. */
var URGENCY_RANK = { green: 0, yellow: 1, uptriage: 2, red: 3 };
function classify(correct, selected) {
  if (correct === selected) return { result: "correct", direction: null };
  /* Wrong answers are recorded as "incorrect". The direction is a secondary detail:
     under-triage (a less urgent category than needed) or over-triage (a more urgent one). */
  return { result: "incorrect", direction: URGENCY_RANK[selected] < URGENCY_RANK[correct] ? "under" : "over" };
}
/* Older saved records used "under" / "over" as the classification. Read them
   as incorrect with that direction so earlier practice still counts. */
function normResp(r) {
  if (r && (r.response_classification === "under" || r.response_classification === "over")) {
    var c = {}; for (var k in r) c[k] = r[k];
    c.error_direction = r.response_classification;
    c.response_classification = "incorrect";
    return c;
  }
  return r;
}
function isIncorrect(r) { return r.response_classification === "incorrect"; }
function directionCounts(list) {
  var inc = list.filter(isIncorrect);
  return {
    incorrect: inc.length,
    under: inc.filter(function (r) { return r.error_direction === "under"; }).length,
    over: inc.filter(function (r) { return r.error_direction === "over"; }).length,
    na: inc.filter(function (r) { return r.error_direction !== "under" && r.error_direction !== "over"; }).length
  };
}
function confidenceNote(list) {
  var rated = list.filter(function (r) { return r.confidence; });
  if (!rated.length) return "";
  var parts = CONFIDENCE.slice().reverse().map(function (o) {
    var sub = rated.filter(function (r) { return r.confidence === o.k; });
    if (!sub.length) return "";
    var ok = sub.filter(function (r) { return r.response_classification === "correct"; }).length;
    return o.label.toLowerCase() + ": " + ok + " of " + sub.length + " correct";
  }).filter(Boolean);
  return '<p class="dir-note">By confidence \u2014 ' + parts.join("; ") + '.</p>';
}
function directionNote(list) {
  var d = directionCounts(list);
  if (!d.incorrect) return "";
  return '<p class="dir-note">Of the ' + d.incorrect + ' incorrect: ' + d.under + ' under-triaged, ' + d.over + ' over-triaged' + (d.na ? ', ' + d.na + ' not classed (older answers)' : '') + '.' + (d.under ? ' Under-triage is the most important error to learn from, because it delays care for the sickest patients.' : '') + '</p>';
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
  if (!getLearnerName() || !getLearnerEmail() || (COLLECT.enabled && !getProfile())) { renderLogin(); window.scrollTo(0, 0); return; }
  renderPractice();
  window.scrollTo(0, 0);
}

var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---- Sending sign-in details (only when collection.json enables it) ----
   Each sign-in is saved on the device first, then sent in the background.
   If sending fails (offline, server busy) the record stays saved and is
   retried the next time the app opens or the device comes back online.
   The record id lets the receiver ignore a repeat, so retrying is safe. */
function getOutbox() { return safeGet(STORE_OUTBOX, []); }
function setOutbox(list) { safeSet(STORE_OUTBOX, list); }
function queueRegistration(name, email, profile) {
  if (!COLLECT.enabled || !COLLECT.endpoint) return;
  var now = new Date().toISOString();
  var rec = {
    record_id: getSessionId() + "-" + now,
    session_id: getSessionId(),
    signed_in_at: now,
    name: name,
    email: email,
    role: profile.role,
    facility: profile.facility || "",
    country: profile.country,
    app_version: SITE.version || "",
    site: SITE.env
  };
  var box = getOutbox();
  box.push(rec);
  setOutbox(box);
  flushOutbox();
}
var flushing = false;
function flushOutbox() {
  if (flushing || !COLLECT.enabled || !COLLECT.endpoint) return;
  var box = getOutbox();
  if (!box.length) return;
  flushing = true;
  var rec = box[0];
  fetch(COLLECT.endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(rec)
  }).then(function (r) { return r.json(); }).then(function (res) {
    if (res && res.ok) {
      setOutbox(getOutbox().filter(function (x) { return x.record_id !== rec.record_id; }));
    } else {
      /* the receiver refused this record (for example invalid data): drop it
         rather than retrying forever */
      if (res && res.error) setOutbox(getOutbox().filter(function (x) { return x.record_id !== rec.record_id; }));
      else throw new Error("not sent");
    }
    flushing = false;
    flushOutbox();
  }).catch(function () { flushing = false; });
}
window.addEventListener("online", function () { flushOutbox(); });

/* ---- Login (a name + email to keep one learner's practice history separate
   from the next person's on a shared device — not authentication; nothing is
   checked against anything. Nothing leaves this device unless collection.json
   turns data collection on; no email is sent from here). ---- */
function renderLogin() {
  var html = '<div class="card empty-hero" style="padding-bottom:24px;">' +
    '<img class="login-avatar" src="' + LOGIN_AVATAR + '" alt="">' +
    '<h2 class="section-title">Who’s practising?</h2>' +
    '<p class="reading">Enter your name and email so your progress stays separate from other learners using this device, and so your feedback reports are tied to you.</p>' +
    '<div class="field-row" style="text-align:left;">' +
    '<input type="text" id="login-name-input" placeholder="Your name" maxlength="60" autocomplete="off" onkeydown="if(event.key===\'Enter\'){event.preventDefault();submitLogin();}">' +
    '<div id="login-name-error" class="login-error" hidden>Enter your name to continue.</div>' +
    '</div>' +
    '<div class="field-row" style="text-align:left;">' +
    '<input type="email" id="login-email-input" placeholder="you@example.com" maxlength="120" autocomplete="off" onkeydown="if(event.key===\'Enter\'){event.preventDefault();submitLogin();}">' +
    '<div id="login-email-error" class="login-error" hidden>Enter a valid email address to continue.</div>' +
    '</div>' +
    '<div class="field-row" style="text-align:left;">' +
    '<select id="login-role-input"><option value="">Your role</option>' + ROLES.map(function (r) { return '<option>' + esc(r) + '</option>'; }).join("") + '</select>' +
    '<div id="login-role-error" class="login-error" hidden>Choose your role to continue.</div>' +
    '</div>' +
    '<div class="field-row" style="text-align:left;">' +
    '<input type="text" id="login-facility-input" placeholder="Facility or organisation (optional)" maxlength="120" autocomplete="off">' +
    '</div>' +
    '<div class="field-row" style="text-align:left;">' +
    '<select id="login-country-input"><option value="">Country</option>' + COUNTRIES.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join("") + '</select>' +
    '<div id="login-country-error" class="login-error" hidden>Choose your country to continue.</div>' +
    '</div>' +
    (COLLECT.enabled && COLLECT.notice ? '<p class="login-notice">' + esc(COLLECT.notice) + '</p>' : '') +
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
  var role = (document.getElementById("login-role-input") || {}).value || "";
  var facility = ((document.getElementById("login-facility-input") || {}).value || "").trim();
  var country = (document.getElementById("login-country-input") || {}).value || "";
  var nameOk = !!name;
  var emailOk = !!email && EMAIL_PATTERN.test(email);
  var roleOk = ROLES.indexOf(role) !== -1;
  var countryOk = COUNTRIES.indexOf(country) !== -1;
  if (nameErr) nameErr.hidden = nameOk;
  if (emailErr) emailErr.hidden = emailOk;
  var roleErr = document.getElementById("login-role-error");
  var countryErr = document.getElementById("login-country-error");
  if (roleErr) roleErr.hidden = roleOk;
  if (countryErr) countryErr.hidden = countryOk;
  if (!nameOk || !emailOk || !roleOk || !countryOk) {
    (nameOk ? (emailOk ? (roleOk ? document.getElementById("login-country-input") : document.getElementById("login-role-input")) : emailInput) : nameInput).focus();
    return;
  }
  setLearnerName(name);
  setLearnerEmail(email);
  setProfile({ role: role, facility: facility, country: country });
  queueRegistration(name, email, { role: role, facility: facility, country: country });
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
  if (!state.results.length) { goToPracticeHome(); return; }
  state.qIndex = state.queue.length;
  render();
}
function renderEndSessionConfirm() {
  var doneCount = state.results.length;
  var html = '<div class="card">';
  html += '<h3 class="case-title">End this practice session now?</h3>';
  html += '<p class="vignette">' + (doneCount
    ? 'You’ll get a feedback report on the ' + doneCount + ' case' + (doneCount === 1 ? "" : "s") + ' you’ve completed so far. The case in progress won’t be scored.'
    : 'You haven’t completed a case yet, so there is no report to show. Leaving takes you back to the start.') + '</p>';
  html += '<div class="restart-row">' +
    '<button class="btn btn-ghost" onclick="closeEndSessionConfirm()">Keep practising</button>' +
    '<button class="btn btn-primary" onclick="endSessionNow()">' + (doneCount ? 'End &amp; see report' : 'Leave practice') + '</button>' +
    '</div>';
  html += '</div>';
  appEl.innerHTML = html;
}

/* ---- Practice mode ---- */
/* The screen being shown, as a short signature. When it changes, focus moves
   to the new content and screen readers are told; when it stays the same (for
   example a card was checked), focus stays on the same control. */
function screenSignature() {
  return [state.example ? state.example.id + ":" + state.example.step : "", state.resetConfirmOpen, state.endSessionConfirmOpen, state.progressOpen, state.queue.length, state.qIndex, state.refCardOpen, state.ageBandOpen, state.caseInfoOpen, state.phase, state.cpIndex, state.cpLocked, state.locked].join("|");
}
var lastSignature = null;
function renderPractice() {
  var sig = screenSignature();
  var sameScreen = sig === lastSignature;
  var buttons = appEl.querySelectorAll("button, select, input");
  var focusIndex = -1;
  for (var i = 0; i < buttons.length; i++) if (buttons[i] === document.activeElement) focusIndex = i;
  renderPracticeScreen();
  lastSignature = sig;
  saveRun();
  if (sameScreen && focusIndex >= 0) {
    var again = appEl.querySelectorAll("button, select, input");
    if (again[focusIndex] && !again[focusIndex].disabled) again[focusIndex].focus({ preventScroll: true });
  } else if (!sameScreen) {
    window.scrollTo(0, 0);
    appEl.setAttribute("tabindex", "-1");
    appEl.focus({ preventScroll: true });
    announceScreen();
  }
  markScreen();
}
/* A short name for the screen being shown. It becomes the page title and a hidden heading, so browser tabs and screen-reader heading lists say where the learner is. */
function screenTitle() {
  if (state.resetConfirmOpen) return "Clear progress on this device?";
  if (state.endSessionConfirmOpen) return "End this practice session?";
  if (state.progressOpen) return "My progress";
  if (state.refCardOpen) return "Reference card";
  if (state.ageBandOpen) return "Age-band vital sign thresholds";
  if (state.example) {
    var ec = caseById(state.example.id), en = ec ? ec.checkpoints.length : 0;
    if (state.example.step === 0) return "Worked example: patient arrival";
    if (state.example.step <= en) return "Worked example: part " + state.example.step + " of " + en;
    return "Worked example: decision";
  }
  if (!state.queue.length) return "Choose how to practise";
  if (state.qIndex >= state.queue.length) return "Practice summary";
  var c = caseById(state.queue[state.qIndex]);
  var lead = "Case " + (state.qIndex + 1) + " of " + state.queue.length;
  if (state.caseInfoOpen && state.phase !== "arrival") return lead + ": case information";
  if (state.phase === "arrival") return lead + ": patient arrival";
  if (state.phase === "checkpoint" && c) return lead + ": part " + (state.cpIndex + 1) + " of " + c.checkpoints.length;
  if (state.phase === "decision") return lead + ": choose a category";
  return lead + ": work through the card";
}
function markScreen() {
  var t = screenTitle();
  try { document.title = t + " | IITT Practice Companion"; } catch (e) {}
  appEl.insertAdjacentHTML("afterbegin", '<h2 class="sr-only">' + esc(t) + '</h2>');
  var hs = appEl.querySelectorAll("h4");
  for (var i = 0; i < hs.length; i++) hs[i].setAttribute("aria-level", "3");
}
function announceScreen() {
  var live = document.getElementById("sr-live");
  if (!live) return;
  var say = appEl.querySelector("[data-announce]");
  if (say) { live.textContent = say.getAttribute("data-announce"); return; }
  var el = appEl.querySelector(".f-title") || appEl.querySelector(".cp-feedback-title") || appEl.querySelector("h2, h3, .decision-prompt, .vignette");
  live.textContent = el ? el.textContent : "";
}

/* ---- Keeping a run in progress across a reload ---- */
function saveRun() {
  if (!state.queue.length && state.example) { safeSet(STORE_RUN, { email: getLearnerEmail(), example: state.example }); return; }
  if (!state.queue.length) { safeRemove(STORE_RUN); return; }
  safeSet(STORE_RUN, {
    email: getLearnerEmail(),
    practiceMode: state.practiceMode, queue: state.queue, qIndex: state.qIndex, phase: state.phase,
    cpIndex: state.cpIndex, cpSelected: state.cpSelected, cpLocked: state.cpLocked, reason: state.reason, cpLog: state.cpLog,
    checked: state.checked, gatherSeq: state.gatherSeq, selected: state.selected, confidence: state.confidence,
    locked: state.locked, caseAttemptId: state.caseAttemptId, caseAttemptStart: state.caseAttemptStart, results: state.results
  });
}
function restoreRun() {
  var r = safeGet(STORE_RUN, null);
  if (r && r.email === getLearnerEmail() && r.example && (!r.queue || !r.queue.length) && caseById(r.example.id)) { state.example = r.example; return true; }
  if (!r || r.email !== getLearnerEmail() || !r.queue || !r.queue.length) return false;
  for (var i = 0; i < r.queue.length; i++) if (!caseById(r.queue[i])) return false;
  ["practiceMode", "queue", "qIndex", "phase", "cpIndex", "cpSelected", "cpLocked", "reason", "cpLog", "checked", "gatherSeq", "selected", "confidence", "locked", "caseAttemptId", "caseAttemptStart", "results"].forEach(function (k) {
    if (r[k] !== undefined) state[k] = r[k];
  });
  state.answerStart = Date.now();
  return true;
}
function renderPracticeScreen() {
  if (state.resetConfirmOpen) { renderResetConfirm(); return; }
  if (state.endSessionConfirmOpen) { renderEndSessionConfirm(); return; }
  if (state.progressOpen) { renderProgress(); return; }
  if (state.example) { if (state.refCardOpen) renderRefCardViewer(); else if (state.ageBandOpen) renderAgeBandVitals(); else renderExample(); return; }
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
  var opening = !state.caseInfoOpen;
  if (opening) state.returnY = window.pageYOffset;
  state.caseInfoOpen = !state.caseInfoOpen;
  renderPractice();
  if (!opening) window.scrollTo(0, state.returnY || 0);
}
function renderCaseInfo(c) {
  var num = state.qIndex + 1;
  var pct = Math.round(num / state.queue.length * 100);
  var html = '<div class="card">';
  html += caseHeader(c, num, pct);
  html += '<img class="case-image" src="' + IMAGES[c.image] + '" alt="Illustration of the patient described in this case" loading="lazy">';
  html += '<p class="vignette">' + esc(c.arrival) + '</p>';
  html += '<div class="cta-row"><button class="btn btn-primary" onclick="toggleCaseInfo()">Back to assessment</button></div>';
  html += '</div>';
  appEl.innerHTML = html;
}
function miniImageRow(c, showAgeBand, hideCaseInfoBtn) {
  return '<div class="mini-header flex items-center gap-3 mb-4">' +
    '<img class="case-image-mini" src="' + FACE_IMAGES[c.image] + '" alt="Portrait of the patient described in this case" loading="lazy">' +
    '<div class="case-info-row flex flex-wrap justify-end gap-2 ml-auto">' +
    (showAgeBand && AGE_BAND_VITALS.length ? '<button class="case-info-btn" onclick="openAgeBandVitals()">Age-band vitals</button>' : '') +
    (hideCaseInfoBtn ? '' : '<button class="case-info-btn" onclick="toggleCaseInfo()">Case info</button>') +
    '</div>' +
    '</div>';
}
var REF_CARD_META = {
  adult: { label: "Adult IITT card (age \u226512)", url: PDF_REFS.adult },
  pediatric: { label: "Paediatric IITT card (age <12)", url: PDF_REFS.pediatric },
  reference: { label: "Reference card (trauma, burns & other high-risk criteria)", url: PDF_REFS.reference }
};
function openRefCard(key) {
  state.returnY = window.pageYOffset;
  state.refCardOpen = key;
  state.refZoomed = false;
  renderPractice();
}
function closeRefCard() {
  state.refCardOpen = null;
  state.refZoomed = false;
  renderPractice();
  window.scrollTo(0, state.returnY || 0);
}
function toggleRefZoom() {
  state.refZoomed = !state.refZoomed;
  renderRefCardViewer();
}
function renderRefCardViewer() {
  var meta = REF_CARD_META[state.refCardOpen];
  var html = '<div class="card ref-viewer-card">';
  html += '<button type="button" class="back-link" onclick="closeRefCard()">\u2190 Back to case</button>';
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
  state.returnY = window.pageYOffset;
  state.ageBandOpen = true;
  renderPractice();
}
function closeAgeBandVitals() {
  state.ageBandOpen = false;
  renderPractice();
  window.scrollTo(0, state.returnY || 0);
}
function renderAgeBandVitals() {
  var html = '<div class="card">';
  html += '<button type="button" class="back-link" onclick="closeAgeBandVitals()">← Back</button>';
  html += '<h3 class="case-title">Paediatric age-band vital sign thresholds</h3>';
  html += '<p class="ref-viewer-hint">High-risk heart rate and respiratory rate ranges by age band, as used in this case set.</p>';
  html += '<table class="pop-table age-table"><thead><tr><th>Age band</th><th>Heart rate</th><th>Respiratory rate</th></tr></thead><tbody>';
  function bandKey(b) { return /</.test(b.band) ? 0 : parseInt(String(b.band).replace(/\D*(\d+).*/, '$1'), 10) || 0; }
  AGE_BAND_VITALS.slice().sort(function (x, y) { return bandKey(x) - bandKey(y); }).forEach(function (b) {
    html += '<tr><td>' + esc(b.band) + '</td><td>' + esc(b.hr) + '</td><td>' + esc(b.rr) + '</td></tr>';
  });
  html += '</tbody></table>';
  html += '<p class="reading" style="font-size:14px; color:var(--ink-soft); line-height:1.5; margin-top:10px;">Values shown outside these ranges meet high-risk vital sign criteria. For the complete official table (all age bands), use the Paediatric IITT reference card.</p>';
  html += '<div class="ref-links" style="margin-top:12px;"><button type="button" class="ref-link" onclick="openRefCard(\'pediatric\')">Paediatric IITT card (age &lt;12)</button></div>';
  html += '<div class="cta-row"><button class="btn btn-primary" onclick="closeAgeBandVitals()">Back to assessment</button></div>';
  html += '</div>';
  appEl.innerHTML = html;
}
function renderReferenceLinks(compact) {
  if (compact) {
    return '<details class="ref-compact"><summary>Reference cards</summary><div class="ref-links">' +
      '<button type="button" class="ref-link" onclick="openRefCard(\'adult\')">Adult IITT card (age \u226512)</button>' +
      '<button type="button" class="ref-link" onclick="openRefCard(\'pediatric\')">Paediatric IITT card (age &lt;12)</button>' +
      '<button type="button" class="ref-link" onclick="openRefCard(\'reference\')">Reference card (trauma, burns &amp; other high-risk criteria)</button>' +
      '</div></details>';
  }
  return '<div class="ref-panel ref-open">' +
    '<div class="ref-summary">Reference cards (use them as you work)</div>' +
    '<div class="ref-links">' +
    '<button type="button" class="ref-link" onclick="openRefCard(\'adult\')">Adult IITT card (age \u226512)</button>' +
    '<button type="button" class="ref-link" onclick="openRefCard(\'pediatric\')">Paediatric IITT card (age &lt;12)</button>' +
    '<button type="button" class="ref-link" onclick="openRefCard(\'reference\')">Reference card (trauma, burns &amp; other high-risk criteria)</button>' +
    '</div></div>';
}

function introCard() {
  if (safeGet(STORE_INTRO, false)) return '';
  return '<div class="card intro-card"><h3>How this works</h3>' +
    '<p class="reading">The IITT card is always available. You are practising using it, not memorising it.</p>' +
    '<button type="button" class="btn btn-ghost" onclick="dismissIntro()">Got it</button></div>';
}
function dismissIntro() { safeSet(STORE_INTRO, true); renderPracticeHome(); markScreen(); }
function renderPracticeHome() {
  var name = getLearnerName();
  appEl.innerHTML =
    (name ? '<div class="learner-bar"><span>Practising as <b>' + esc(name) + '</b></span><button type="button" class="learner-bar-link" onclick="openResetConfirm()">Switch user</button></div>' : '') +
    '<div class="card empty-hero" style="padding-bottom:6px;">' +
    '<img class="hero-image" src="ui-hero.jpg" alt="Nurse registering a patient at a triage desk">' +
    '<h2 class="section-title">Interagency Integrated Triage Tool Practice Companion</h2>' +
    '<p>Choose how you want to practice.</p>' +
    '</div>' +
    introCard() +
    '<div class="card mode-card">' +
    '<h3 class="mode-card-title"><img class="mode-card-icon" src="' + MODE_ICONS.example + '" alt=""> Worked Example</h3>' +
    '<p>Pick a case and watch the triage process applied. At each part you will see the criteria on the IITT card and the relevant patient findings. The findings then decide the triage category.</p>' +
    exampleListHtml() +
    '</div>' +
    '<div class="card mode-card">' +
    '<h3 class="mode-card-title"><img class="mode-card-icon" src="' + MODE_ICONS.guided + '" alt=""> Guided Triage Practice</h3>' +
    '<p>For each part of the IITT card, you will be given the relevant patient findings and answer one question: &ldquo;Is a criterion in this part met?&rdquo; Working through the parts will help you choose a triage category.</p>' +
    '<button class="btn btn-primary" onclick="startPractice(\'walkthrough\')">Start</button>' +
    '</div>' +
    '<div class="card mode-card">' +
    '<h3 class="mode-card-title"><img class="mode-card-icon" src="' + MODE_ICONS.triage + '" alt=""> Triage Practice</h3>' +
    '<p>You choose which parts of the IITT card to check and when to stop. Each part you check gives you the relevant patient findings. Then you choose a triage category and the part that decided it.</p>' +
    '<button class="btn btn-primary" onclick="startPractice(\'decide\')">Start</button>' +
    '</div>' +
    '<div class="card count-card" role="group" aria-labelledby="count-label">' +
    '<div id="count-label" class="count-label">Cases to practice</div>' +
    '<div class="count-stepper">' +
    '<button type="button" class="count-btn" aria-label="Fewer cases" onclick="changeCaseCount(-1)"' + (getCaseCount() <= 1 ? ' disabled' : '') + '>\u2212</button>' +
    '<output class="count-value" aria-live="polite">' + getCaseCount() + '</output>' +
    '<button type="button" class="count-btn" aria-label="More cases" onclick="changeCaseCount(1)"' + (getCaseCount() >= maxCaseCount() ? ' disabled' : '') + '>+</button>' +
    '</div>' +
    '<div class="count-note">Up to ' + maxCaseCount() + '. Cases are picked at random.</div>' +
    '</div>' +
    '<div class="restart-row" style="margin-top:2px;"><button class="btn btn-ghost" onclick="openProgress()">My progress</button></div>' +
    '<details class="about-box"><summary>About</summary>' +
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
    html += '<div class="restart-row"><button class="btn btn-ghost" onclick="openResetConfirm()">Reset for new user</button></div>';
    html += '</div>';
    appEl.innerHTML = html;
    return;
  }

  html += '<p class="section-sub">Based on ' + all.length + ' case' + (all.length === 1 ? "" : "s") + ' completed on this device, across all sessions.</p>';

  var totalCorrect = all.filter(function (r) { return r.response_classification === "correct"; }).length;
  var totalUnsupported = all.filter(function (r) { return r.response_classification === "correct_unsupported"; }).length;
  var totalWrongReason = all.filter(function (r) { return r.response_classification === "correct_wrong_reason"; }).length;
  var totalIncorrect = all.filter(isIncorrect).length;

  html += '<div class="summary-stat-grid' + ((totalUnsupported || totalWrongReason) ? ' summary-stat-grid-4' : '') + '">';
  html += '<div class="summary-stat correct"><div class="s-num">' + totalCorrect + '</div><div class="s-label">Correct</div></div>';
  if (totalUnsupported) html += '<div class="summary-stat unsupported"><div class="s-num">' + totalUnsupported + '</div><div class="s-label">Not enough checked</div></div>';
  if (totalWrongReason) html += '<div class="summary-stat unsupported"><div class="s-num">' + totalWrongReason + '</div><div class="s-label">Wrong reason</div></div>';
  html += '<div class="summary-stat incorrect"><div class="s-num">' + totalIncorrect + '</div><div class="s-label">Incorrect</div></div>';
  html += '</div>';
  html += directionNote(all);
  html += confidenceNote(all);

  function bucketForMode(mode) {
    var subset = all.filter(function (r) { return r.practice_mode === mode; });
    return {
      n: subset.length,
      correct: subset.filter(function (r) { return r.response_classification === "correct"; }).length,
      unsupported: subset.filter(function (r) { return r.response_classification === "correct_unsupported"; }).length,
      wrongReason: subset.filter(function (r) { return r.response_classification === "correct_wrong_reason"; }).length,
      incorrect: subset.filter(isIncorrect).length
    };
  }
  var walkB = bucketForMode("walkthrough");
  var decideB = bucketForMode("decide");
  if (walkB.n || decideB.n) {
    html += '<table class="pop-table"><thead><tr><th>Mode</th><th>Cases</th><th>Correct</th>' + partialHead(totalUnsupported, totalWrongReason) + '<th>Incorrect</th></tr></thead><tbody>';
    if (walkB.n) html += '<tr><td>Guided triage practice</td><td>' + walkB.n + '</td><td>' + walkB.correct + '</td>' + partialCells(walkB, totalUnsupported, totalWrongReason) + '<td>' + walkB.incorrect + '</td></tr>';
    if (decideB.n) html += '<tr><td>Triage practice</td><td>' + decideB.n + '</td><td>' + decideB.correct + '</td>' + partialCells(decideB, totalUnsupported, totalWrongReason) + '<td>' + decideB.incorrect + '</td></tr>';
    html += '</tbody></table>';
  }

  html += partialNote(totalUnsupported, totalWrongReason);
  html += processSummary(all);

  /* Which parts of the card decide the cases this learner gets right or wrong. */
  var parts = {};
  all.forEach(function (r) {
    var g = r.deciding_group;
    if (!g || !GROUP_META[g]) return;
    var e = parts[g] || (parts[g] = { n: 0, right: 0, skipped: 0 });
    e.n += 1;
    if (r.response_classification === "correct") e.right += 1;
    if (r.deciding_group_checked === false) e.skipped += 1;
  });
  var partKeys = Object.keys(parts).sort(function (x, y) {
    var ax = parts[x].right / parts[x].n, ay = parts[y].right / parts[y].n;
    return ax - ay || parts[y].n - parts[x].n;
  });
  if (partKeys.length) {
    html += '<h3 class="case-review-title">Parts of the card to practise</h3>';
    html += '<p class="section-sub">The part of the card that decided each case, with the lowest scores first.</p><div class="case-review">';
    partKeys.forEach(function (g, i) {
      var e = parts[g];
      html += '<div class="part-row"><span class="part-name">' + esc(GROUP_META[g].label) + ' <span class="part-level">(' + esc(GROUP_META[g].level) + ')</span>' + (i === 0 && e.right < e.n ? '<span class="part-next">Practise next</span>' : '') + '</span>' +
        '<span class="part-score">' + e.right + ' of ' + e.n + ' correct' + (e.skipped ? ', not opened in ' + e.skipped : '') + '</span></div>';
    });
    html += '</div>';
  }

  var recent = all.slice().sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); }).slice(0, 8);
  html += '<h3 class="case-review-title">Recent cases</h3>';
  html += '<div class="recent-list">';
  recent.forEach(function (r) {
    var c = caseById(r.case_id);
    var title = c ? ((c.population === "adult" ? "Adult" : "Paediatric") + ", " + c.age) : r.case_id;
    var resultLabel = outcomeLabel(r.response_classification);
    var resultColor = "var(--ink)";
    html += '<div class="recent-row"><span class="recent-title">' + esc(title) + '</span><span class="recent-badge" style="color:' + resultColor + '">' + resultLabel + '</span></div>';
  });
  html += '</div>';

  html += '<div class="restart-row" style="margin-top:18px;"><button class="btn btn-primary" onclick="closeProgress()">Back to practice</button></div>';
  html += '<div class="restart-row"><button class="btn btn-ghost" onclick="openResetConfirm()">Reset for new user</button></div>';
  html += '</div>';
  appEl.innerHTML = html;
}

function caseHeader(c, num, pct) {
  var popLabel = c.population === "adult" ? "Adult" : "Paediatric";
  var html = '<div class="progress-row"><span class="progress-label">Case ' + num + ' of ' + state.queue.length + '</span><span class="pop-badge">' + popLabel + ', ' + esc(c.age) + '</span></div>';
  var fromPct = Math.max(0, Math.round((num - 1) / state.queue.length * 100));
  html += '<div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><div class="progress-fill" style="--to:' + (pct / 100) + ';--from:' + (fromPct / 100) + '"></div></div>';
  
  return html;
}

function endSessionRow() {
  return '<div class="end-session-row"><button type="button" class="end-session-link" onclick="openEndSessionConfirm()">End session and see report</button></div>';
}
function renderArrival(c) {
  if (c.checkpoints && c.checkpoints.length) preloadCrit(c, c.checkpoints[0].g);
  var num = state.qIndex + 1;
  var pct = Math.round((num - 1) / state.queue.length * 100);
  var html = '<div class="card">';
  html += caseHeader(c, num, pct);
  html += '<img class="case-image" src="' + IMAGES[c.image] + '" alt="Illustration of the patient described in this case" loading="lazy">';
  html += '<p class="vignette">' + esc(c.arrival) + '</p>';
  html += '<div class="cta-row"><button class="btn btn-primary" onclick="beginAssessment()">Begin assessment</button></div>';
  html += endSessionRow();
  html += '</div>';
  appEl.innerHTML = html;
}
/* ---- Worked example ----
   An unscored walkthrough of one case, built only from the case's own findings,
   checkpoints, criteria and explanation. Step 0 is the arrival, steps 1..n are the
   checkpoints, and the last step is the decision. */
/* Every case is offered as a worked example, labelled with its overview only (the case title), so the label never gives away the answer. */
var exampleOpen = {};
function exampleListHtml() {
  var seen = safeGet(STORE_EX_SEEN, []);
  function btn(c) {
    var done = seen.indexOf(c.id) !== -1;
    return '<button type="button" class="example-btn" onclick="startExample(\'' + c.id + '\')"><span class="example-title">' + esc(c.title) + '</span>' + (done ? '<span class="example-seen">Watched</span>' : '') + '</button>';
  }
  var html = '';
  [["adult", "Adult cases"], ["pediatric", "Paediatric cases"]].forEach(function (g) {
    var list = CASES.filter(function (c) { return c.population === g[0]; });
    if (!list.length) return;
    var n = list.filter(function (c) { return seen.indexOf(c.id) !== -1; }).length;
    html += '<details class="example-group"' + (exampleOpen[g[0]] ? ' open' : '') + ' ontoggle="exampleOpen[\'' + g[0] + '\']=this.open"><summary>' + g[1] + ' <span class="example-count">(' + (n ? n + ' of ' + list.length + ' watched' : list.length) + ')</span></summary><div class="example-group-body">' + list.map(btn).join('') + '</div></details>';
  });
  return '<div class="example-list">' + html + '</div>';
}
function startExample(id) {
  if (!caseById(id)) return;
  state.example = { id: id, step: 0 };
  logEvent("example_started", { practice_mode: "example", case_id: id });
  renderPractice();
}
function exampleStep(delta) {
  if (!state.example) return;
  var c = caseById(state.example.id);
  var last = c.checkpoints.length + 1;
  state.example.step = Math.max(0, Math.min(last, state.example.step + delta));
  if (state.example.step === last) {
    logEvent("example_completed", { practice_mode: "example", case_id: c.id });
    var seen = safeGet(STORE_EX_SEEN, []);
    if (seen.indexOf(c.id) === -1) { seen.push(c.id); safeSet(STORE_EX_SEEN, seen); }
  }
  renderPractice();
}
function leaveExample() { state.example = null; renderPractice(); }
function exampleThenGuided() { state.example = null; startPractice("walkthrough"); }
function renderExample() {
  var c = caseById(state.example.id);
  var n = c.checkpoints.length;
  var step = state.example.step;
  if (c.checkpoints[step]) preloadCrit(c, c.checkpoints[step].g);
  var popLabel = c.population === "adult" ? "Adult" : "Paediatric";
  var html = '<div class="card">';
  html += '<div class="progress-row"><span class="progress-label">Worked example</span><span class="pop-badge">' + popLabel + ', ' + esc(c.age) + '</span></div>';
  var pct = Math.round(step / (n + 1) * 100);
  html += '<div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><div class="progress-fill" style="--to:' + (pct / 100) + ';--from:' + (pct / 100) + '"></div></div>';

  if (step === 0) {
    html += '<img class="case-image" src="' + IMAGES[c.image] + '" alt="Illustration of the patient described in this case" loading="lazy">';
    html += '<p class="vignette">' + esc(c.arrival) + '</p>';
    html += '<div class="reassess-note how-you-worked"><h4>What you will see</h4><ul>' +
      '<li>The card is worked in order: red criteria, then yellow, then high-risk vital signs.</li>' +
      '<li>At each part, you see what is found for this patient and what the card lists.</li>' +
      '<li>You stop at the first part where a criterion is met. If none are met, you check every part.</li></ul></div>';
    html += '<div class="cta-row"><button class="btn btn-primary" onclick="exampleStep(1)">Show the first part</button></div>';
  } else if (step <= n) {
    var cp = c.checkpoints[step - 1];
    var meta = GROUP_META[cp.g];
    var find = (c.findings || {})[cp.g];
    var chips = find ? find.chips : cp.chips;
    var met = cp.correct === "yes";
    var say = 'Part ' + step + ' of ' + n + ': ' + levelWord(meta, cp.g) + meta.label + '. ' + (met ? 'A criterion is met here.' : 'No criterion met here.');
    html += '<div data-announce="' + esc(say) + '">';
    html += miniImageRow(c, true, true);
    html += '<div class="stage-tag">Part ' + step + ' of ' + n + '</div>';
    html += renderReferenceLinks(step > 1);
    if (step > 1) {
      var rows = [];
      for (var i = 0; i < step - 1; i++) {
        var mi = GROUP_META[c.checkpoints[i].g];
        rows.push({ fold: true, html: '<div class="cp-trail-item right"><span class="cp-trail-icon">\u2713</span><span class="cp-trail-label">' + esc(levelWord(mi, c.checkpoints[i].g) + mi.label) + '</span><span class="cp-trail-answer">None met</span></div>' });
      }
      html += '<div class="cp-trail">' + trailHtml({ items: rows, noWord: 'none met' }) + '</div>';
    }
    html += '<div class="cp-current"><div class="cp-group-label ' + meta.level + '">' + esc(levelWord(meta, cp.g) + meta.label) + '</div>';
    if (chips || (find && find.text)) html += '<div class="cp-find-label">What you found</div>';
    if (chips) {
      html += '<div class="vitals-grid">';
      Object.keys(chips).forEach(function (k) { html += '<div class="vital"><div class="v-label">' + esc(k) + '</div><div class="v-value">' + vitalValue(chips[k]) + '</div></div>'; });
      html += '</div>';
    }
    if (find && find.text) html += findingList(find.text, "cp-find-text");
    html += critBlock(c, cp.g, meta);
    if (cp.g === "vitals" && c.ageBandRef) {
      html += '<div class="age-ref">High-risk thresholds for <b>' + esc(c.ageBandRef.band) + '</b>: heart rate outside <b>' + esc(c.ageBandRef.hr) + '</b>, respiratory rate outside <b>' + esc(c.ageBandRef.rr) + '</b>.</div>';
    }
    if (met) {
      html += '<div class="cp-feedback right"><div class="cp-feedback-title">A criterion is met here</div><div class="cp-feedback-body">' + esc(c.keyCriterion) + '. You can stop. Nothing further on the card needs checking.</div></div>';
    } else {
      html += '<div class="cp-feedback right"><div class="cp-feedback-title">No criterion met here</div><div class="cp-feedback-body">' + (step === n ? 'What is found does not match anything the card lists for this part. That was the last part of the card, so nothing is met.' : 'What is found does not match anything the card lists for this part, so move on to the next part.') + '</div></div>';
    }
    html += '</div>';
    html += '<div class="cta-row">' + (step > 1 ? '<button class="btn btn-ghost" onclick="exampleStep(-1)">Previous part</button>' : '') +
      '<button class="btn btn-primary" onclick="exampleStep(1)">' + (step === n ? 'See the decision' : 'Next part') + '</button></div>';
    html += '</div>';
  } else {
    var meta2 = CATEGORY_META[c.correct];
    html += miniImageRow(c, false, true);
    html += '<div class="feedback-banner correct"><div class="f-title">' + meta2.label + '</div><div class="f-sub">This is the triage category for this patient.</div></div>';
    html += '<div class="detail-section"><h4>Why</h4><p><b>' + esc(c.keyCriterion) + '.</b> ' + esc(c.feedbackWhy) + '</p></div>';
    /* Case-specific lines live in the case file (exampleShows). The generic outcome lines are only a fallback for a case without them. */
    var shows = (c.exampleShows && c.exampleShows.length) ? c.exampleShows.slice() : [];
    if (!shows.length) {
      if (c.correct === "green") shows.push('Green is only reached after every part of the card has been checked and nothing is met.');
      else if (c.correct === "uptriage") shows.push('High-risk vital signs come last. They matter even when no red or yellow criterion is met.');
      else shows.push('You stop at the first part where a criterion is met.');
    }
    html += '<div class="reassess-note how-you-worked"><h4>What this example shows</h4><ul>' + shows.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
    html += '<div class="cta-row cta-stack"><button class="btn btn-primary" onclick="leaveExample()">Back to home</button>' +
      '<button class="btn btn-ghost" onclick="exampleThenGuided()">Try Guided Triage Practice</button>' +
      '<button class="btn btn-ghost" onclick="exampleStep(-1)">Previous part</button></div>';
  }
  if (step <= n) html += '<div class="end-session-row"><button type="button" class="end-session-link" onclick="leaveExample()">Leave the example</button></div>';
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

/* A vital sign value with its unit in a lighter weight, kept on one line: "18" then "breaths/min". */
function vitalValue(v) {
  var m = String(v).match(/^(\S+)\s+(\S+)$/);
  return m ? '<span class="v-nw">' + esc(m[1]) + ' <span class="v-unit">' + esc(m[2]) + '</span></span>' : esc(v);
}
/* The criteria for one part of the card, shown as the card's own picture (cropped from the official IITT card),
   with the typed list as the screen-reader text and as a fallback if the picture does not load. */
var CRIT_SIZES = {"adult-airway_red":[769,122],"adult-airway_yellow":[779,182],"adult-circulation_red":[769,181],"adult-circulation_yellow":[779,223],"adult-disability_red":[769,218],"adult-disability_yellow":[779,223],"adult-other_red":[769,596],"adult-other_yellow":[779,501],"adult-unresponsive":[769,71],"adult-vitals":[539,550],"pediatric-airway_red":[769,139],"pediatric-airway_yellow":[779,182],"pediatric-circulation_red":[769,353],"pediatric-circulation_yellow":[779,223],"pediatric-disability_red":[769,223],"pediatric-disability_yellow":[779,137],"pediatric-other_red":[769,407],"pediatric-other_yellow":[779,596],"pediatric-unresponsive":[769,71],"pediatric-vitals":[539,598]};
function preloadCrit(c, g) {
  if (!c || !g || !CRIT_SIZES[c.population + "-" + g]) return;
  try { var im = new Image(); im.src = "crit-" + c.population + "-" + g + ".png"; } catch (e) {}
}
function critBlock(c, g, meta) {
  var list = CRITERIA[c.population][g] || [];
  if (!list.length && !CRIT_SIZES[c.population + "-" + g]) return "";
  var src = "crit-" + c.population + "-" + g + ".png";
  var alt = "IITT card, " + meta.label + (meta.level === "vitals" ? "" : " (" + meta.level + ")") + (list && list.length ? ": " + list.join("; ") : "");
  var tiny = CRIT_SIZES[c.population + "-" + g] && CRIT_SIZES[c.population + "-" + g][1] < 100;
  return '<div class="criteria-open crit-img-block"><div class="cp-why-title">The IITT card, for ' + esc(meta.label) + ':</div>' +
    '<' + (tiny ? 'div class="crit-img-btn crit-static"' : 'button type="button" class="crit-img-btn" onclick="this.classList.toggle(\'zoomed\')"') + '>' +
    '<img class="crit-img" src="' + src + '"' + (CRIT_SIZES[c.population + "-" + g] ? ' width="' + CRIT_SIZES[c.population + "-" + g][0] + '" height="' + CRIT_SIZES[c.population + "-" + g][1] + '"' : '') + ' alt="' + esc(alt) + '" onerror="this.parentNode.parentNode.classList.add(\'crit-fail\')"></' + (tiny ? 'div' : 'button') + '>' +
    (tiny ? '' : '<div class="crit-hint"><button type="button" class="crit-act" onclick="this.parentNode.parentNode.querySelector(\'.crit-img-btn\').classList.toggle(\'zoomed\')">Enlarge or shrink picture</button>' +
    (list.length ? '<button type="button" class="crit-act" onclick="this.parentNode.parentNode.classList.toggle(\'show-text\')">Show or hide as text list</button>' : '') + '</div>') +
    '<ul class="criteria-list crit-fallback">' + list.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
}
function levelWord(meta, g) {
  if (meta.level === "vitals") return "";
  return meta.level === "red" ? "Red: " : meta.level === "yellow" ? "Yellow: " : "";
}
/* Rows of answered parts. Runs of three or more routine "No" rows fold into one line so the step being worked on stays near the top; a "Yes" or a wrong answer always stays in view, and the order is never changed. */
function trailHtml(rows) {
  var html = "", run = [];
  function flush() {
    if (run.length >= 3) html += '<details class="cp-trail-fold"><summary>' + run.length + ' earlier parts checked, ' + (rows.noWord || 'all No') + '</summary>' + run.join('') + '</details>';
    else html += run.join('');
    run = [];
  }
  rows.items.forEach(function (it) { if (it.fold) run.push(it.html); else { flush(); html += it.html; } });
  flush();
  return html;
}
function renderCheckpointTrail(c) {
  if (!state.cpLog.length) return "";
  var items = [];
  state.cpLog.forEach(function (log) {
    var meta = GROUP_META[log.g];
    if (isFreeMode()) {
      items.push({ fold: false, html: '<div class="cp-trail-item right"><span class="cp-trail-icon">\u2713</span><span class="cp-trail-label">' + esc(levelWord(meta, log.g) + meta.label) + '</span><span class="cp-trail-answer">Checked</span></div>' });
    } else {
      var icon2 = log.isRight ? "\u2713" : "\u2717";
      items.push({ fold: log.isRight && log.selected !== "yes", html: '<div class="cp-trail-item ' + (log.isRight ? "right" : "wrong") + (log.selected === "yes" ? " yes" : "") + '">' +
        '<span class="cp-trail-icon">' + icon2 + '</span><span class="cp-trail-label">' + esc(levelWord(meta, log.g) + meta.label) + '</span><span class="cp-trail-answer">' + (log.selected === "yes" ? "Yes" : "No") + '</span></div>' });
    }
  });
  return '<div class="cp-trail">' + trailHtml({ items: items }) + '</div>';
}

function renderCheckpoint(c) {
  var num = state.qIndex + 1;
  var cp = c.checkpoints[state.cpIndex];
  if (c.checkpoints[state.cpIndex + 1]) preloadCrit(c, c.checkpoints[state.cpIndex + 1].g);
  var meta = GROUP_META[cp.g];
  var critList = CRITERIA[c.population][cp.g];
  var stepPct = Math.round((num - 1) / state.queue.length * 100 + (1 / state.queue.length) * ((state.cpIndex + (state.cpLocked ? 1 : 0.5)) / c.checkpoints.length) * 100);

  var html = '<div class="card">';
  html += caseHeader(c, num, stepPct);
  html += miniImageRow(c, true);
  html += renderReferenceLinks(state.cpIndex > 0);

  html += renderCheckpointTrail(c);

  html += '<div class="cp-current"' + (state.cpLocked ? '' : ' data-announce="' + esc('Part ' + (state.cpIndex + 1) + ' of ' + c.checkpoints.length + ': ' + levelWord(meta, cp.g) + meta.label + '. ' + meta.question) + '"') + '>';
  html += '<div class="cp-group-label ' + meta.level + '">' + esc(levelWord(meta, cp.g) + meta.label) + '</div>';

  /* Show what the learner would find at this step. These are the same
     findings Triage Practice shows when a card section is opened, so both
     modes share one case stem. Older cases without findings fall back to the
     checkpoint's own values. */
  var stepFind = (c.findings || {})[cp.g];
  var stepChips = stepFind ? stepFind.chips : cp.chips;
  if (stepChips || (stepFind && stepFind.text)) html += '<div class="cp-find-label">What you found</div>';
  if (stepChips) {
    html += '<div class="vitals-grid">';
    Object.keys(stepChips).forEach(function (k) {
      html += '<div class="vital"><div class="v-label">' + esc(k) + '</div><div class="v-value">' + vitalValue(stepChips[k]) + '</div></div>';
    });
    html += '</div>';
  }
  if (stepFind && stepFind.text) html += findingList(stepFind.text, "cp-find-text");
  /* The card's criteria are shown up front, as the card's own picture: the skill is applying the card, not recalling it. */
  html += critBlock(c, cp.g, meta);
  if (cp.g === "vitals" && c.ageBandRef) {
    html += '<div class="age-ref">High-risk thresholds for <b>' + esc(c.ageBandRef.band) + '</b>: heart rate outside <b>' + esc(c.ageBandRef.hr) + '</b>, respiratory rate outside <b>' + esc(c.ageBandRef.rr) + '</b>.</div>';
  }

  html += '<div class="decision-prompt" id="cp-question" style="margin-top:16px;">' + esc(meta.question) + '</div>';
  html += '<div class="yesno-grid" role="group" aria-labelledby="cp-question">';
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
      '<div class="cp-feedback-body">Answer: <b>' + (cp.correct === "yes" ? "Yes" : "No") + '.</b></div>' +
      '</div>';
    html += '<div class="submit-row"><button class="btn btn-primary" onclick="advanceCheckpoint()">Continue</button></div>';
  }

  html += '</div>' + endSessionRow() + '</div>';
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
  revealFeedback();
}
/* After Confirm the verdict and the Continue button are brought into view, and focus moves to the verdict so a screen reader reads it first. */
function revealFeedback() {
  var fb = appEl.querySelector(".cp-feedback");
  if (!fb) return;
  fb.setAttribute("tabindex", "-1");
  fb.focus({ preventScroll: true });
  var btn = appEl.querySelector(".submit-row .btn") || fb;
  var over = btn.getBoundingClientRect().bottom - window.innerHeight + 16;
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (over > 0) window.scrollTo({ top: window.pageYOffset + over, behavior: calm ? "auto" : "smooth" });
  var live = document.getElementById("sr-live");
  if (live) live.textContent = (fb.innerText || "").replace(/\s+/g, " ").trim();
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

/* ---- "Triage practice" ----
   The learner works through the IITT card in any order. Tapping a section of
   the card shows the findings recorded for this case (neutral observations,
   never a yes/no verdict). Checking is never penalised, and a triage category
   can be chosen at any time. */
/* The order the IITT is worked in: red, then yellow, then high-risk vital signs. */
function canonicalGroups() {
  return TIERS.reduce(function (list, t) { return list.concat(groupsInTier(t.level)); }, []);
}
function readyToSubmit() {
  return !!(state.selected && state.confidence && (!state.checked.length || state.reason));
}
function selectReason(g) {
  if (state.locked) return;
  state.reason = g;
  renderKeepingScroll();
}
var TIERS = [
  { level: "red",    title: "Red criteria",           all: "Check all red" },
  { level: "yellow", title: "Yellow criteria",        all: "Check all yellow" },
  { level: "vitals", title: "High-risk vital signs",  all: "" }
];
function groupsInTier(level) {
  return Object.keys(GROUP_META).filter(function (g) { return GROUP_META[g].level === level; });
}
function isChecked(g) {
  return state.checked.some(function (e) { return e.g === g; });
}
/* The card section whose finding decides the case (the first "yes"). A green
   case has none: nothing on the card applies. */
function decidingGroup(c) {
  for (var i = 0; i < c.checkpoints.length; i++) if (c.checkpoints[i].correct === "yes") return c.checkpoints[i].g;
  return null;
}
/* A finding is written as short sentences; show each one as its own bullet. */
function findingList(text, cls) {
  var parts = String(text).split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map(function (t) { return t.trim(); }).filter(Boolean);
  return '<ul class="finding-list' + (cls ? ' ' + cls : '') + '">' + parts.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
}
function renderFindings(c, g) {
  var f = (c.findings || {})[g];
  var html = '<div class="tp-find">';
  if (!f) {
    html += '<p class="tp-none">No additional findings recorded for this case.</p>';
  } else {
    if (f.chips) {
      html += '<div class="vitals-grid">';
      Object.keys(f.chips).forEach(function (k) {
        html += '<div class="vital"><div class="v-label">' + esc(k) + '</div><div class="v-value">' + vitalValue(f.chips[k]) + '</div></div>';
      });
      html += '</div>';
    }
    if (f.text) html += findingList(f.text, "");
  }
  if (g === "vitals" && c.ageBandRef) {
    html += '<div class="age-ref">High-risk thresholds for <b>' + esc(c.ageBandRef.band) + '</b>: heart rate outside <b>' + esc(c.ageBandRef.hr) + '</b>, respiratory rate outside <b>' + esc(c.ageBandRef.rr) + '</b>.</div>';
  }
  html += '</div>';
  return html;
}

function renderTiers(c) {
  var html = "";
  TIERS.forEach(function (t) {
    var groups = groupsInTier(t.level);
    var nDone = groups.filter(isChecked).length;
    html += '<div class="tp-tier tp-' + t.level + '"><div class="tp-tier-head"><h4>' + t.title + ' <span class="tp-count">' + nDone + ' of ' + groups.length + ' checked</span></h4>';
    html += '</div>';
    groups.forEach(function (g) {
      var open = isChecked(g) && !(state.collapsed && state.collapsed[g]);
      var wasChecked = isChecked(g);
      var enter = open && justOpened[g] ? ' enter' : '';
      html += '<div class="tp-sec' + (open ? ' open' : '') + (wasChecked && !open ? ' done' : '') + enter + '">' +
        '<button type="button" class="tp-sec-btn' + (wasChecked && !open ? ' tp-collapsed' : '') + '" aria-expanded="' + open + '" onclick="checkItem(\'' + g + '\')">' +
        '<span>' + esc(GROUP_META[g].label) + '</span><span class="tp-state">' + (open || wasChecked ? '✓ Checked' : 'Tap to check') + '</span></button>' +
        (open ? renderFindings(c, g) : '') + '</div>';
    });
    html += '</div>';
  });
  justOpened = {};
  return html;
}
function renderReady(c) {
  var num = state.qIndex + 1;
  var pct = Math.round((num - 1) / state.queue.length * 100);
  var html = '<div class="card">';
  html += caseHeader(c, num, pct);
  html += miniImageRow(c, true, true);
  html += '<p class="vignette">' + esc(c.arrival) + '</p>';
  html += '<div class="divider"></div>';
  html += '<div class="stage-tag">Work through the card</div>';
  html += renderReferenceLinks();
  html += '<p class="tp-howto">Work through the card in order: red, then yellow, then high-risk vital signs. Tap a part to see what you find. Stop and decide as soon as you have enough information.</p>';

  html += renderTiers(c);

  html += '<div class="tp-jump"><span class="tp-jump-count">' + state.checked.length + ' of ' + Object.keys(GROUP_META).length + ' checked</span><button type="button" class="btn btn-primary btn-sm" onclick="jumpToPick()">Choose triage category</button></div>';
  html += '<div class="tp-pick" id="tp-pick"><h4>Your triage category</h4><div class="decision-grid">';
  ["red", "yellow", "green", "uptriage"].forEach(function (k) {
    var m = CATEGORY_META[k];
    var sel = state.selected === k ? " selected" : "";
    html += '<button class="decision-btn ' + k + sel + '" onclick="selectAnswer(\'' + k + '\')" aria-pressed="' + (state.selected === k) + '">' +
      '<span class="d-label">' + m.label + '</span></button>';
  });
  html += '</div>';
  html += '<h4 class="tp-conf-title">How sure are you?</h4><div class="tp-conf" role="group" aria-label="How sure are you?">';
  CONFIDENCE.forEach(function (o) {
    var on = state.confidence === o.k;
    html += '<button type="button" class="tp-conf-btn' + (on ? ' selected' : '') + '" aria-pressed="' + on + '" onclick="selectConfidence(\'' + o.k + '\')">' + o.label + '</button>';
  });
  html += '</div>';
  if (state.checked.length) {
    html += '<h4 class="tp-conf-title">Which part of the card decided it?</h4><div class="reason-list" role="group" aria-label="Which part of the card decided it?">';
    canonicalGroups().filter(isChecked).forEach(function (g) {
      html += '<button type="button" class="reason-btn' + (state.reason === g ? ' selected' : '') + '" aria-pressed="' + (state.reason === g) + '" onclick="selectReason(\'' + g + '\')">' + esc(GROUP_META[g].label) + (GROUP_META[g].level === 'vitals' ? '' : ' <span class="reason-level">(' + esc(GROUP_META[g].level) + ')</span>') + '</button>';
    });
    html += '<button type="button" class="reason-btn' + (state.reason === "none" ? ' selected' : '') + '" aria-pressed="' + (state.reason === "none") + '" onclick="selectReason(\'none\')">Nothing I checked met a criterion</button></div>';
  }
  html += '<div class="submit-row"><button class="btn btn-primary" ' + (readyToSubmit() ? '' : 'disabled') + ' onclick="submitDecision()">Submit decision</button></div>';
  if (!readyToSubmit()) html += '<p class="submit-help">' + (!state.selected ? 'Choose a category, how sure you are' + (state.checked.length ? ' and which part decided it' : '') + ' to submit.' : (!state.confidence ? 'Choose how sure you are to submit.' : 'Choose which part of the card decided it to submit.')) + '</p>';
  html += '</div>';
  html += endSessionRow();
  html += '</div>';
  appEl.innerHTML = html;
}

function jumpToPick() {
  var el = document.getElementById("tp-pick");
  if (el) el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
}
var justOpened = {};
function markChecked(g) {
  if (isChecked(g)) return;
  justOpened[g] = true;
  var seq = nextGatherSeq();
  state.checked.push({ g: g, seq: seq });
  logEvent("item_checked", { group: g, seq: seq, has_findings: !!((caseById(state.queue[state.qIndex]).findings || {})[g]) });
}
function renderKeepingScroll() {
  var y = window.pageYOffset;
  renderPractice();
  window.scrollTo(0, y);
}
function checkItem(g) {
  if (isChecked(g)) {
    state.collapsed = state.collapsed || {};
    state.collapsed[g] = !state.collapsed[g];
  } else {
    markChecked(g);
  }
  renderKeepingScroll();
}
function checkTier(level) {
  groupsInTier(level).forEach(markChecked);
  renderKeepingScroll();
}

function renderDecision(c) {
  var num = state.qIndex + 1;
  var pct = Math.round(num / state.queue.length * 100 - (5 / state.queue.length));
  var html = '<div class="card">';
  html += caseHeader(c, num, pct);
  html += miniImageRow(c, true);
  html += renderCheckpointTrail(c);
  var dgD = decidingGroup(c);
  html += '<p class="decision-link">' + (dgD
    ? 'A criterion was met at <b>' + esc(partName(dgD)) + '</b>. Which category does that point to?'
    : 'No criterion was met at any part of the card. Which category does that point to?') + '</p>';
  html += '<div class="decision-prompt">Based on everything you found, what is the appropriate IITT triage category?</div>';
  html += '<div class="decision-grid">';
  ["red", "yellow", "green", "uptriage"].forEach(function (k) {
    var m = CATEGORY_META[k];
    var sel = state.selected === k ? " selected" : "";
    var dis = state.locked ? " disabled" : "";
    html += '<button class="decision-btn ' + k + sel + '" ' + dis + ' onclick="selectAnswer(\'' + k + '\')" aria-pressed="' + (state.selected === k) + '">' +
      '<span class="d-label">' + m.label + '</span></button>';
  });
  html += '</div>';
  html += '<div class="submit-row"><button class="btn btn-primary" ' + (state.selected ? '' : 'disabled') + ' onclick="submitDecision()">Submit decision</button></div>';
  html += endSessionRow();
  html += '</div>';
  appEl.innerHTML = html;
}
function selectAnswer(k) {
  if (state.locked) return;
  state.selected = k;
  renderKeepingScroll();
}
function selectConfidence(k) {
  if (state.locked) return;
  state.confidence = k;
  renderKeepingScroll();
}
function submitDecision() {
  if (!state.selected || state.locked) return;
  if (isFreeMode() && (!state.confidence || (state.checked.length && !state.reason))) return;
  state.locked = true;
  var c = caseById(state.queue[state.qIndex]);
  var cls = classify(c.correct, state.selected);
  var result = cls.result;
  var deciding = decidingGroup(c);
  var checkedGroups = state.checked.map(function (e) { return e.g; });
  /* A right category only counts as fully correct when the learner also had a basis for it. */
  if (isFreeMode() && result === "correct") {
    var reasonWrong = !!state.reason && (state.reason === "none" ? !!deciding : state.reason !== deciding);
    /* Green is only reached once every part of the card has been checked. */
    var noBasis = !checkedGroups.length || requiredParts(deciding).some(function (g) { return checkedGroups.indexOf(g) === -1; });
    if (reasonWrong) result = "correct_wrong_reason";
    else if (noBasis) result = "correct_unsupported";
  }
  var responseTimeMs = state.answerStart ? (Date.now() - state.answerStart) : null;
  var rec = {
    anonymous_session_id: getSessionId(),
    case_attempt_id: state.caseAttemptId,
    case_id: c.id,
    adult_or_pediatric: c.population,
    correct_triage_category: c.correct,
    selected_triage_category: state.selected,
    response_classification: result,
    error_direction: cls.direction,
    confidence: isFreeMode() ? state.confidence : null,
    response_time_ms: responseTimeMs,
    case_position: state.qIndex + 1,
    practice_mode: state.practiceMode,
    info_items_gathered: isFreeMode() ? checkedGroups.length : state.cpLog.length,
    info_items_available: isFreeMode() ? Object.keys(GROUP_META).length : c.checkpoints.length,
    checked_groups: isFreeMode() ? checkedGroups : null,
    reason_group: isFreeMode() ? (state.reason || null) : null,
    check_order: isFreeMode() ? checkedGroups.slice() : null,
    deciding_group: deciding,
    deciding_group_checked: isFreeMode() ? (deciding ? checkedGroups.indexOf(deciding) !== -1 : null) : null,
    timestamp: new Date().toISOString()
  };
  var facts = processFacts({ deciding_group: rec.deciding_group, reason_group: rec.reason_group, check_order: rec.check_order });
  rec.reason_correct = facts.reasonRight;
  rec.skipped_before = isFreeMode() ? facts.skipped.length : null;
  rec.under_triage = isUnderTriage(rec.selected_triage_category, c.correct);
  rec.in_order = isFreeMode() ? !facts.outOfOrder : null;
  rec.extra_checked = isFreeMode() ? facts.extra.length : null;
  addResponse(rec);
  state.results.push(rec);
  logEvent("decision_submitted", {
    selected_triage_category: state.selected,
    correct_triage_category: c.correct,
    response_classification: result,
    error_direction: cls.direction,
    confidence: rec.confidence,
    response_time_ms: responseTimeMs,
    info_items_gathered: rec.info_items_gathered,
    info_items_available: rec.info_items_available,
    checked_groups: rec.checked_groups,
    deciding_group: rec.deciding_group,
    deciding_group_checked: rec.deciding_group_checked
  });
  state.phase = "feedback";
  renderPractice();
}

function outcomeLabel(cl) {
  return cl === "correct" ? "Correct"
    : cl === "correct_unsupported" ? "Right category, not enough checked"
    : cl === "correct_wrong_reason" ? "Right category, wrong reason"
    : "Incorrect";
}
/* Parts of the card a learner needs to have checked before a category is supported:
   the deciding part and everything before it, or every part for green. */
function requiredParts(deciding) {
  var can = canonicalGroups();
  return deciding ? can.slice(0, can.indexOf(deciding) + 1) : can;
}
function partName(g) { return GROUP_META[g].label + (GROUP_META[g].level === 'vitals' ? '' : ' (' + GROUP_META[g].level + ')'); }
function nameList(arr) {
  var n = arr.map(partName);
  if (n.length <= 3) return n.join(', ');
  return n.slice(0, 3).join(', ') + ' and ' + (n.length - 3) + ' more';
}
var CATEGORY_DEST = {
  red: "Move to high acuity resuscitation area immediately",
  yellow: "Move to clinical treatment area",
  green: "Move to low acuity or waiting area",
  uptriage: "Up-triage or immediate review by supervising clinician"
};
/* Under-triage: a less urgent category than the patient needed. Urgency runs green, yellow, up-triage, red. */
function isUnderTriage(selected, correct) {
  if (!selected || selected === correct) return false;
  return URGENCY_RANK[selected] < URGENCY_RANK[correct];
}
function partialHead(u, w) { return (u ? '<th>Not enough checked</th>' : '') + (w ? '<th>Wrong reason</th>' : ''); }
function partialCells(b, u, w) { return (u ? '<td>' + b.unsupported + '</td>' : '') + (w ? '<td>' + b.wrongReason + '</td>' : ''); }
function partialNote(u, w) {
  var t = '';
  if (u) t += '<b>Right category, not enough checked</b> means you chose the correct category without checking everything the answer depends on: the part that decides it and every part before it on the card (for green, every part). ';
  if (w) t += '<b>Right category, wrong reason</b> means the category was correct but the part you named did not decide it. ';
  return t ? '<p class="partial-note">' + t + 'These are not counted as correct.</p>' : '';
}
/* How the learner worked on a case: did they name the deciding part, work in order, and stop in time. */
function processFacts(rec) {
  var canon = canonicalGroups();
  var d = rec.deciding_group;
  var checked = rec.check_order || [];
  var reasonRight = rec.reason_group ? (rec.reason_group === "none" ? !d : rec.reason_group === d) : null;
  var outOfOrder = null;
  for (var i = 1; i < checked.length && !outOfOrder; i++) {
    if (canon.indexOf(checked[i]) < canon.indexOf(checked[i - 1])) outOfOrder = [checked[i - 1], checked[i]];
  }
  var extra = d ? checked.filter(function (g) { return canon.indexOf(g) > canon.indexOf(d); }) : [];
  var skipped = requiredParts(d).filter(function (g) { return g !== d && checked.indexOf(g) === -1; });
  return { reasonRight: reasonRight, outOfOrder: outOfOrder, extra: extra, skipped: skipped, checkedCount: checked.length };
}
/* One block summarising Triage Practice process across many cases. */
function processSummary(list) {
  var all = list.filter(function (r) { return r.practice_mode === "decide" && r.in_order !== undefined && r.in_order !== null; });
  var pts = all.filter(function (r) { return (r.check_order || []).length >= 2; });
  if (!all.length) return "";
  var withReason = all.filter(function (r) { return r.reason_correct !== null && r.reason_correct !== undefined; });
  var reasonOk = withReason.filter(function (r) { return r.reason_correct; }).length;
  var ordered = pts.filter(function (r) { return r.in_order; }).length;
  var stopCases = all.filter(function (r) { return r.deciding_group; });
  var stopped = stopCases.filter(function (r) { return r.deciding_group_checked && r.extra_checked === 0; }).length;
  var lines = [];
  if (withReason.length) lines.push('You named the part that decided the case in <b>' + reasonOk + ' of ' + withReason.length + '</b> case' + (withReason.length === 1 ? '' : 's') + '.');
  if (pts.length) lines.push('In cases where you checked two or more parts, you worked through the card in order in <b>' + ordered + ' of ' + pts.length + '</b>.');
  if (stopCases.length) lines.push('You stopped at the deciding part, without opening more, in <b>' + stopped + ' of ' + stopCases.length + '</b> case' + (stopCases.length === 1 ? '' : 's') + ' where one applies.');
  return '<div class="reassess-note how-you-worked" style="margin-top:12px;"><h4>How you worked</h4><ul>' + lines.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul></div>';
}
/* Feedback on how the learner worked, not only what they chose. */
function processFeedback(c, rec) {
  var lines = [];
  var d = rec.deciding_group;
  var f = processFacts(rec);
  function nm(g) { return partName(g); }
  if (rec.reason_group) {
    var named = rec.reason_group === "none" ? "nothing you checked met a criterion" : nm(rec.reason_group);
    var truth = d ? nm(d) : "nothing on the card met a criterion";
    lines.push(f.reasonRight
      ? 'You named the part that decided it: <b>' + esc(truth) + '</b>.'
      : (rec.reason_group === "none"
        ? 'You said that <b>' + esc(named) + '</b>. In this case: <b>' + esc(truth) + '</b>.'
        : 'You said <b>' + esc(named) + '</b> decided it. In this case: <b>' + esc(truth) + '</b>.'));
  }
  if (f.checkedCount) {
    if (f.outOfOrder) lines.push('You opened <b>' + esc(nm(f.outOfOrder[0])) + '</b> before <b>' + esc(nm(f.outOfOrder[1])) + '</b>. The IITT is worked red, then yellow, then high-risk vital signs.');
    else lines.push('You worked through the card in order.');
    if (d && f.extra.length) lines.push('You could have stopped at <b>' + esc(nm(d)) + '</b>. You opened ' + f.extra.length + ' further part' + (f.extra.length === 1 ? '' : 's') + ' that did not change the answer.');
  }
  return lines;
}
function renderFeedback(c) {
  var num = state.qIndex + 1;
  var rec = state.results[state.results.length - 1];
  var result = rec.response_classification;
  var meta = CATEGORY_META[c.correct];
  var selMeta = CATEGORY_META[state.selected];
  var bannerClass = result === "correct" ? "correct" : (result === "incorrect" ? "incorrect" : "partial");
  var bannerTitle = outcomeLabel(result);

  var rightCount = state.cpLog.filter(function (l) { return l.isRight; }).length;
  var infoLine;
  if (isFreeMode()) {
    var dg = rec.deciding_group;
    var f0 = processFacts(rec);
    infoLine = 'You checked ' + rec.info_items_gathered + ' of ' + rec.info_items_available + ' parts of the card.';
    var catWord = CATEGORY_META[c.correct].label;
    if (dg) {
      infoLine += ' The finding that decides this case is under <b>' + esc(partName(dg)) + '</b>. ';
      if (!rec.deciding_group_checked) infoLine += 'You did not check it this time. Open the card whenever you need to: the aim is to use it, not to remember it.';
      else if (f0.skipped.length) infoLine += 'You checked it, but to be sure of ' + catWord + ' you also need to rule out the parts before it. You skipped <b>' + esc(nameList(f0.skipped)) + '</b>.';
      else infoLine += 'You checked it.';
    } else if (f0.skipped.length) {
      infoLine += ' Nothing on the card is met in this case, and green needs every part checked first. You skipped <b>' + esc(nameList(f0.skipped)) + '</b>.';
    } else {
      infoLine += ' You checked every part, which is what green needs.';
    }
  } else {
    infoLine = 'You correctly identified ' + rightCount + ' of ' + c.checkpoints.length + (c.checkpoints.length === 1 ? ' criterion check' : ' criteria checks') + ' along the way.';
  }

  var processLines = isFreeMode() ? processFeedback(c, rec) : [];
  var html = '<div class="card">';
  html += caseHeader(c, num, Math.round(num / state.queue.length * 100));
  html += miniImageRow(c);
  var bannerSub = "You selected <b>" + selMeta.label + "</b>";
  if (result === "incorrect") bannerSub += ".";
  else if (result === "correct_unsupported") {
    bannerSub += !decidingGroup(c) ? ". That is the correct category, but green needs every part of the card checked"
      : (!rec.deciding_group_checked ? ". That is the correct category, but you did not open the part of the card that decides it"
      : ". That is the correct category, but you skipped parts before it that need ruling out");
  }
  else if (result === "correct_wrong_reason") bannerSub += ". That is the correct category, but the part you named is not the one that decided it";
  if (!/\.$/.test(bannerSub)) bannerSub += ".";
  html += '<div class="feedback-banner ' + bannerClass + '"><div class="f-title">' + bannerTitle + '</div><div class="f-sub">' + bannerSub + '</div>' +
    (result === "incorrect" ? '<span class="answer-chip ' + meta.chip + '">Correct category: ' + meta.label + '</span>' : '') + '</div>';
  var howLines = [infoLine].concat(processLines);
  if (rec.confidence) {
    howLines.push('You said you were <b>' + esc(confidenceLabel(rec.confidence).toLowerCase()) + '</b> and the category was ' + (state.selected === c.correct ? 'correct' : 'not correct') + '.');
  }
  html += '<div class="reassess-note how-you-worked" style="margin-top:10px;"><h4>How you worked</h4><ul>' + howLines.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul></div>';

  if (rec.under_triage) {
    var lastYes = null;
    state.cpLog.forEach(function (l) { if (l.selected === "yes" && l.isRight) lastYes = l.g; });
    var link = '';
    if (isFreeMode() && rec.deciding_group && rec.reason_group === rec.deciding_group) lastYes = rec.deciding_group;
    if (lastYes && GROUP_META[lastYes]) {
      var lvl = GROUP_META[lastYes].level;
      link = ' You found the part that decided it: <b>' + esc(partName(lastYes)) + '</b>. A criterion met under ' + (lvl === 'vitals' ? 'high-risk vital signs' : 'a ' + lvl + ' part') + ' means <b>' + CATEGORY_META[c.correct].label + '</b>.';
    }
    html += '<div class="reassess-note under-triage"><h4>Under-triage</h4><p>You chose <b>' + selMeta.label + '</b>, which on the card means \u201c' + esc(CATEGORY_DEST[state.selected]) + '\u201d. This patient needed <b>' + meta.label + '</b>: \u201c' + esc(CATEGORY_DEST[c.correct]) + '\u201d.' + link + '</p>' +
      '<p>Under-triage delays care for the patients who most need it, so it is the most important error to learn from.</p></div>';
  }
  html += '<div class="detail-section"><h4>Why</h4><p><b>' + esc(c.keyCriterion) + '.</b> ' + esc(c.feedbackWhy) + '</p></div>';
  var dgFb = decidingGroup(c);
  var cardKey = c.population === "adult" ? "adult" : "pediatric";
  html += '<div class="review-card-row"><button type="button" class="btn btn-ghost" onclick="openRefCard(\'' + cardKey + '\')">Review ' + (dgFb ? esc(GROUP_META[dgFb].label) + ' on the ' : 'the ') + (c.population === "adult" ? "adult" : "paediatric") + ' IITT card</button></div>';
  if (c.reassessment) html += '<div class="reassess-note"><span>' + esc(c.reassessment) + '</span></div>';

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
function practiceMissed() {
  var ids = [];
  state.results.forEach(function (r) {
    if (r.response_classification !== "correct" && ids.indexOf(r.case_id) === -1) ids.push(r.case_id);
  });
  if (!ids.length) return;
  state.queue = shuffleArray(ids);
  state.qIndex = 0;
  state.results = [];
  resetCaseState();
  render();
}
function restartPractice() { startPractice(state.practiceMode); }
function goToPracticeHome() { state.queue = []; safeRemove(STORE_RUN); render(); }

function renderPracticeSummary() {
  var results = state.results;
  var totalCorrect = results.filter(function (r) { return r.response_classification === "correct"; }).length;
  var totalUnsupported = results.filter(function (r) { return r.response_classification === "correct_unsupported"; }).length;
  var totalWrongReason = results.filter(function (r) { return r.response_classification === "correct_wrong_reason"; }).length;
  var totalIncorrect = results.filter(isIncorrect).length;

  function bucketFor(pop) {
    var subset = results.filter(function (r) { return r.adult_or_pediatric === pop; });
    return {
      correct: subset.filter(function (r) { return r.response_classification === "correct"; }).length,
      unsupported: subset.filter(function (r) { return r.response_classification === "correct_unsupported"; }).length,
      wrongReason: subset.filter(function (r) { return r.response_classification === "correct_wrong_reason"; }).length,
      incorrect: subset.filter(isIncorrect).length
    };
  }
  var adultB = bucketFor("adult");
  var pedsB = bucketFor("pediatric");

  var uptriageResults = results.filter(function (r) { return r.correct_triage_category === "uptriage"; });
  var uptriageCorrect = uptriageResults.filter(function (r) { return r.response_classification === "correct"; }).length;

  var html = '<div class="card">';
  html += '<h2 class="section-title">Practice complete</h2>';
  var modeLabel = state.practiceMode === "decide" ? "Triage practice" : "Guided triage practice";
  html += '<p class="section-sub">Mode: ' + modeLabel + '. Cases completed: ' + results.length + '</p>';
  html += '<div class="summary-stat-grid' + ((totalUnsupported || totalWrongReason) ? ' summary-stat-grid-4' : '') + '">';
  html += '<div class="summary-stat correct"><div class="s-num">' + totalCorrect + '</div><div class="s-label">Correct</div></div>';
  if (totalUnsupported) html += '<div class="summary-stat unsupported"><div class="s-num">' + totalUnsupported + '</div><div class="s-label">Not enough checked</div></div>';
  if (totalWrongReason) html += '<div class="summary-stat unsupported"><div class="s-num">' + totalWrongReason + '</div><div class="s-label">Wrong reason</div></div>';
  html += '<div class="summary-stat incorrect"><div class="s-num">' + totalIncorrect + '</div><div class="s-label">Incorrect</div></div>';
  html += '</div>';
  html += directionNote(results);
  html += confidenceNote(results);

  html += '<table class="pop-table"><thead><tr><th>Population</th><th>Correct</th>' + partialHead(totalUnsupported, totalWrongReason) + '<th>Incorrect</th></tr></thead><tbody>';
  html += '<tr><td>Adult</td><td>' + adultB.correct + '</td>' + partialCells(adultB, totalUnsupported, totalWrongReason) + '<td>' + adultB.incorrect + '</td></tr>';
  html += '<tr><td>Paediatric</td><td>' + pedsB.correct + '</td>' + partialCells(pedsB, totalUnsupported, totalWrongReason) + '<td>' + pedsB.incorrect + '</td></tr>';
  html += '</tbody></table>';
  html += partialNote(totalUnsupported, totalWrongReason);

  if (uptriageResults.length) {
    html += '<div class="reassess-note" style="margin-top:16px;"><span>High-risk vital sign (up-triage) cases: ' + uptriageCorrect + ' of ' + uptriageResults.length + ' correctly identified as needing up-triage.</span></div>';
  }

  html += processSummary(results);
  if (isFreeMode()) {
    var totalGathered = results.reduce(function (sum, r) { return sum + (r.info_items_gathered || 0); }, 0);
    var totalAvailable = results.reduce(function (sum, r) { return sum + (r.info_items_available || 0); }, 0);
    var avgPct = totalAvailable ? Math.round((totalGathered / totalAvailable) * 100) : 0;
    html += '<div class="reassess-note" style="margin-top:10px;"><span>On average, you gathered ' + avgPct + '% of the available checks per case before deciding.</span></div>';
  }

  /* Case by case: what happened on each case, with the explanation, and a way to retry the misses. */
  html += '<h3 class="case-review-title">Your cases</h3><div class="case-review">';
  var missedIds = [];
  results.forEach(function (r) {
    var cc = caseById(r.case_id);
    if (!cc) return;
    var good = r.response_classification === "correct";
    if (!good) missedIds.push(r.case_id);
    var rowTitle = (cc.population === "adult" ? "Adult" : "Paediatric") + ", " + cc.age;
    var verdict = outcomeLabel(r.response_classification);
    var dgR = decidingGroup(cc);
    var decidedBy = dgR ? partName(dgR) : "Nothing on the card met a criterion";
    var namedR = r.reason_group ? (r.reason_group === "none" ? "nothing you checked met a criterion" : partName(r.reason_group)) : "";
    html += '<details class="case-review-item"><summary><span class="cr-title">' + esc(rowTitle) + '</span><span class="cr-verdict">' + (good ? "\u2713 " : "\u2717 ") + verdict + '</span></summary>' +
      '<div class="cr-body"><p class="reading">' + esc(cc.arrival) + '</p>' +
      '<p class="reading">You chose <b>' + CATEGORY_META[r.selected_triage_category].label + '</b>. Correct category: <b>' + CATEGORY_META[cc.correct].label + '</b>.</p>' +
      '<p class="reading">Decided by: <b>' + esc(decidedBy) + '</b>.' + (namedR ? ' You named: <b>' + esc(namedR) + '</b>.' : '') + '</p>' +
      '<p class="reading"><b>' + esc(cc.keyCriterion) + '.</b> ' + esc(cc.feedbackWhy) + '</p></div></details>';
  });
  html += '</div>';
  if (missedIds.length) {
    html += '<div class="restart-row"><button class="btn btn-primary" onclick="practiceMissed()">Practise the ' + missedIds.length + ' case' + (missedIds.length === 1 ? '' : 's') + ' I missed</button></div>';
  }
  html += '<div class="restart-row"><button class="btn ' + (missedIds.length ? 'btn-ghost' : 'btn-primary') + '" onclick="restartPractice()">Restart (same mode)</button></div>';
  html += '<div class="restart-row"><button class="btn btn-ghost" onclick="goToPracticeHome()">Choose a different mode</button></div>';
  html += '<div class="restart-row"><button class="btn btn-ghost" onclick="openProgress()">My progress</button></div>';
  html += '<div class="restart-row"><button class="btn btn-ghost" onclick="openResetConfirm()">Reset for new user</button></div>';
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
    html += '<div><div class="r-title">' + esc(c.title) + '</div><div class="r-sub">' + (c.population === "adult" ? "Adult" : "Paediatric") + ', ' + meta.label + ', ' + c.checkpoints.length + ' checkpoints</div></div>';
    if (c.needsReview) {
      var listStatus = reviewStatusFor(c.id);
      if (listStatus === "Reviewed \u2014 approved") html += '<span class="flag-pill confirmed">Confirmed</span>';
      else if (listStatus === "Reviewed \u2014 needs edits") html += '<span class="flag-pill edits">Edits noted</span>';
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
    html += '<b>Needs clinician review:</b> ' + esc(c.reviewNote);
    if (detailStatus === "Reviewed \u2014 approved") html += '<div style="margin-top:6px; font-weight:700;">Confirmed as extracted.</div>';
    else if (detailStatus === "Reviewed \u2014 needs edits") html += '<div style="margin-top:6px; font-weight:700;">Edits requested \u2014 see notes below.</div>';
    html += '<div class="review-flag-actions">' +
      '<button type="button" class="btn btn-primary btn-sm" onclick="confirmCaseReview(\'' + id + '\')">Confirm as extracted</button>' +
      '<button type="button" class="btn btn-ghost btn-sm" onclick="requestCaseEdits(\'' + id + '\')">Request edits</button>' +
      '</div>';
    html += '<div class="field-row" style="margin-top:12px; margin-bottom:0;"><label>Resolution notes</label><textarea rows="3" data-case="' + id + '" data-field="review_resolution_notes" onchange="onMetaEdit(this)" placeholder="Add corrections, clarifications, or the reasoning for confirming this as-is...">' + esc(overrides.review_resolution_notes || "") + '</textarea></div>';
    html += '</div>';
  }
  html += '<img class="case-image" src="' + IMAGES[c.image] + '" alt="">';
  html += '<h3 class="case-title">' + esc(c.title) + '</h3>';
  html += '<div class="kv"><span><b>Population:</b> ' + (c.population === "adult" ? "Adult" : "Paediatric") + '</span><span><b>Age:</b> ' + esc(c.age) + '</span><span><b>Sex:</b> ' + esc(c.sex) + '</span></div>';
  html += '<div class="kv" style="margin-top:6px;"><span><b>Clinical domain:</b> ' + esc(c.domain) + '</span></div>';

  html += '<div class="detail-section"><h4>Case info</h4><p>' + esc(c.arrival) + '</p></div>';

  html += '<div class="detail-section"><h4>Checkpoint sequence (' + c.checkpoints.length + ' \u2014 used in Guided triage practice)</h4>';
  html += '<ol class="cp-review-list">';
  c.checkpoints.forEach(function (cp) {
    var gm = GROUP_META[cp.g];
    html += '<li><b>' + esc(gm.label) + ' (' + gm.level + '):</b> ' + esc(gm.question) + ' &rarr; <b>' + (cp.correct === "yes" ? "Yes" : "No") + '.</b>';
    if (cp.chips) {
      html += ' <i>(' + Object.keys(cp.chips).map(function (k) { return k + ": " + cp.chips[k]; }).join(", ") + ')</i>';
    }
    if (cp.reveal) {
      html += ' <span class="flag-pill" style="margin-left:6px; background:var(--primary-soft); color:var(--primary-dark);">DECIDE-MODE STEP</span>';
    }
    html += '</li>';
  });
  html += '</ol>';
  html += '<p style="font-size:14px; color:var(--ink-soft); line-height:1.5; margin-top:8px;">Steps tagged <b>DECIDE-MODE STEP</b> are the only ones offered as \u201cwhat would you check next\u201d options in Triage practice \u2014 they mark where the source slides show genuinely new information (an \u201cAdditional information\u201d reveal) rather than something already evident from the case info. This filtering is an editorial judgment call; please confirm it against the source slides.</p>';
  html += '</div>';

  html += '<div class="detail-section"><h4>Correct triage category</h4><span class="answer-chip ' + meta.chip + '">' + meta.emoji + ' ' + meta.label + '</span></div>';
  html += '<div class="detail-section"><h4>Key IITT criterion</h4><p>' + esc(c.keyCriterion) + '</p></div>';
  html += '<div class="detail-section"><h4>Feedback</h4><p>' + esc(c.feedbackWhy) + '</p></div>';
  if (c.reassessment) html += '<div class="detail-section"><h4>Reassessment note</h4><p>' + esc(c.reassessment) + '</p></div>';

  html += '<div class="divider"></div>';
  html += '<h4 class="mb-2 text-base">Educational-design metadata (for clinician completion)</h4>';
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
  html += '<h4 class="mb-2 text-base">Clinical domains represented</h4>';
  CASES.forEach(function (c) {
    html += '<div class="coverage-domain-row"><span>' + esc(c.domain) + '</span><span class="c-count">' + (c.population === "adult" ? "Adult" : "Peds") + '</span></div>';
  });

  html += '<div class="divider"></div>';
  html += '<h4 class="mb-2 text-base">Criterion types &amp; intended challenges</h4>';
  html += '<p style="font-size:14px; color:var(--ink-soft); line-height:1.5;">Not yet populated &mdash; complete the educational-design metadata for each case in Clinician review to build this out.</p>';

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
      fetchJson("status.json").catch(function () { return { paused: false }; }),
      fetchJson("collection.json").catch(function () { return {}; })
    ]);
  }).then(function (res) {
    SITE.version = (res[0] && res[0].version) || "";
    var col = res[2] || {};
    COLLECT.enabled = col.enabled === true && typeof col.endpoint === "string" && col.endpoint.indexOf("https://script.google.com/") === 0;
    COLLECT.endpoint = COLLECT.enabled ? col.endpoint : "";
    COLLECT.notice = typeof col.notice === "string" ? col.notice : "";
    flushOutbox();
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
      if (getLearnerName() && getLearnerEmail()) restoreRun();
      render();
      setupBackButton();
      if (!window.__statusTimer) window.__statusTimer = setInterval(checkPausedAgain, STATUS_RECHECK_MS);
    });
  }).catch(showLoadError);
}

/* The browser Back button (and the Android back gesture) steps back inside the
   app: it closes an open panel, or asks before leaving a case. */
function setupBackButton() {
  try { history.pushState({ iitt: 1 }, ""); } catch (e) { return; }
  window.addEventListener("popstate", function () {
    var inCase = state.queue.length && state.qIndex < state.queue.length;
    if (state.resetConfirmOpen) { state.resetConfirmOpen = false; }
    else if (state.endSessionConfirmOpen) { state.endSessionConfirmOpen = false; }
    else if (state.refCardOpen) { state.refCardOpen = null; state.refZoomed = false; }
    else if (state.ageBandOpen) { state.ageBandOpen = false; }
    else if (state.caseInfoOpen) { state.caseInfoOpen = false; }
    else if (state.progressOpen) { state.progressOpen = false; }
    else if (state.example) { state.example = null; }
    else if (inCase) { state.endSessionConfirmOpen = true; }
    else if (state.queue.length) { state.queue = []; safeRemove(STORE_RUN); }
    else { return; }
    try { history.pushState({ iitt: 1 }, ""); } catch (e) {}
    render();
  });
}

boot();

