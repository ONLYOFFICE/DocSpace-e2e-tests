import BaseDialog from "../common/BaseDialog";

class RoomsEditDialog extends BaseDialog {
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
}

export default RoomsEditDialog;
