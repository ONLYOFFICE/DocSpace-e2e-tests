import { Page, expect } from "@playwright/test";

export default class OnlyOfficeEditor {
  constructor(private page: Page) {}

  private editorFrameLocator() {
    return this.page.frameLocator('iframe[name="frameEditor"]');
  }

  async waitForReady(extraWaitMs: number = 0) {
    const saveBtn = this.editorFrameLocator().getByRole("button", {
      name: /(save)/i,
    });
  
    await saveBtn.waitFor({ state: "visible", timeout: 30_000 });
  
    if (extraWaitMs > 0) {
      await this.page.waitForTimeout(extraWaitMs);
    }
  }

  
  async save() {
    const frame = this.editorFrameLocator();
    const saveBtn = frame.getByRole("button", { name: /(save)/i });

    await saveBtn.click().catch(async () => {
    
      const chord = process.platform === "darwin" ? "Meta+S" : "Control+S";
      await this.page.keyboard.press(chord);
    });

    await expect
      .soft(frame.getByText(/All changes saved/i))
      .toBeVisible({ timeout: 10_000 });
  }

  private async readAllScriptsText(): Promise<string> {
    const texts = await this.page.locator("script").allTextContents();
    return texts.join("\n");
  }

  
  async expectWatermarkPresent(opts: { staticText?: string; viewerInfoText?: string } = {}) {
    await this.page.locator('script:has-text("watermark_on_draw")').first().waitFor({ timeout: 10000 });

    const scripts = await this.readAllScriptsText();
    expect(scripts).toContain('"watermark_on_draw"');   

    if (opts.staticText) {
      expect(scripts).toContain(opts.staticText);      
    }
    if (opts.viewerInfoText) {
      expect(scripts).toContain(opts.viewerInfoText); 
    }
  }

  
  async expectNoWatermark() {
    await this.page.waitForLoadState("domcontentloaded");
    await expect(this.page.locator('script:has-text("watermark_on_draw")')).toHaveCount(0);
  }


}
