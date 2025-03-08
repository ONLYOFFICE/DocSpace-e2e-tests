import MainPage from "../mainPage";

export class DeletionPortal extends MainPage {
  constructor(page) {
    super(page);
    this.page = page;
    this.navigateToDeletionPortal = page.getByRole("link", {
      name: "DocSpace Deletion",
    });
    this.deleteButton = page.locator("button.delete-button");
    this.navigateToDeactivation = page.getByText("Deactivate DocSpace");
    this.deactivateButton = page.locator("button.deactivate-button");
  }

  async deletionPortal() {
    await this.deleteButton.first().click();
  }

  async deactivationPortal() {
    await this.navigateToDeactivation.click();
    await this.deactivateButton.click();
  }
}
