/* IITT Practice Companion: registration receiver (Google Apps Script).
   Paste into the Apps Script editor of the "IITT Practice Companion: Registrations"
   Google Sheet (Extensions > Apps Script), then Deploy > New deployment > Web app:
     Execute as: Me      Who has access: Anyone
   Copy the web app URL into collection.json ("endpoint") and set "enabled": true.
   Each learner sign-in becomes one row. A repeat of the same record_id is ignored,
   so the app can safely retry. */

var SHEET_NAME = "Sheet1";              // change if the tab was renamed
var HEADERS = ["record_id", "received_at", "signed_in_at", "session_id", "name", "email",
               "role", "facility", "country", "app_version", "site"];
var ROLES = ["Nurse", "Physician", "Clinical officer or other clinician", "Student", "Other"];
var LIMITS = { record_id: 80, session_id: 80, name: 80, email: 120, role: 60, facility: 120,
               country: 80, app_version: 20, signed_in_at: 40, site: 10 };
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var rec = JSON.parse(e.postData.contents);
    var problem = check_(rec);
    if (problem) return json_({ ok: false, error: problem });

    lock.waitLock(20000);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return json_({ ok: false, error: "sheet not found" });
    if (sheet.getLastRow() < 1) sheet.appendRow(HEADERS);

    var last = sheet.getLastRow();
    if (last > 1) {
      var ids = sheet.getRange(2, 1, last - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === rec.record_id) return json_({ ok: true, duplicate: true });
      }
    }
    sheet.appendRow([
      safe_(rec.record_id), new Date(), safe_(rec.signed_in_at), safe_(rec.session_id),
      safe_(rec.name), safe_(rec.email), safe_(rec.role), safe_(rec.facility),
      safe_(rec.country), safe_(rec.app_version), safe_(rec.site)
    ]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "bad request" });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet() { return json_({ ok: true, service: "IITT registration receiver" }); }

function check_(r) {
  if (!r || typeof r !== "object") return "no data";
  var keys = Object.keys(LIMITS);
  for (var i = 0; i < keys.length; i++) {
    var v = r[keys[i]];
    if (v === undefined || v === null) v = "";
    if (typeof v !== "string") return keys[i] + " must be text";
    if (v.length > LIMITS[keys[i]]) return keys[i] + " too long";
  }
  if (!r.record_id || !r.session_id) return "missing id";
  if (!r.name || !r.name.trim()) return "missing name";
  if (!EMAIL_RE.test(r.email || "")) return "invalid email";
  if (ROLES.indexOf(r.role) < 0) return "invalid role";
  if (!r.country) return "missing country";
  return "";
}

// Stops a value starting with = + - @ from being read as a formula in the Sheet.
function safe_(v) {
  v = (v === undefined || v === null) ? "" : String(v);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
