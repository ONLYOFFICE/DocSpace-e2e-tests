import { Browser, BrowserContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import Login from "@/src/objects/common/Login";
import RoomAnonymousView from "@/src/objects/rooms/RoomAnonymousView";
import FilesEditor from "@/src/objects/files/FilesEditor";
import MyDocuments from "@/src/objects/files/MyDocuments";
import InfoPanel from "@/src/objects/common/InfoPanel";
import MyRooms from "@/src/objects/rooms/Rooms";
import RoomInfoPanel from "@/src/objects/rooms/RoomInfoPanel";
import FilesTable from "@/src/objects/files/FilesTable";
import { waitForShareLinkResponse } from "@/src/objects/files/api";
import { ApiSDK } from "@/src/services";

/**
 * Universal helper functions for link testing
 * Can be used across different test suites (rooms, files, documents, etc.)
 */

/**
 * Type guard to ensure incognito page is initialized
 */
export function ensureIncognitoPage(
  incognitoPage: Page | null,
): asserts incognitoPage is Page {
  if (!incognitoPage) {
    throw new Error("incognitoPage is not initialized");
  }
}

/**
 * Sets up clipboard permissions for Firefox/Chrome
 */
export async function setupClipboardPermissions(page: Page) {
  const origin = new URL(page.url()).origin;
  const isFirefox =
    (await page.context().browser()?.browserType().name()) === "firefox";

  try {
    if (isFirefox) {
      await page
        .context()
        .grantPermissions(["clipboardReadWrite", "clipboard-sanitized-write"], {
          origin,
        });
    } else {
      await page
        .context()
        .grantPermissions(["clipboard-read", "clipboard-write"], { origin });
    }
    // Clear clipboard
    await page.evaluate(() => navigator.clipboard.writeText(""));
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn("Could not set up clipboard permissions:", error.message);
    } else {
      console.warn(
        "An unknown error occurred while setting up clipboard permissions",
      );
    }
  }
}

/**
 * Creates incognito context and page
 */
export async function setupIncognitoContext(
  browser: Browser,
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  return { context, page };
}

/**
 * Safely closes incognito context and page
 */
export async function cleanupIncognitoContext(
  context: BrowserContext | null,
  page: Page | null,
) {
  if (page) {
    await page.close().catch(() => {});
  }
  if (context) {
    await context.close().catch(() => {});
  }
}

/**
 * Gets link from clipboard
 */
export async function getLinkFromClipboard(page: Page): Promise<string> {
  const link = await page.evaluate(() => navigator.clipboard.readText());
  if (!link) throw new Error("Failed to get link from clipboard");
  return link;
}

/**
 * Opens link in incognito and checks Login button visibility
 */
export async function verifyLoginPageInIncognito(
  browser: Browser,
  link: string,
): Promise<void> {
  const { context, page } = await setupIncognitoContext(browser);
  await page.goto(link, { waitUntil: "domcontentloaded" });
  const incognitoLogin = new Login(page, "");
  await incognitoLogin.loginButtonVisible();
  await cleanupIncognitoContext(context, page);
}

/**
 * For anonymous page (Sign In button) - returns context and page for further use
 */
export async function verifyAnonymousPageInIncognito(
  browser: Browser,
  link: string,
): Promise<{ context: BrowserContext; page: Page }> {
  const { context, page } = await setupIncognitoContext(browser);
  await page.goto(link, { waitUntil: "domcontentloaded" });
  const roomAnonymousView = new RoomAnonymousView(page);
  await roomAnonymousView.checkSignInNotificationVisible();
  await roomAnonymousView.signInButtonVisible();
  return { context, page };
}

/**
 * Opens link in incognito and checks "Invalid link" message
 */
export async function verifyInvalidLinkMessageInIncognito(
  browser: Browser,
  link: string,
  expectedText = "Invalid link",
): Promise<void> {
  const { context, page } = await setupIncognitoContext(browser);
  await page.goto(link, { waitUntil: "domcontentloaded" });
  await expect(page.getByText(expectedText)).toBeVisible();
  await cleanupIncognitoContext(context, page);
}

/**
 * Opens file link in incognito and checks "Access denied" in iframe
 */
export async function verifyAccessDeniedInIncognito(
  browser: Browser,
  link: string,
): Promise<void> {
  const { context, page } = await setupIncognitoContext(browser);
  await page.goto(link, { waitUntil: "domcontentloaded" });
  const iframeLocator = page.locator('iframe[name="frameEditor"]');
  await iframeLocator.waitFor({ state: "visible" });
  const frame = iframeLocator.contentFrame();
  await expect(frame.getByText("Access denied Click to close")).toBeVisible();
  await cleanupIncognitoContext(context, page);
}

/**
 * Opens a link in incognito and asserts the document editor loads (the file is
 * publicly accessible to anonymous users).
 */
export async function expectEditorOpensAnonymously(
  browser: Browser,
  link: string,
): Promise<void> {
  const { context, page } = await setupIncognitoContext(browser);
  try {
    await page.goto(link, { waitUntil: "domcontentloaded" });
    await new FilesEditor(page).waitForLoad();
  } finally {
    await cleanupIncognitoContext(context, page);
  }
}

