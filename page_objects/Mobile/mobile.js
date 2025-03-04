export class MobilePage {
  constructor(page) {
    this.page = page;
    // Banner App
    this.mobileBannerApp = "div.smartbanner-container";
    this.closeBannerApp = "button[aria-label='close']";
    this.viewButtonBannerApp = this.page.getByRole("link", { name: "View" });
    // Hide/Show left menu
    this.hideLeftMenu = "#document_catalog-hide-menu";
    this.showLeftMenu = "#document_catalog-show-menu";
    // Navigation
    this.mobileMenuButton = "path";
    this.roomsListSelector = "div[id='document_catalog-shared']";
    this.contactsLink = "div[id='document_catalog-accounts']";
  }
  async rotateDevice(device) {
    await this.page.setViewportSize({
      width: device.viewport.height,
      height: device.viewport.width,
    });
  }
}
