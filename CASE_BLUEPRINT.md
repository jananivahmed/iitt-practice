# Case blueprint

How to design and write a new case so it teaches one clear thing and works in the app.

## 1. Start from the gap, not the case

Before writing any case info, answer these in a sentence each:

1. **The gap.** What do learners (or a facility's staff) get wrong? Example: "infants with abnormal vital signs are triaged too low".
2. **The learning point.** The single thing this case should leave in the learner's head.
3. **The deciding finding.** The criterion that decides the category (this becomes `keyCriterion`).
4. **The expected error.** The mistake you expect, and the wrong category it leads to (`design.expectedCommonError`, `design.predictedWrongCategory`).
5. **Subtlety.** Is the deciding finding obvious or easy to miss (`design.caseSubtlety`)?
6. **Tags.** Which focus tags describe it (`focusTags`, from `tags.json`)? Tags are what let a facility pick a targeted set later, for example all cases tagged `pediatric` and `vital-signs`.

A case that has no clear gap and learning point is usually a case that tests nothing.

## 2. Accuracy rule

Every finding, vital sign, threshold and triage category in a case must come from the source material or from the clinician who wrote the case. Nobody else, including an AI assistant, may invent or adjust clinical values to make a case work. Where something is unclear, set `needsReview` to `true` and say exactly what to check in `reviewNote`.

## 3. Writing the case (the fields)

| Field | Required | What goes in it |
|---|---|---|
| `id` | yes | Short and permanent, e.g. `adult-6`. Must match the file name. Never change it later |
| `status` | yes | `draft`, `ready` or `live` (see section 5) |
| `population` | yes | `adult` or `pediatric` |
| `title` | yes | Age, sex and presenting problem |
| `age`, `sex`, `domain` | yes | Shown in the header and case bank |
| `focusTags` | no | Tags from `tags.json` |
| `image` | yes | Picture name. Needs `images/cases/<name>.jpg` and `images/faces/<name>.jpg` |
| `ageBandRef` | no | For pediatric cases: `{ "band", "hr", "rr" }` from the source. Shown in the age-band reference |
| `arrival` | yes | The case info the learner reads first |
| `checkpoints` | yes | The step-by-step criteria (section 4) |
| `correct` | yes | `red`, `yellow`, `green` or `uptriage` |
| `keyCriterion` | yes | The criterion that decides the category |
| `feedbackWhy` | yes | Why that category is correct |
| `teachingPoint`, `reassessment` | no | Extra teaching, or reassessment advice |
| `sourceDeck`, `sourceSlides` | no | Where the case comes from |
| `needsReview`, `reviewNote` | no | Flag for clinician review and what to check |
| `author`, `design` | no | Who wrote it and the design notes from section 1 (not shown to learners, kept for authors and reviewers) |

## 4. Checkpoints

A checkpoint is one question from the reference card, answered for this patient. They go in the same order as the card and stop at the first "yes". If no red or yellow criterion is met, finish with the high-risk vital signs checkpoint: a "yes" gives up-triage, a "no" gives green.

| Checkpoint group (`g`) | Label shown | Level |
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

Each checkpoint has:

- `g`: the group above.
- `correct`: `"yes"` or `"no"`.
- `why`: a plain-words explanation for this patient (required).
- `chips` (optional): values shown to the learner, such as `{ "HR": "110 bpm" }`.
- `reveal` (optional): `true` means that in Triage Practice mode the learner must choose to check this item to see the values. Leave it out for anything the learner already knows from the case info.

Design tip: put the findings that matter for your learning point behind `reveal: true`, so learners practise knowing what to look for. Do not hide things that are already stated in `arrival`.

The checker warns you if the first "yes" checkpoint does not match the `correct` category. A warning means "have a clinician look", not necessarily an error.

## 5. Status and review

- `draft`: being written. Shown in preview only.
- `ready`: finished and waiting for review. Shown in preview only.
- `live`: approved by the clinician lead (Dr Ahmed). Shown on the live site.

Only change a case to `live` after the clinician review is done. The checker warns if a `live` case still has `needsReview: true`.

## 6. Quality checklist

- One clear learning point and one deciding finding.
- All clinical values come from the source or the authoring clinician.
- `correct` matches the checkpoints.
- Every checkpoint has a `why` a learner can follow.
- The `arrival` text does not give away the answer, and does not contradict a checkpoint.
- Pediatric cases: the age band and its thresholds are from the source.
- Pictures added, id added to `cases/index.json`, tags exist in `tags.json`.
- Checker (`tools/validate.js`) shows no errors, and every warning has been read.

## 7. Targeted sets (later)

Because each case carries `focusTags`, a later version of the app can offer a "practice set" built from tags, for example for a facility that finds it under-triages children with abnormal vital signs. The tags and `design` notes are recorded now so that feature can be added without rewriting cases.
