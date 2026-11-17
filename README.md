# IITT Practice Companion

A case-practice web app for nurses and frontline health workers practising the Interagency Integrated Triage Tool (IITT).

Developed by Janani Ahmed, MD MPH, Assistant Professor, Emergency Medicine, The Ohio State University.

For educational and training purposes only. It is not clinical decision support.

- Live site: https://jananivahmed.github.io/iitt-practice/
- Preview site: https://jananivahmed.github.io/iitt-practice/preview/

## What is in this folder

| Path | What it is |
|---|---|
| `index.html`, `assets/` | The app (page, styles, code). Does not change when cases change |
| `cases/` | One file per case, plus `index.json` (the list and order of cases) and `_template.json` |
| `images/` | Case pictures, portraits, interface pictures and the three reference cards |
| `status.json` | The pause switch |
| `version.json` | The version number shown in About |
| `tags.json` | The list of allowed case focus tags |
| `tools/validate.js` | Checks the cases before every publish |
| `.github/workflows/` | The automation that publishes the live and preview sites |
| `docs/RUNBOOK.md` | How to do everyday jobs: preview, go live, pause, shut down |
| `docs/CASE_BLUEPRINT.md` | How to design and write a new case |

## How it fits together

- `main` branch is the live site. `preview` branch is the preview site.
- Changes go to `preview` first, are checked there, then merged into `main` to go live.
- Learners' progress is stored in their own browser. Nothing is sent to any server yet.
