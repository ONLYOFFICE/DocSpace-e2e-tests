import { Page } from "@playwright/test";
import BaseInviteDialog from "../common/BaseInviteDialog";

class ContactsInviteDialog extends BaseInviteDialog {
  constructor(page: Page) {
    super(page);
  }
}

export default ContactsInviteDialog;
