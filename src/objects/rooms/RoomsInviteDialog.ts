import { expect, Page } from "@playwright/test";
import BaseInviteDialog from "../common/BaseInviteDialog";
import BaseToast from "../common/BaseToast";
import BaseRoleAccess from "../common/BaseRoleAccess";
import InviteLinkSettingsPanel from "./InviteLinkSettingsPanel";

const ROLE_WARNING = "help-button";
const INVITE_VIA_LINK_TOGGLE = "toggle-button-icon";
const LINK_SETTINGS_ICON = "link-settings_icon";

class RoomsInviteDialog extends BaseInviteDialog {
  readonly toast: BaseToast;
  readonly inviteLinkSettings: InviteLinkSettingsPanel;
  readonly roleAccess: BaseRoleAccess;

  constructor(page: Page) {
    super(page);
    this.toast = new BaseToast(page);
    this.inviteLinkSettings = new InviteLinkSettingsPanel(page);
    this.roleAccess = new BaseRoleAccess(page);
  }

  private get roleWarning() {
    return this.page.getByTestId(ROLE_WARNING);
  }

  get inviteViaLinkToggle() {
    return this.dialog.getByTestId(INVITE_VIA_LINK_TOGGLE);
  }

  get linkSettingsIcon() {
    return this.dialog.getByTestId(LINK_SETTINGS_ICON);
  }

  async enableInviteViaLink() {
    await this.inviteViaLinkToggle.click();
    await this.toast.dismissToastSafely("Link copied to clipboard");
  }

  async openInviteLinkSettings() {
    await expect(this.linkSettingsIcon).toBeVisible();
    await this.linkSettingsIcon.click();
  }

  async saveAndCopyInviteLinkSettings() {
    await this.inviteLinkSettings.saveAndCopy();
  }

  async checkRoleWarningVisible() {
    await this.roleWarning.waitFor({ state: "visible" });
  }
}
export default RoomsInviteDialog;
