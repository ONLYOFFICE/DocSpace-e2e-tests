import config from "../../config/config.js";

export class MobilePage {
  constructor(page) {
    this.page = page;

    // Banner App
    this.mobileBannerApp = "div.smartbanner-container";
    this.closeBannerApp = "button[aria-label='close']";
    this.viewButtonBannerApp = this.page.getByRole("link", { name: "View" });
  }
}
