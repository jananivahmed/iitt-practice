# Runbook: everyday jobs

Everything here is done on github.com, in the `iitt-practice` repo. No software needed.

## 1. One-time setup

1. Open the empty repo. Click **Add file → Upload files**.
2. Drag in everything from the unzipped folder, including the `assets`, `cases`, `images`, `tools` and `docs` folders. Click **Commit changes** (commit directly to `main`).
3. **The hidden `.github` folder.** Some computers hide folders that start with a dot, so drag-and-drop may skip it.
   - Check the repo's file list. If you do not see a `.github` folder, create the two files by hand:
   - Click **Add file → Create new file**. In the name box type `.github/workflows/pages.yml` (typing the slashes makes the folders). Paste in the contents of `SETUP-workflows/pages.yml` from the zip. Commit.
   - Do the same for `.github/workflows/preview-trigger.yml`.
4. **Settings → Pages.** Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Open the **Actions** tab. Wait for **Publish site** to show a green tick (1 to 3 minutes). If it was started before you changed the Pages setting, open it and click **Re-run all jobs**.
6. Open https://jananivahmed.github.io/iitt-practice/ and check it loads.
7. **Create the preview branch.** On the repo's main page click the branch button (it says `main`), type `preview` in the box, and choose **Create branch: preview from main**.
8. Check the **Actions** tab again. After a minute the preview site should exist at `/preview/`, with an orange PREVIEW bar at the top.

## 2. Preview a change

1. Someone (me, in a chat session) gives you changed files.
2. In the repo, switch the branch button to `preview`.
3. **Add file → Upload files**, drag in the changed files (keep their folders, for example `cases/adult-6.json`), and commit directly to the `preview` branch.
4. Wait 1 to 3 minutes, then open the preview address. The live site is not touched.

If the Actions tab shows a red cross, click the run to read the problem list (see section 7).

## 3. Go live

1. When the preview is right, open **Pull requests → New pull request**.
2. Set **base: main** and **compare: preview**. Click **Create pull request**, then **Merge pull request**, then **Confirm merge**.
3. The live site updates within a few minutes. Check it.

Nothing reaches the live site except through this step.

## 4. Pause the site (temporary, easy to undo)

1. Open `status.json` on the **main** branch and click the pencil icon.
2. Change `"paused": false` to `"paused": true`. Optionally edit the message.
3. Click **Commit changes**.

Within a few minutes the live site shows your message instead of the app. People who already have the site open see it within about 5 minutes. To resume, change it back to `false`.

Limits: it only works for people who are online. The preview site ignores the pause switch, so you can keep testing.

## 5. Full shutdown (site offline)

1. **Settings → Pages**. Next to the site address, open the menu (three dots) and choose **Unpublish site**. GitHub sometimes renames menu items. If you cannot find it, go to **Settings → General → Danger Zone → Change visibility → Make private**, which also takes a free-account Pages site offline.
2. To bring it back, set the repo public again if you changed it, then open **Actions → Publish site → Run workflow**.

This is the strongest option because it does not depend on the app. If a publish run is red and you need the site gone urgently, use this.

## 6. Add a new case

See `docs/CASE_BLUEPRINT.md` for how to design it. Mechanically:

1. Copy `cases/_template.json` to `cases/<new-id>.json` (for example `adult-6.json`) and fill it in.
2. Add the pictures: `images/cases/<image>.jpg` and `images/faces/<image>.jpg`.
3. Add the id to the list in `cases/index.json`.
4. Upload to `preview` (section 2). New cases start with `"status": "draft"`: they appear in preview only.
5. After a clinician has reviewed it, change `"status"` to `"live"` and merge to `main` (section 3).

## 7. When the Actions tab shows a red cross

Click the failed run, then **Publish**. Lines that start with `ERROR` say what to fix (file name first). `WARNING` lines do not stop publishing but should be read. If the live check fails, the previous live site stays up unchanged. If only the preview check fails, the live site still publishes and the preview is not updated.

## 8. Good to know

- Learner progress lives in each person's browser (local storage). A browser on the same web address shares it, and clearing browser data removes it.
- Case ids must never change after learners have used them, or their history no longer matches.
- Every device that opens the site sees the latest version after a refresh. Pages may take a few minutes to update for people who have the site open.
