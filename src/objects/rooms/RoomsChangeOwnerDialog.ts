import { expect } from "@playwright/test";
import BaseDialog from "../common/BaseDialog";

class RoomsChangeOwnerDialog extends BaseDialog {
  async checkNoMembersFoundExist() {
    await expect(this.dialog.getByText("No members found")).toBeVisible();
  }
}

export default RoomsChangeOwnerDialog;
