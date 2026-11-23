# IITT Practice Companion

A case-practice web app for nurses and frontline health workers practising the Interagency Integrated Triage Tool (IITT).

Developed by Janani Ahmed, MD MPH, Assistant Professor, Emergency Medicine, The Ohio State University.

For educational and training purposes only. It is not clinical decision support.

- Live site: https://jananivahmed.github.io/iitt-practice/
- Preview site: https://jananivahmed.github.io/iitt-practice/preview/

## What is in this folder

All files sit at the top level (no folders), so they can be dragged into GitHub in one go.

| File | What it is |
|---|---|
| `index.html`, `app.js`, `styles.css` | The app (page, code, styles). Does not change when cases change |
| `case-<id>.json` | One file per case, e.g. `case-adult-1.json` |
| `cases.json` | The list and order of cases |
| `case-_template.json` | Blank template for a new case (never published) |
| `picture-<id>.jpg`, `portrait-<id>.jpg` | The large case picture and the small portrait for each case |
| `refcard-*.png`, `ui-*.jpg/png` | The three reference cards and the interface pictures |
| `status.json` | The pause switch |
| `collection.json` | Switch and address for collecting sign-in details (off by default) |
| `receiver.gs` | The Google script that receives sign-in details into a Google Sheet (not published) |
| `version.json` | The version number shown in About |
| `tags.json` | The list of allowed case focus tags |
| `validate.js` | Checks the cases before every publish |
| `.github/workflows/` | The automation that publishes the live and preview sites |
| `RUNBOOK.md` | How to do everyday jobs: preview, go live, pause, shut down |
| `DEVELOPER_NOTES.md` | Case-file fields, how a worksheet becomes a case file, what the checker does |

## How it fits together

- `main` branch is the live site. `preview` branch is the preview site.
- Changes go to `preview` first, are checked there, then merged into `main` to go live.
- Learners' progress is stored in their own browser. Nothing is sent to any server yet.
