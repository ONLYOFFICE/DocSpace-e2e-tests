import { Browser, BrowserContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import Login from "@/src/objects/common/Login";
import RoomAnonymousView from "@/src/objects/rooms/RoomAnonymousView";
import FilesTable from "@/src/objects/files/FilesTable";
import MyRooms from "@/src/objects/rooms/Rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import RoomEmptyView from "@/src/objects/rooms/RoomEmptyView";
import RoomSelectPanel from "@/src/objects/rooms/RoomSelectPanel";

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
  await roomAnonymousView.singInButtonVisible();
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
 * Copies shared link for a file using context menu
 */
export async function copyFileLink(
  page: Page,
  filesTable: FilesTable,
  myRooms: MyRooms,
): Promise<string> {
  await setupClipboardPermissions(page);
  await filesTable.openContextMenuForItem("ONLYOFFICE Resume Sample");
  await filesTable.contextMenu.clickSubmenuOption("Share", "Copy shared link");
  await myRooms.toast.dismissToastSafely("Link copied to clipboard", 5000);
  return await getLinkFromClipboard(page);
}

/**
 * Uploads PDF and verifies it's visible
 */
export async function uploadAndVerifyPDF(
  shortTour: ShortTour,
  roomEmptyView: RoomEmptyView,
  selectPanel: RoomSelectPanel,
  myRooms: MyRooms,
  page: Page,
  skipTour = true,
): Promise<void> {
  if (skipTour) {
    await shortTour.clickSkipTour();
  }
  await roomEmptyView.uploadPdfFromDocSpace();
  await selectPanel.checkSelectorExist();
  await selectPanel.select("documents");
  await selectPanel.selectItemByText("ONLYOFFICE Resume Sample");
  await selectPanel.confirmSelection();
  await shortTour.clickModalCloseButton().catch(() => {});
  await myRooms.infoPanel.close();
  await expect(page.getByLabel("ONLYOFFICE Resume Sample,")).toBeVisible();
}
