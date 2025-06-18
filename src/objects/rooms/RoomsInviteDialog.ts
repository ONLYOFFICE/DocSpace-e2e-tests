import BaseDialog from "../common/BaseDialog";

const ACCESS_SELECTOR = ".access-selector";

class RoomsInviteDialog extends BaseDialog {
  async checkInviteTitleExist() {
    await this.checkDialogTitleExist("Invite");
  }

  private get accessSelector() {
    return this.page.locator(ACCESS_SELECTOR);
  }

  async openAccessSelector() {
    await this.accessSelector.click();
  }
}

export default RoomsInviteDialog;
