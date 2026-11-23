# Developer notes: case files

For whoever edits the case files or the checker. Cases carry no source field: every case is uniquely authored. Authors do not need this file. They use the **Case Blueprint** (instructions) and the **Case Worksheet** (form) Google Docs, version 4 (November 2026). If those Docs change, this file needs updating to match.

How a case gets live is in the **Case Publishing Process** and **Case Review Process** Docs. In short: author writes the worksheet, a clinician reviews it, the clinician lead signs off, the worksheet is converted into a case file, the case is checked in preview, and the clinician lead sets it live.

## Converting a worksheet into a case file

Rules for whoever does the conversion (Claude or a developer):

- Copy clinical wording exactly as written. Never invent, adjust or "tidy" clinical values, findings or categories.
- If something is unclear or missing, set `needsReview` to `true` and say what to check in `reviewNote`. Write "CLINICIAN REVIEW REQUIRED" at the start of the note.
- Start from `case-_template.json`, add the id to `cases.json`, and add `picture-<image>.jpg` and `portrait-<image>.jpg`.
- New cases start with `"status": "draft"` (or `ready` once reviewed). Only the clinician lead sets `live`. `findingsReviewed` and `needsReview` are changed only on the clinician lead's instruction.
- Run `node validate.js`. Errors stop publishing. Send worksheet gaps back to the author, not fix them by guessing.

## Worksheet to case file

| Worksheet section | Case-file field(s) |
|---|---|
| 1. Case title | `title` |
| 1. Patient group | `population` (`adult` or `pediatric`) |
| 1. Age, Sex | `age`, `sex` |
| 1. Clinical area | `domain` |
| 1. Author name(s) | not stored yet (`author` is allowed but unused) |
| 2. Learning point | `teachingPoint` is a different thing (see section 6). Learning point is not stored yet |
| 2. Anticipated difficulty | not stored yet |
| 2. Which card section decides | not stored yet. The app works out the deciding section from the first Yes checkpoint |
| 3. Case info text | `arrival` |
| 3. Fair-play check, where the deciding finding appears, fictional or de-identified | confirmations for the reviewer. Not stored |
| 4. Yes or No | `checkpoints[].correct` |
| 4. Teaching note (Guided Triage Practice) | `checkpoints[].why`. Required on every step |
| 4. What the learner finds | `findings.<group>` (`text` and/or `chips`). Shown in both modes: when a card section is opened (Triage Practice) and at each step (Guided Triage Practice) |
| 5. Correct category | `correct` (`red`, `yellow`, `green`, `uptriage`) |
| 5. Deciding criterion | `keyCriterion` |
| 5. Feedback: why | `feedbackWhy` |
| 6. Teaching point | `teachingPoint` |
| 6. Reassessment advice | `reassessment` |
| 7. Unsure items | `needsReview: true` and `reviewNote` |
| 7. Reviewer name, review date | not stored yet |
| 8. Picture name | `image` |
| 8. Picture description | not stored. Used to create the picture |

"Not stored yet" means no field exists. Add one before relying on it, and add it to `validate.js` and this table.

## Fields

| Field | Required | What goes in it |
|---|---|---|
| `id` | yes | Short and permanent, e.g. `adult-6`. Must match the file name. Never change or reuse it |
| `status` | yes | `draft`, `ready` or `live` |
| `population` | yes | `adult` or `pediatric` |
| `title`, `age`, `sex`, `domain` | yes | Header and case bank |
| `focusTags` | no | Tags from `tags.json` (planned feature) |
| `image` | yes | Picture name. Needs `picture-<name>.jpg` and `portrait-<name>.jpg` |
| `ageBandRef` | no | Pediatric: `{ "band", "hr", "rr" }` from the source. Shown with the vital signs section |
| `arrival` | yes | Case info the learner reads first |
| `checkpoints` | yes | Guided Triage Practice steps (below) |
| `findings` | recommended | Triage Practice findings per card section (below) |
| `findingsReviewed` | no | `true` once a clinician has reviewed the findings |
| `correct`, `keyCriterion`, `feedbackWhy` | yes | Final category, deciding criterion, feedback |
| `teachingPoint`, `reassessment` | no | Extra teaching shown after the answer |
| `needsReview`, `reviewNote` | no | Flag for clinician review and what to check |

`reveal` on a checkpoint is no longer used by Triage Practice. Do not add it to new cases.

## Card section groups

Checkpoints and findings use these group names, in card order. The checker reads them from `GROUP_META` in `app.js`.

| Group | Label | Level |
|---|---|---|
| `unresponsive` | Unresponsive | red |
| `airway_red` | Airway & breathing | red |
| `circulation_red` | Circulation | red |
| `disability_red` | Disability | red |
| `other_red` | Other high-risk criteria | red |
| `airway_yellow` | Airway & breathing | yellow |
| `circulation_yellow` | Circulation | yellow |
| `disability_yellow` | Disability | yellow |
| `other_yellow` | Other criteria | yellow |
| `vitals` | High-risk vital signs | vitals |

