# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow: writing a new test with Claude

Describe the test in plain language (feature area + user steps). Claude will read the relevant page objects and generate a test file in `src/tests/e2e/`.

Example prompts:
- _"Write a test for My Documents: user creates a document, renames it, then deletes it"_
- _"Add a test that checks the Rooms filter by type works correctly"_

**When Claude generates a test, it must:**
- Import `test` from `@/src/fixtures` (never from `@playwright/test` directly)
- Use the `{ page, api, login }` fixture in `beforeEach`
- Instantiate the page object with `new PageObject(page, api.portalDomain)`
- Call `await login.loginToPortal()` in `beforeEach`
- Use `test.step()` to group logical actions within a test
- Never use raw `page.locator()` or `page.click()` directly — always go through page object methods

## Project Structure

```
src/
  fixtures/index.ts    # Custom test fixtures — always import `test` from here
  objects/             # Page Object Models by feature
    common/            # Base classes reused everywhere
    files/             # My Documents, Folder, Favorites, Recent, SharedWithMe
    rooms/             # Rooms, room dialogs, room table, etc.
    contacts/          # Contacts page
    archive/           # Archive page
    trash/             # Trash page
    settings/          # Settings sub-pages
    ai/                # AI Agents page
    profile/           # Profile page
  tests/e2e/           # E2E test specs (the only test type in this repo)
  utils/
    constants/         # Text constants for rooms, files, contacts, etc.
    helpers/           # faker (random test data), linkTest
    types/             # TypeScript types
  constants/           # Download format constants
```

## Page Objects Map

| Feature area        | Page Object class | File path |
|---------------------|-------------------|-----------|
| My Documents        | `MyDocuments`     | `src/objects/files/MyDocuments.ts` |
| Rooms list          | `MyRooms` (exported as `Rooms`) | `src/objects/rooms/Rooms.ts` |
| Folder inside docs  | `Folder`          | `src/objects/files/Folder.ts` |
| Trash               | `Trash`           | `src/objects/trash/Trash.ts` |
| Archive             | `Archive`         | `src/objects/archive/Archive.ts` |
| Contacts            | `Contacts`        | `src/objects/contacts/Contacts.ts` |
| Profile             | `Profile`         | `src/objects/profile/Profile.ts` |
| AI Agents           | `AiAgents`        | `src/objects/ai/AiAgents.ts` |
| Settings > Security | `Security`        | `src/objects/settings/security/Security.ts` |
| Settings > Backup   | `Backup`          | `src/objects/settings/backup/Backup.ts` |
| Settings > Payments | `Payments`        | `src/objects/settings/payments/Payments.ts` |

## Architecture

### Test Fixtures (`src/fixtures/index.ts`)

All tests import `test` from `@/src/fixtures`. The custom `test` extends Playwright's base with:

- `api` — creates a fresh isolated DocSpace portal via API, authenticates as owner, tears down the portal after the test completes. Each test gets its own clean portal.
- `login` — a `Login` page object pre-configured with the current test's portal domain.
- `page` — extended to block analytics and inject `localStorage.integrationUITests = true`.

### Page Object Model

- `BasePage` (`src/objects/common/BasePage.ts`) — root class for all feature pages. Provides `article`, `toast`, `navigateToSettings()`, `waitForDownload()`.
- Feature pages (e.g., `MyDocuments`, `MyRooms`) compose sub-objects per UI region: `filesTable`, `filesFilter`, `filesNavigation`, `infoPanel`, dialogs, etc.
- Locators use `data-testid` attributes wherever possible.

### Typical E2E test pattern

```typescript
import MyDocuments from "@/src/objects/files/MyDocuments";
import { test } from "@/src/fixtures";

test.describe("My Documents: <feature name>", () => {
  let myDocuments: MyDocuments;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    await login.loginToPortal();
    await myDocuments.open();
  });

  test("<test name>", async () => {
    await test.step("<step description>", async () => {
      // use page object methods only
    });

    await test.step("<next step>", async () => {
      // ...
    });
  });
});
```

### Path alias

`@/` maps to the repo root (`tsconfig.json` paths). Use it for all imports.