/**
 * Opens a public room link in incognito and asserts the anonymous room view
 * loads (the "Sign in" button is shown to the unauthenticated visitor).
 */
export async function expectRoomOpensAnonymously(
  browser: Browser,
  link: string,
): Promise<void> {
  const { context, page } = await setupIncognitoContext(browser);
  try {
    await page.goto(link, { waitUntil: "domcontentloaded" });
    await new RoomAnonymousView(page).signInButtonVisible();
  } finally {
    await cleanupIncognitoContext(context, page);
  }
}

/**
 * Creates a document in My Documents and a sharing link on it via
 * "Create and copy", leaving the share panel open. When `apiSdk` is given the
 * document is created via API as the owner (robust); otherwise it is created
 * in the UI as the currently logged-in user. The link type reflects the
 * current Access Control settings. Returns the link URL.
 */
export async function createSharedLinkOnNewDocument(
  page: Page,
  portalDomain: string,
  docName: string,
  apiSdk?: ApiSDK,
): Promise<string> {
  const myDocuments = new MyDocuments(page, portalDomain);
  const infoPanel = new InfoPanel(page);

  if (apiSdk) {
    await apiSdk.files.createFileInMyDocuments("owner", { title: docName });
    await myDocuments.open();
  } else {
    await myDocuments.open();
    await myDocuments.createDocumentFile(docName);
  }
  await myDocuments.filesTable.checkRowExist(docName);
  await myDocuments.filesTable.openContextMenuForItem(docName);
  await myDocuments.filesTable.contextMenu.clickSubmenuOption(
    "Share",
    "Sharing settings",
  );
  await infoPanel.checkShareExist();

  const linkPromise = waitForShareLinkResponse(page);
  await infoPanel.createFirstSharedLink();
  const link = await linkPromise;
  await myDocuments.dismissToastSafely("Link copied to clipboard");

  return link;
}

type RoomShareEntry = { sharedTo?: { shareLink?: string } };
type RoomShareBody = { response?: RoomShareEntry[] | RoomShareEntry };

/** Extracts all sharing-link URLs from a room share/links response body. */
function extractRoomShareLinks(body: RoomShareBody): string[] {
  const r = body?.response;
  const entries = Array.isArray(r) ? r : r ? [r] : [];
  return entries
    .map((e) => e.sharedTo?.shareLink)
    .filter((l): l is string => Boolean(l));
}

/**
 * Creates a Public room, opens its members/links panel in the UI, and returns
 * its general sharing link captured from the room share response (waiting for
 * the response that actually carries a link).
 */
export async function getPublicRoomLink(
  page: Page,
  portalDomain: string,
  apiSdk: ApiSDK,
  roomTitle: string,
): Promise<string> {
  await apiSdk.rooms.createRoom("owner", {
    title: roomTitle,
    roomType: "PublicRoom",
  });

  const myRooms = new MyRooms(page, portalDomain);
  const roomInfoPanel = new RoomInfoPanel(page);

  // Set up the response waiter before the navigation that triggers it.
  const linkResponse = page.waitForResponse(async (resp) => {
    if (
      resp.status() !== 200 ||
      !resp.url().includes("/api/2.0/files/rooms/") ||
      !resp.url().includes("/share")
    ) {
      return false;
    }
    try {
      return extractRoomShareLinks(await resp.json()).length > 0;
    } catch {
      return false;
    }
  }, {});

  await myRooms.openWithoutEmptyCheck();
  await myRooms.roomsTable.openRoomByName(roomTitle);
  await roomInfoPanel.open();
  await roomInfoPanel.openTab("Contacts");

  const links = extractRoomShareLinks(await (await linkResponse).json());
  if (!links.length) throw new Error("room sharing link not found in response");
  return links[0];
}

/**
 * Creates a room with a file inside it (via API), opens the room, and creates
 * an external sharing link on that file via "Copy shared link". Returns the
 * link URL. The link type reflects the current Access Control settings.
 */
export async function getRoomFileLink(
  page: Page,
  portalDomain: string,
  apiSdk: ApiSDK,
  roomTitle: string,
  fileName: string,
): Promise<string> {
  const roomResp = await apiSdk.rooms.createRoom("owner", {
    title: roomTitle,
    roomType: "CustomRoom",
  });
  const roomId = (await roomResp.json()).response.id;
  await apiSdk.files.createFile("owner", roomId, { title: fileName });

  const myRooms = new MyRooms(page, portalDomain);
  await myRooms.openWithoutEmptyCheck();
  await myRooms.roomsTable.openRoomByName(roomTitle);

  const filesTable = new FilesTable(page);
  await filesTable.checkRowExist(fileName);

  const linkPromise = waitForShareLinkResponse(page);
  await filesTable.openContextMenuForItem(fileName);
  await filesTable.contextMenu.clickSubmenuOption("Share", "Copy shared link");
  const link = await linkPromise;
  await myRooms.dismissToastSafely("Link copied to clipboard");

  return link;
}
