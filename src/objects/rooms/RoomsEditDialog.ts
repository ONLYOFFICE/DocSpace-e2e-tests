import BaseDialog from "../common/BaseDialog";

class RoomsEditDialog extends BaseDialog {
  async checkDialogTitleExist() {
    await super.checkDialogTitleExist("Room editing");
  }

  async fillRoomName(name: string) {
    await this.fillInput(
      this.page.getByRole("textbox", { name: "Name:" }),
      name,
    );
  }

  async clickSaveButton() {
    await this.clickSubmitButton(
      this.page.getByRole("button", { name: "Save" }),
    );
  }

  async clickCloseButton() {
    await this.dialogHeader
      .getByTestId("aside_header_close_icon_button")
      .click();
  }
}

export default RoomsEditDialog;
