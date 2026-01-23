import BaseInviteDialog from "../common/BaseInviteDialog";

const ROLE_WARNING = "help-button";

class RoomsInviteDialog extends BaseInviteDialog {
  private get roleWarning() {
    return this.page.getByTestId(ROLE_WARNING);
  }
  async checkRoleWarningVisible() {
    await this.roleWarning.waitFor({ state: "visible" });
  }
}
export default RoomsInviteDialog;
