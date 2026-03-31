import BaseEditLink from "@/src/objects/common/BaseLinkSettings";

// Link Settings panel for files (has both role and link type combo-buttons).
// Overrides comboLinkAccess to target the link type combo by its visible label.
export default class FileLinkSettings extends BaseEditLink {
  get comboLinkAccess() {
    return this.page.getByTestId("edit_link_panel_modal").getByRole("button", {
      name: /Anyone with the link|DocSpace users only/i,
    });
  }
}
