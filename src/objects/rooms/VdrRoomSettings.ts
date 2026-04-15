import { expect, Page } from "@playwright/test";
import { DOC_ACTIONS } from "@/src/utils/constants/files";
import FilesNavigation from "../files/FilesNavigation";

const TOGGLE_INPUT = "toggle-button-input";
const TOGGLE_LABEL = "toggle-button-container";

const VDR_AUTOMATIC_INDEXING = "virtual_data_room_automatic_indexing";
const VDR_FILE_LIFETIME = "virtual_data_room_file_lifetime";
const VDR_FILE_LIFETIME_INPUT = "virtual_data_room_file_lifetime_input";
const VDR_FILE_LIFETIME_PERIOD =
  "virtual_data_room_file_lifetime_period_combobox";
const VDR_FILE_LIFETIME_DELETE =
  "virtual_data_room_file_lifetime_delete_combobox";
const VDR_RESTRICT_COPY_DOWNLOAD = "virtual_data_room_restrict_copy_download";
const VDR_ADD_WATERMARKS = "virtual_data_room_add_watermarks";
const VDR_WATERMARKS_RADIO_VIEWER_INFO =
  "virtual_data_room_watermarks_radio_viewer_info";
const VDR_WATERMARKS_RADIO_IMAGE = "virtual_data_room_watermarks_radio_image";
const VDR_WATERMARK_TAB_USERNAME = "virtual_data_room_watermark_tab_username";
const VDR_WATERMARK_TAB_EMAIL = "virtual_data_room_watermark_tab_useremail";
const VDR_WATERMARK_TAB_IP = "virtual_data_room_watermark_tab_useripadress";
const VDR_WATERMARK_TAB_DATE = "virtual_data_room_watermark_tab_currentdate";
const VDR_WATERMARK_TAB_ROOM_NAME = "virtual_data_room_watermark_tab_roomname";
const VDR_WATERMARK_TEXT_INPUT = "virtual_data_room_watermark_text_input";
const VDR_WATERMARK_POSITION = "virtual_data_room_watermark_position_combobox";

// Edit index toolbar
const INDEX_REORDER_BUTTON = "table_group_menu_item_reorder-index";
const INDEX_SAVE_BUTTON = "table_group_menu_item_save-index";
const INDEX_TOOLBAR = "table-group-menu";
const REORDER_CONFIRM_BUTTON = "#create-room";

class VdrRoomSettings {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async toggleAutomaticIndexing(enable: boolean) {
    await this.toggleBlock(VDR_AUTOMATIC_INDEXING, enable);
  }

  async toggleRestrictCopyAndDownload(enable: boolean) {
    await this.toggleBlock(VDR_RESTRICT_COPY_DOWNLOAD, enable);
  }

  async toggleFileLifetime(enable: boolean) {
    await this.toggleBlock(VDR_FILE_LIFETIME, enable);
  }

  async toggleWatermarks(enable: boolean) {
    await this.toggleBlock(VDR_ADD_WATERMARKS, enable);
  }

  async setFileLifetimeDays(days: number) {
    const input = this.page.getByTestId(VDR_FILE_LIFETIME_INPUT);
    await input.fill(days.toString());
    await expect(input).toHaveValue(days.toString());
  }

  async selectFileLifetimeUnit(unit: "Days" | "Months" | "Years") {
    const comboBox = this.page.getByTestId(VDR_FILE_LIFETIME_PERIOD);
    await comboBox.click();
    await this.page.getByRole("option", { name: unit }).click();
    await expect(comboBox).toContainText(unit);
  }

  async selectFileLifetimeAction(
    action: "Move to Trash" | "Delete permanently",
  ) {
    const comboBox = this.page.getByTestId(VDR_FILE_LIFETIME_DELETE);
    await comboBox.click();
    await this.page.getByRole("option", { name: action }).click();
    await expect(comboBox).toContainText(action);
  }

  // --- Watermarks ---

  async selectWatermarkType(type: "Viewer info" | "Image") {
    const block = this.page.getByTestId(VDR_ADD_WATERMARKS);
    const testId =
      type === "Viewer info"
        ? VDR_WATERMARKS_RADIO_VIEWER_INFO
        : VDR_WATERMARKS_RADIO_IMAGE;
    const option = block.getByTestId(testId);

    await option.click();
    await expect(option.locator("input[type='radio']")).toBeChecked();
  }

  async selectWatermarkUserName() {
    await this.selectWatermarkTab(VDR_WATERMARK_TAB_USERNAME);
  }

  async selectWatermarkUserEmail() {
    await this.selectWatermarkTab(VDR_WATERMARK_TAB_EMAIL);
  }