## Checkpoints (Guided Triage Practice)

One per card step, in card order, stopping at the first `"yes"`. If no red or yellow criterion is met, finish with `vitals`: `"yes"` gives up-triage, `"no"` gives green.

- `g`: group name. `correct`: `"yes"` or `"no"`. `why`: plain-words reason (required).
- `chips` (optional, old): values shown at the step. Guided Triage Practice now shows the step's `findings` (text and values) instead, so both modes share one stem. `chips` is only used if the case has no `findings` for that group.

## Findings (Triage Practice)

`findings` is an object keyed by group name. Each entry has `text` and/or `chips`.

- Findings are neutral observations. They never state a verdict or hint at the answer.
- Fill in every group, including the ones after the deciding step. Blank sections reveal where the decision was made.
- They must be consistent with `arrival` and the checkpoints, and must not change the category.
- Anything a nurse would notice on arrival belongs in `arrival`, not only in a card section.

## Status

- `draft`, `ready`: shown on the preview site only.
- `live`: approved by the clinician lead. Shown on the live site.
- A clinical change to a live case sends it back to `ready` and through review again.

## Collecting sign-in details (registration)

Off by default. At sign-in the app asks for name, email, role, facility (optional) and country. When `collection.json` has `"enabled": true` and an `endpoint` starting `https://script.google.com/`, each sign-in is saved on the device (an outbox), sent in the background, and removed once the receiver confirms. If sending fails it is retried when the app opens or the device comes back online. The receiver ignores a repeated `record_id`, and refuses invalid data (which is then dropped, not retried).

- **Receiver:** `receiver.gs` goes in the Apps Script editor of the "IITT Practice Companion: Registrations" Google Sheet (Extensions, Apps Script), deployed as a web app (execute as me, access anyone). The web app address goes in `collection.json`.
- **Columns:** record_id, received_at, signed_in_at, session_id, name, email, role, facility, country, app_version, site.
- **Role list** is in both `app.js` (`ROLES`) and `receiver.gs`. Change both together.
- **Checker:** errors if `enabled` is true without a Google script address, and warns whenever collection is on.
- **Limits:** the web address is public, so the receiver checks the fields and sizes but cannot stop deliberate spam. Consent wording and any approvals are needed before real learners use the collecting version. Answers and card-section data are not sent yet.
- The outbox is kept when "Reset for new user" is used, so details already submitted are still sent.

## Scoring

Each answer is recorded as `correct` or `incorrect` (`response_classification`). For an incorrect answer, `error_direction` is a secondary detail: `under` (chose a lower category than the correct one), `over` (chose a higher one), or `na` (the correct answer is up-triage, which is not on the red/yellow/green scale). For an up-triage case, up-triage is the only correct answer. Summaries show the incorrect count first, then how many of those were under-triaged, over-triaged or not applicable. In Triage Practice the learner also rates confidence before submitting (`not_sure`, `fairly_sure` or `certain`), saved as `confidence` on the response. It does not affect scoring. Summaries show how many were correct at each confidence level. Guided Triage Practice does not ask for it (`confidence` is null). Older saved records that used `under` or `over` as the classification are read as incorrect with that direction.

## Facilitator mode (room with a screen)

For a leader running cases with a group. Entry: "Facilitator mode" button on the sign-in screen and the practice home. No sign-in. Nothing is saved or sent: `addResponse` and `addEventRecord` return early while `state.facilitator` is on, and the outbox is never touched. State lives in memory only.

Flow: pick cases (checkboxes, select all/adult/paediatric) → case screen (picture and case info on the left, card sections to tap on the right, optional "what did the group choose?", Reveal answer) → reveal screen (correct category, group's choice vs correct, why, takeaway, reassessment, optional discussion questions, every section's findings with the deciding section marked) → Next case → finish. "Larger text" toggles `body.fac-large`.

Optional case field `"discussion"`: a text or list of text, shown only on the reveal screen. The checker validates its type. The Case Worksheet (section 6) has a matching row; copy it into `discussion` as a list, one question per item.

## What the checker (`validate.js`) does

Errors stop publishing. Warnings are shown and must be read by a person, but do not stop publishing.

**Errors:** missing required fields; id not matching the file name; invalid `status`, `population` or `correct`; unknown checkpoint or findings group; a checkpoint with no `why` or a `correct` that is not yes/no; malformed `chips`; missing picture file; a case listed in `cases.json` with no file.

**Warnings:**
- the first `"yes"` checkpoint does not match `correct`;
- findings missing for some card sections, or no `findings` at all;
- a live case with `findingsReviewed` not `true`;
- a live case with `needsReview: true`, or `needsReview` with no `reviewNote`;
- a case file not listed in `cases.json`;
- a focus tag not in `tags.json`;
- no case is live.

The checker never changes a file.

## Later

Focus tags and targeted sets, free-text questions, study data (the case id and version would go in each record), facilitator view and offline use. None of these are built.
