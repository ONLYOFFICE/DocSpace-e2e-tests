import { Page } from "@playwright/test";
import BaseInviteDialog from "../common/BaseInviteDialog";
import ContactsPanel from "./ContactsPanel";

const ROLE_WARNING = "help-button";
const CHOOSE_FROM_LIST_LINK = "invite_panel_choose_from_list_link";

class RoomsInviteDialog extends BaseInviteDialog {
  readonly contactsPanel: ContactsPanel;

  constructor(page: Page) {
    super(page);
    this.contactsPanel = new ContactsPanel(page);
  }

  private get roleWarning() {
    return this.page.getByTestId(ROLE_WARNING);
  }
  private get chooseFromListLink() {
    return this.page.getByTestId(CHOOSE_FROM_LIST_LINK);
  }
  async checkRoleWarningVisible() {
    await this.roleWarning.waitFor({ state: "visible" });
  }
  async openPeopleList() {
    await this.chooseFromListLink.click();
  }
}
export default RoomsInviteDialog;
