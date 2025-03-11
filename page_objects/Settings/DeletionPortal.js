import MainPage from "../mainPage";

export class DeletionPortal extends MainPage {
  constructor(page) {
    super(page);
    this.page = page;
    this.navigateToDeletionPortal = page.getByRole("link", {
      name: "DocSpace Deletion",
    });
    this.deleteButton = page.locator(".delete-button");
    this.navigateToDeactivation = page.getByText("Deactivate DocSpace");
    this.deactivateButton = page.locator(".deactivate-button");
  }

  async deletionPortal() {
    await this.deleteButton.nth(0).click();
  }

  async deactivationPortal() {
    await this.navigateToDeactivation.click();
    await this.deactivateButton.click();
  }
}
