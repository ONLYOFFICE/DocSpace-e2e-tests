import { BrowserContext, expect, Page } from "@playwright/test";

class FilesEditor {
  protected page: Page;
  private consoleMessages: string[] = [];

  constructor(page: Page) {
    this.page = page;
  }

  setupConsoleCapture() {
    this.page.on("console", (msg) => this.consoleMessages.push(msg.text()));
  }

  async checkViewMode(timeout = 60000) {
    // Preview-opened files carry action=view in the URL — check that first.
    // Fallback to the console message for cases where the URL doesn't include it
    // (e.g. older-version opens in version_history tests).
    if (this.page.url().includes("action=view")) return;
    await expect(async () => {
      expect(
        this.consoleMessages.some((m) => m.includes("opened in mode view")),
        `view mode: neither URL action=view nor console message found.\nURL: ${this.page.url()}\nCaptured:\n${this.consoleMessages.join("\n")}`,
      ).toBe(true);
    }).toPass({ timeout });
  }

  async checkEditMode(timeout = 30000) {
    await expect(async () => {
      expect(
        this.consoleMessages.some((m) =>
          m.includes("ONLYOFFICE Document Editor is opened in mode edit"),
        ),
      ).toBe(true);
    }).toPass({ timeout });
  }

  protected get frame() {
    return this.page.frameLocator('iframe[name="frameEditor"]');
  }

  get docName() {
    return this.frame.locator("#box-doc-name");
  }

  protected get favicon() {
    return this.page.locator("#favicon");
  }

  async waitForLoad() {
    await this.page.waitForSelector('iframe[name="frameEditor"]', {
      state: "attached",
      timeout: 60000,
    });
    await expect(this.docName).toBeVisible({ timeout: 60000 });
    // CSV/TSV/TXT files show a "Choose file options" dialog after the editor
    // renders. Dismiss it so the editor finishes initialising and emits the
    // "opened in mode view/edit" console message.
    const openDialog = this.frame.locator(".asc-window.open-dlg");
    if (await openDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
      await openDialog.locator(".dlg-btn.primary").click();
    }
  }

  async waitForFrame() {
    await this.page.waitForSelector('iframe[name="frameEditor"]', {
      state: "attached",
      timeout: 60000,
    });
  }

  async waitForEditorReady() {
    const cursor = this.frame.locator("#id_target_cursor");
    await cursor.waitFor({ state: "attached", timeout: 20000 });
  }

  async typeText(text: string) {
    await this.waitForEditorReady();
    const iframe = this.page.locator('iframe[name="frameEditor"]');
    const box = await iframe.boundingBox();
    if (box) {
      await this.page.mouse.click(
        box.x + box.width / 2,
        box.y + box.height / 2,
      );
    }
    await this.page.keyboard.type(text, { delay: 100 });
  }

  async saveAndClose() {
    await this.page.keyboard.press("Control+s");
    await this.page.waitForTimeout(3000);
    await this.page.close();
  }

  async editAndClose(text: string) {
    await this.waitForLoad();
    await this.typeText(text);
    await this.saveAndClose();
  }

  async expectQuotaExceededBanner() {
    await expect(this.frame.getByText("Room space quota exceeded")).toBeVisible(
      { timeout: 15000 },
    );
  }

  async expectQuotaExceededSnackbar() {
    await expect(this.page.getByTestId("snackbar-additional-info")).toBeVisible(
      { timeout: 15000 },
    );
  }

  async expectThemeApplied(theme: "Light" | "Dark") {
    await expect(this.page.locator("html")).toHaveAttribute(
      "data-theme",
      theme.toLowerCase(),
    );
  }

  async getEditorConfig(): Promise<TDocEditorConfig> {
    const read = () =>
      this.page.evaluate(
        () =>
          (window as unknown as Record<string, unknown>)[
            "__e2eDocEditorConfig"
          ] ?? null,
      );
    await expect
      .poll(read, {
        timeout: 60000,
        message: "DocsAPI.DocEditor was not called with a config",
      })
      .not.toBeNull();
    return (await read()) as TDocEditorConfig;
  }

  async close() {
    await this.page.close();
  }
}

export type TDocEditorConfig = {
  document: {
    title: string;
    permissions: Record<string, boolean>;
    options?: {
      watermark_on_draw?: {
        paragraphs: { runs: { text: string }[] }[];
      };
    };
  };
};

// openedit is requested during SSR, so the config is captured from DocsAPI.DocEditor
function captureDocEditorConfig() {
  const store = window as unknown as Record<string, unknown>;
  let docsApi: Record<string, unknown> | undefined;

  Object.defineProperty(window, "DocsAPI", {
    configurable: true,
    get: () => docsApi,
    set: (value: Record<string, unknown> | undefined) => {
      docsApi = value;
      if (!value) return;

      let docEditor = value.DocEditor;
      Object.defineProperty(value, "DocEditor", {
        configurable: true,
        get: () => docEditor,
        set: (fn: unknown) => {
          docEditor =
            typeof fn === "function"
              ? new Proxy(fn, {
                  apply(target, thisArg, args) {
                    store["__e2eDocEditorConfig"] = args[1];
                    return Reflect.apply(target, thisArg, args);
                  },
                })
              : fn;
        },
      });
      if (docEditor) value.DocEditor = docEditor;
    },
  });
}

export async function enableEditorConfigCapture(context: BrowserContext) {
  await context.addInitScript(captureDocEditorConfig);
}

export default FilesEditor;
