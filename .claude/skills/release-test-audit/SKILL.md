---
name: release-test-audit
description: Pre-release overview of e2e coverage - which product areas are covered and green, where the gaps are (areas not covered, new features without tests, whole suites skipped), which skips are still in place, plus flaky tests. Use before a release or when asked what is covered, where the gaps are, or which skips are still in place.
---

# Pre-release e2e overview

Goal: a picture of the release from the tests' side - what works, what is
not covered, what is known broken. This is a review: report and propose; change code only when the user agrees.

## 1. Collect

1. **Last CI run** - the same parser as `/fix-last-run`:
   ```bash
   python3 .claude/skills/fix-last-run/extract_failures.py
   ```
   Run numbers and failure groups go to stdout; `per_spec.json` has, per
   spec file, tests run / skipped / failed / flaky (chromium, each test once).
2. **Skips in code:**
   ```bash
   grep -rnE "test(\.describe)?\.(skip|fixme|fail)\(" src/tests
   ```
   Read a few lines around each hit: the comment above and a bug number
   (`[Bug NNNNN]` in the title or `// Bug NNNNN` above) say why it is skipped.
3. **Excluded on purpose:** `testIgnore` in `playwright.config.ts`.

## 2. Areas: the product picture

Build the table by **product area**, not by test folder - map spec files
(`per_spec.json`) onto the product: Files (My documents, sharing,
trash, versions, conversion, PDF forms), Rooms (each room type, access by
role, templates, archive, tags/groups, history), Forms, AI, Contacts, Profile, Login/auth, each Settings
section, Developer tools, Billing, Plugins, Dashboard/tours, Emails,
real-time (sockets).

For every area give:
- **coverage**: strong / partial / weak / none - with the number of running
  tests and what they check in a few words;
- **systemic problems only**: an open bug behind a skip, a whole group of
  tests failing for one reason, the environment blocking the area in CI
  (then it is not really checked), a feature replaced and its tests skipped;
- the last run is a health signal, not the content: **do not list one-off
  failures or single flaky tests** - they go to `/fix-last-run`.

## 3. Gaps

Look for areas the release ships but tests do not check:
1. **Whole suites skipped** (`describe.skip`) - read the reason; a feature
   that was replaced often means the new one has no tests.
2. **New product features without tests.** Compare the product with the
   suite: open a stand (headless script or the user's portal) and walk the
   navigation - apps, their sub-items, settings sections, room types, the
   create menu. For each, is there a spec folder / page object? New things
   with no specs are gaps.
3. **Areas with only a few tests** compared with the size of the feature.

## 4. Skips that are still in place

For every skip say what it waits for:
- **with a bug** - a known product issue in the release; list area, test,
  bug number. The user checks bug statuses; if a bug is said to be fixed -
  remove `.skip`, run that one test, keep it if it passes.
- **without a bug** - classify from the comment: feature removed/replaced
  (rewrite or delete - ask), feature temporarily hidden (check the stand -
  back? unskip candidate), environment (expired key, mail, VPN), real
  product problem without a bug (draft a bug, then `[Bug NNNNN]`).
- **conditional** (browser, missing env key) - is the reason still valid?
- `test.fail(...)` - if the bug is fixed the test turns red (unexpected
  pass); flip it back to a normal test.

## 5. Debt (only if the user asks - never in the release report)

Test-code debt is about the tests, not the product: keep it out of the
report. If asked, grep for it and give counts, top files and a short plan:
raw `page.locator`/`getBy` in specs and `test` from `@playwright/test`
(break CLAUDE.md rules), `waitForTimeout` and `force: true` (flakiness -
cross-check with flaky tests), commented-out code, "temporary"/TODO notes.

## 6. Report

For the team:
- headline: last run numbers (total / passed / failed / flaky / skipped);
- areas: coverage level per product area + systemic problems (no one-off
  failures);
- gaps: new features without tests, skipped suites;
- skips still in place: with bugs (known issues in the release), without
  bugs (decision needed);
- proposed next steps.

The report is about the product for the team: leave out test-code internals
(debt counters, dead page objects, empty test folders, locator style).
Publish it as a page and give the link.
Code changes (unskips) - list them and suggest a commit message; do not
commit unless asked.

## Rules

- Never unskip a test without running it once.
- Run tests headless, one targeted test per change; ask before running a
  whole file or many tests.
- Do not mask product bugs to make the suite green.
