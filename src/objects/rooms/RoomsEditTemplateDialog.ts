import BaseDialog from "../common/BaseDialog";

class RoomsEditTemplateDialog extends BaseDialog {
  private get nameInput() {
    return this.page.getByTestId("create_edit_room_input");
  }

  private get saveButton() {
    return this.page.getByRole("button", { name: "Save" });
  }

  async checkDialogTitleExist() {
    await super.checkDialogTitleExist("Edit template");
  }

  async fillTemplateName(name: string) {
    await this.fillInput(this.nameInput, name);
  }

  async clickSaveButton() {
    await this.clickSubmitButton(this.saveButton);
  }
}

export default RoomsEditTemplateDialog;
