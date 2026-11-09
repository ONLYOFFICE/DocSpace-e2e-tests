---
name: fix-last-run
description: Triage and fix the latest CI e2e run from the report server - extract failed tests, group them by cause, check what is already fixed, fix test-side failures, separate product bugs (draft bug reports, skip with bug number) and environment issues. Use when asked to look at the last run / failed tests / the CI report.
---

# Triage and fix the last CI run

Report URL is taken from `CI_REPORT_URL` in `.env` (or the URL the user
gives). The script reads the data embedded in the report's `index.html`.

Report outcomes honestly: what was run and passed, what was not run, what is
a guess.

## 1. Extract failures

```bash
python3 .claude/skills/fix-last-run/extract_failures.py ["<report url>"] [<out dir>]
```

Prints run start time (UTC), stats, failed tests grouped by error signature;
`failed.json` has full errors and attachment URLs. Each failed test usually
appears twice (chromium + firefox, or a retry) - count tests, not records.

Attachments (screenshot, `error-context` page snapshot, `trace.zip`) are at
`<report base>/data/<sha>.<ext>`. In a trace, `*.network` shows
API calls with status and `_failureText` (e.g. `NS_BINDING_ABORTED` = the
test navigated away mid-request), `resources/<sha>` holds response bodies.

## 2. Separate already-fixed failures

Compare the run start time with `git log origin/main` commit dates. If the
user says a group should already be fixed, confirm the fix commit is in the
current branch and run **one** test of that group to prove it.

## 3. Classify each group

Look at screenshot / error-context / trace before deciding.

- **Test issue** - locator ambiguity, renamed label, changed URL, race in the
  test itself. Fix it in the page object (never raw locators in specs).
- **Product bug** - wrong behavior a user would also hit. Do not fix it in
  the test.
- **Environment** - stand/CI specifics: access to external services, keys
  and credits on the stand, browser-only network issues.

Rules:
- **Do not mask product bugs.** No page reloads, retries or `toPass` that
  hide a broken state. If a page renders wrong content after a click, first
  make the test act like a user (wait for the previous page to load), then
  plain-wait for the target; if it still fails - it is a bug.
- **Expectations change locally, not via global helpers.** When URLs/texts
  change, update the expected values in place - no shared "accept both"
  regex helpers.
- When a feature is removed from the product (e.g. a settings block is
  gone), ask the user whether to delete the steps/locators or file a bug.

## 4. Verify fixes

- Tests run headless (already `headless: true` in config).
- **Run one targeted test per fix**: `npx playwright test <file> --project=chromium -g "<title>" --reporter=line`
  or `<file>:<line>`. Ask the user before running a whole file or many tests.
- Before handing over: `npx tsc --noEmit -p .`, then eslint and prettier on
  changed files (`git diff --name-only | xargs npx eslint`).

## 5. Product bugs

For each bug draft a report, Bugzilla style (DocSpace → section,
version from `/api/2.0/settings/version/build` if a portal is at hand):
title, steps, actual result (with the server response / exact UI text),
expected result, the affected autotest. Group related cases (e.g. all wrong
anchors on one settings page) into one bug.

After the user files it, skip the whole test - do not split it into a new
test:
- `test.skip("[Bug NNNNN] <title>", ...)`;
- put a comment above: `// Bug NNNNN: <what is broken>`;
- if there is no number yet use `[Bug]` and say a number is pending.

## 6. Hand over

Summary for the user:
- table: group → cause → what was done → verified (run/passed) or not run;
- bugs: already filed (numbers) / to file (drafts) / optional;
- what will stay red in CI and why (environment, pending bugs);
- suggested commit message in repo style (one English line, optional
  bullet body) - do not commit or open a PR unless asked.
