import { Page } from "@playwright/test";
import InfoPanel from "../common/InfoPanel";

class ContactsInfoPanel extends InfoPanel {
  constructor(page: Page) {
    super(page);
  }

  async hideRegistrationDate() {
    await this.infoPanel.getByTitle("Registration date").evaluate((el) => {
      const valueEl = el.nextElementSibling as HTMLElement | null;
      if (valueEl) valueEl.style.display = "none";
      (el as HTMLElement).style.display = "none";
    });
  }
}
export default ContactsInfoPanel;
