import { expect, Page } from "@playwright/test";
import BaseInviteDialog from "../common/BaseInviteDialog";
import BaseToast from "../common/BaseToast";
import BaseRoleAccess, { type RoleAccessType } from "../common/BaseRoleAccess";
import InviteLinkSettingsPanel from "./InviteLinkSettingsPanel";
import RoomContactsPanel from "./RoomContactsPanel";

const ROLE_WARNING = "help-button";
const CHOOSE_FROM_LIST_LINK = "invite_panel_choose_from_list_link";
const INVITE_VIA_LINK_TOGGLE = "toggle-button-icon";
const LINK_SETTINGS_ICON = "link-settings_icon";
const INVITE_ITEM_ACCESS_SELECTOR = "invite_panel_item_access_selector";

class RoomsInviteDialog extends BaseInviteDialog {
  readonly contactsPanel: RoomContactsPanel;
  readonly toast: BaseToast;
  readonly inviteLinkSettings: InviteLinkSettingsPanel;
  readonly roleAccess: BaseRoleAccess;

  constructor(page: Page) {
    super(page);
    this.contactsPanel = new RoomContactsPanel(page);
    this.toast = new BaseToast(page);
    this.inviteLinkSettings = new InviteLinkSettingsPanel(page);
    this.roleAccess = new BaseRoleAccess(page);
  }

  private get roleWarning() {
    return this.page.getByTestId(ROLE_WARNING);
  }

  private get chooseFromListLink() {
    return this.page.getByTestId(CHOOSE_FROM_LIST_LINK);
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

  async openPeopleList() {
    await this.chooseFromListLink.click();
  }

  async selectRole(role: RoleAccessType) {
    const comboButton = this.page
      .getByTestId(INVITE_ITEM_ACCESS_SELECTOR)
      .locator('[data-test-id="combo-button"]');
    await expect(comboButton).toBeVisible();
    await comboButton.click();
    await this.page.locator(`[data-key="${role}"]`).click();
  }
}
export default RoomsInviteDialog;
