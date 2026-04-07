import { expect, Page } from "@playwright/test";
import BaseInviteDialog from "../common/BaseInviteDialog";
import BaseToast from "../common/BaseToast";
import InviteLinkSettingsPanel from "../rooms/InviteLinkSettingsPanel";

const INVITE_VIA_LINK_TOGGLE = "toggle-button-container";
const LINK_SETTINGS_ICON = "link-settings_icon";
const EXTERNAL_LINK_INPUT = "invite_panel_external_link_input";

class ContactsInviteDialog extends BaseInviteDialog {
  readonly toast: BaseToast;
  readonly inviteLinkSettings: InviteLinkSettingsPanel;

  constructor(page: Page) {
    super(page);
    this.toast = new BaseToast(page);
    this.inviteLinkSettings = new InviteLinkSettingsPanel(page);
  }

  get inviteViaLinkToggle() {
    return this.dialog.getByTestId(INVITE_VIA_LINK_TOGGLE).first();
  }

  get linkSettingsIcon() {
    return this.dialog.getByTestId(LINK_SETTINGS_ICON);
  }

  get externalLinkInput() {
    return this.dialog.getByTestId(EXTERNAL_LINK_INPUT);
  }

  async enableInviteViaLink() {
    await expect(async () => {
      await this.inviteViaLinkToggle.click();
      await expect(this.externalLinkInput).toBeVisible({ timeout: 3000 });
    }).toPass({ timeout: 15000 });
  }

  async checkLinkCopiedToast() {
    await this.toast.checkToastMessage("Link copied to clipboard");
  }

  async dismissLinkCopiedToast() {
    await this.toast.dismissToastSafely("Link copied to clipboard");
  }

  async disableInviteViaLink() {
    await this.inviteViaLinkToggle.click();
  }

  async checkInviteLinkVisible() {
    await expect(this.externalLinkInput).toBeVisible();
  }

  async getInviteLinkValue(): Promise<string> {
    const input = this.externalLinkInput.locator("input");
    await expect(input).toBeVisible();
    const value = await input.inputValue();
    if (!value) throw new Error("Invite link input is empty");
    return value;
  }

  async copyInviteLink() {
    const copyButton = this.externalLinkInput.locator(".copy-link-icon");
    await expect(copyButton).toBeVisible();
    await copyButton.click();
  }

  async openInviteLinkSettings() {
    await expect(this.linkSettingsIcon).toBeVisible();
    await this.linkSettingsIcon.click();
  }

  async saveAndCopyInviteLinkSettings() {
    await this.inviteLinkSettings.saveAndCopy();
  }
}

export default ContactsInviteDialog;
