import BaseInviteDialog from "../common/BaseInviteDialog";

const ROLE_WARNING = ".role-warning";

class RoomsInviteDialog extends BaseInviteDialog {
  private get roleWarning() {
    return this.page.locator(ROLE_WARNING);
  }
  async checkRoleWarningVisible() {
    await this.roleWarning.waitFor({ state: "visible" });
  }
}
export default RoomsInviteDialog;
