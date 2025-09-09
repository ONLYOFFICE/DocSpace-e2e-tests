import { Page, Locator, expect } from "@playwright/test";

export default class UserData {
  constructor(private page: Page) {}

  private get usernameRoot(): Locator {
    return this.page.getByTestId("profile_username");
  }

  private static normalize(s: string) {
    return s.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }

  async getCurrentUserName(): Promise<string> {
    await expect(this.usernameRoot).toBeVisible({ timeout: 10_000 });
    const raw = await this.usernameRoot.getByTestId("text").innerText();
    return UserData.normalize(raw);
  }

  async expectCurrentUserNameIs(expected: string) {
    const got = await this.getCurrentUserName();
    await expect.soft(got).toBe(UserData.normalize(expected));
  }
}
