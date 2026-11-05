import { expect, Locator, Page } from "@playwright/test";
import Files from "./Files";

const MORE_OPTIONS = "More options";
const MORE = "More";
const MODAL_DIALOG = "modal-dialog";

// What enabled plugins add to My Documents: items under New > More, items under
// a file's More options, and the modal dialogs they open.
class FilesPlugins {
  private page: Page;
  private files: Files;

  constructor(page: Page, files: Files) {
    this.page = page;
    this.files = files;
  }

  // Modal dialogs stay mounted after they close (e.g. "Top up credits"), so a
  // plugin dialog is found by its visible title, not as "the" modal dialog.
  dialog(title: string | RegExp): Locator {
    return this.page
      .getByTestId(MODAL_DIALOG)
      .filter({ hasText: title, visible: true })
      .last();
  }

  // Plugins register their file actions a moment after the list renders, so
  // a menu opened too early has only the built-in More options - reopen it
  // until the plugin item is there.
  async runFileAction(fileTitle: string, action: string) {
    const menu = this.files.filesTable.contextMenu;
    await expect(async () => {
      await this.page.keyboard.press("Escape");
      await this.files.filesTable.openContextMenuForItem(fileTitle, true);
      await menu.hoverOption(MORE_OPTIONS);
      await expect(menu.submenu.getByText(action, { exact: true })).toBeVisible(
        { timeout: 2000 },
      );
    }).toPass({ timeout: 30000 });
    await menu.submenu.getByText(action, { exact: true }).click();
  }

  async createFromMoreMenu(item: string) {
    await this.files.filesNavigation.openCreateDropdown();
    await this.files.filesNavigation.contextMenu.clickSubmenuOption(MORE, item);
  }

  // Click on the file name - plugins that register a file type open it in
  // their own dialog. Right after the list renders the plugin's handler may
  // not be attached yet and the click does nothing, so click until the
  // dialog is there.
  async openFileInPlugin(fileTitle: string, dialogTitle: string | RegExp) {
    const name = this.page
      .locator(".table-list-item.window-item")
      .getByText(fileTitle, { exact: true })
      .first();
    await expect(async () => {
      await name.click();
      await expect(this.dialog(dialogTitle)).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 30000 });
  }

  async expectDialogOpened(title: string | RegExp) {
    await expect(this.dialog(title)).toBeVisible({ timeout: 30000 });
  }

  // The text may be in the dialog itself or in an iframe the plugin renders
  // its content into (markdown preview, readers).
  async expectDialogText(title: string | RegExp, text: string) {
    const dialog = this.dialog(title);
    await expect(async () => {
      const inDialog = await dialog
        .getByText(text, { exact: false })
        .first()
        .isVisible();
      const inFrame = await dialog
        .frameLocator("iframe")
        .getByText(text, { exact: false })
        .first()
        .isVisible()
        .catch(() => false);
      expect(inDialog || inFrame, `"${text}" in dialog "${title}"`).toBe(true);
    }).toPass({ timeout: 30000 });
  }

  // Image readers/editors draw the content as <img> or <canvas>
  async expectDialogImage(title: string | RegExp) {
    const dialog = this.dialog(title);
    await expect(async () => {
      const inDialog = await dialog
        .locator("img, canvas")
        .filter({ visible: true })
        .count();
      const inFrame = await dialog
        .frameLocator("iframe")
        .locator("img, canvas")
        .count()
        .catch(() => 0);
      expect(inDialog + inFrame, `image in dialog "${title}"`).toBeGreaterThan(
        0,
      );
    }).toPass({ timeout: 30000 });
  }

  // Plugins that host a third-party editor (draw.io) open it in an iframe
  async expectFrameOpened(src: RegExp) {
    await expect
      .poll(
        async () =>
          (
            await this.page
              .locator("iframe")
              .evaluateAll((frames) =>
                frames.map((f) => (f as HTMLIFrameElement).src),
              )
          ).some((s) => src.test(s)),
        { timeout: 30000 },
      )
      .toBe(true);
  }

  // A plugin that writes its result next to the source (converted PDF, text
  // transcript, extracted folder) gives it the same title, so count the rows.
  // No reload while waiting: the plugin does the work in this page, a reload
  // would abort it; the new file arrives in the list over the socket.
  // `failOnToast` fails right away on the plugin's error toast instead of
  // waiting out the timeout.
  async expectFileCount(
    fileTitle: string,
    count: number,
    {
      timeout = 90000,
      failOnToast,
    }: { timeout?: number; failOnToast?: string } = {},
  ) {
    const rows = await this.files.filesTable.getRowByTitle(fileTitle);
    const errorToast = this.page
      .locator("#toast-container [role='alert']")
      .filter({ hasText: failOnToast ?? /$^/ });
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (failOnToast && (await errorToast.count()) > 0) {
        throw new Error(`Plugin reported: "${failOnToast}"`);
      }
      if ((await rows.count()) === count) return;
      await this.page.waitForTimeout(1000);
    }
    await expect(rows).toHaveCount(count, { timeout: 1000 });
  }

  async clickDialogButton(title: string | RegExp, button: string) {
    const target = this.dialog(title).getByRole("button", {
      name: button,
      exact: true,
    });
    await expect(target).toBeEnabled();
    await target.click();
  }

  async closeDialog(title: string | RegExp) {
    await expect(async () => {
      await this.page.keyboard.press("Escape");
      await expect(this.dialog(title)).toBeHidden({ timeout: 2000 });
    }).toPass({ timeout: 10000 });
  }

  // "Create diagram" / "Create markdown" / "Create text file": one name input
  async fillCreateDialog(title: string, name: string) {
    const input = this.dialog(title).locator("input:visible").first();
    await expect(input).toBeVisible();
    await input.fill(name);
    await this.clickDialogButton(title, "Create");
  }

  // "Create new URL": URL first, then Title
  async createUrlFile(url: string, title: string) {
    const inputs = this.dialog("Create new URL").locator("input:visible");
    await inputs.nth(0).fill(url);
    await inputs.nth(1).fill(title);
    await this.clickDialogButton("Create new URL", "Create");
  }

  // The plugin uploads the new file in the background after the dialog
  // closes; navigating away aborts that upload (upload/create_session gets
  // cancelled), so wait for the row in the current list - it is added via
  // the socket once the upload finishes.
  async expectFileInList(fileTitle: string) {
    await expect(async () => {
      await this.files.filesTable.checkRowExist(fileTitle);
    }).toPass({ timeout: 60000 });
  }
}

export default FilesPlugins;