  async selectWatermarkUserIpAddress() {
    await this.selectWatermarkTab(VDR_WATERMARK_TAB_IP);
  }

  async selectWatermarkCurrentDate() {
    await this.selectWatermarkTab(VDR_WATERMARK_TAB_DATE);
  }

  async selectWatermarkRoomName() {
    await this.selectWatermarkTab(VDR_WATERMARK_TAB_ROOM_NAME);
  }

  async uploadWatermarkImage(filePath: string) {
    const fileInput = this.page
      .getByTestId(VDR_ADD_WATERMARKS)
      .locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  async setWatermarkStaticText(text: string) {
    const input = this.page.getByTestId(VDR_WATERMARK_TEXT_INPUT);
    await input.fill(text);
    await expect(input).toHaveValue(text);
  }

  async selectWatermarkPosition(position: string) {
    const comboBox = this.page.getByTestId(VDR_WATERMARK_POSITION);
    await comboBox.click();
    await this.page.getByRole("option", { name: position }).click();
    await expect(comboBox).toContainText(position);
  }

  async expectAutomaticIndexingChecked(checked: boolean) {
    await this.expectBlockChecked(VDR_AUTOMATIC_INDEXING, checked);
  }

  async expectFileLifetimeChecked(checked: boolean) {
    await this.expectBlockChecked(VDR_FILE_LIFETIME, checked);
  }

  async expectRestrictCopyAndDownloadChecked(checked: boolean) {
    await this.expectBlockChecked(VDR_RESTRICT_COPY_DOWNLOAD, checked);
  }

  async expectWatermarksChecked(checked: boolean) {
    await this.expectBlockChecked(VDR_ADD_WATERMARKS, checked);
  }

  async expectWatermarkTypeSelected(type: "Viewer info" | "Image") {
    const testId =
      type === "Viewer info"
        ? VDR_WATERMARKS_RADIO_VIEWER_INFO
        : VDR_WATERMARKS_RADIO_IMAGE;
    const radio = this.page.getByTestId(testId).locator("input[type='radio']");
    await expect(radio).toBeChecked();
  }

  async expectWatermarkPosition(position: string) {
    const comboBox = this.page.getByTestId(VDR_WATERMARK_POSITION);
    await expect(comboBox).toContainText(position);
  }

  async createDocument(filesNavigation: FilesNavigation, name: string) {
    await filesNavigation.openCreateDropdown();
    await filesNavigation.selectCreateAction(DOC_ACTIONS.CREATE_DOCUMENT);
    await filesNavigation.modal.fillCreateTextInput(name);
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page", { timeout: 5000 }),
      filesNavigation.modal.clickCreateButton(),
    ]).catch(() => [null]);
    await newPage?.close();
    await expect(
      this.page.locator(`[data-title="${name}.docx"]`),
    ).toBeVisible();
  }

  async expectIndexToolbarVisible() {
    await expect(this.page.getByTestId(INDEX_TOOLBAR)).toBeVisible();
  }

  async clickReorderIndex() {
    await this.page.getByTestId(INDEX_REORDER_BUTTON).click();
    await expect(this.page.locator(REORDER_CONFIRM_BUTTON)).toBeVisible();
    await this.page.locator(REORDER_CONFIRM_BUTTON).click();
  }

  async clickApplyIndex() {
    await this.page.getByTestId(INDEX_SAVE_BUTTON).click();
  }

  async expectIndexValue(rowIndex: number, expectedValue: string) {
    const cell = this.page.getByTestId(`index_cell_order_${rowIndex}`);
    await expect(cell).toContainText(expectedValue);
  }

  private async toggleBlock(blockTestId: string, enable: boolean) {
    const block = this.page.getByTestId(blockTestId);
    const checkbox = block.getByTestId(TOGGLE_INPUT);
    const label = block.getByTestId(TOGGLE_LABEL);

    const isChecked = await checkbox.isChecked();
    if (isChecked !== enable) {
      await label.click();
    }
    await expect(checkbox).toBeChecked({ checked: enable });
  }

  private async expectBlockChecked(blockTestId: string, checked: boolean) {
    const checkbox = this.page
      .getByTestId(blockTestId)
      .getByTestId(TOGGLE_INPUT);
    await expect(checkbox).toBeChecked({ checked });
  }

  private async selectWatermarkTab(tabTestId: string) {
    const block = this.page.getByTestId(VDR_ADD_WATERMARKS);
    const tab = block.getByTestId(tabTestId);
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
  }
}

export default VdrRoomSettings;
