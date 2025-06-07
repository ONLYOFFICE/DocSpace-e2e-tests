import { expect, Page } from "@playwright/test";
import {
  listArticleDocActions,
  DOC_ACTIONS,
  listDocActions,
} from "../utils/constants/files";
import FilesCreateModal from "./FilesCreateModal";
import { maybeOpenPage } from "../utils";
import ContextMenu from "./ContextMenu";

const HEADER_ADD_BUTTON = "#header_add-button";
const ACTIONS_MAIN_BUTTON = "#actions-main-button";

class FilesCreateDropdown {
  page: Page;
  modal: FilesCreateModal;
  dropdown: ContextMenu;

  constructor(page: Page) {
    this.page = page;
    this.modal = new FilesCreateModal(page);
    this.dropdown = new ContextMenu(page);
  }

  private get headerAddButton() {
    return this.page.locator(HEADER_ADD_BUTTON);
  }

  private get actionsMainButton() {
    return this.page.locator(ACTIONS_MAIN_BUTTON);
  }

  async clickHeaderAddButton() {
    await this.headerAddButton.click();
  }

  async openCreateDropdown() {
    await this.clickHeaderAddButton();
    await expect(this.dropdown.contextMenu).toBeVisible();
  }

  async closeCreateDropdown() {
    await this.page.mouse.click(1, 1);
    await expect(this.dropdown.contextMenu).not.toBeVisible();
  }

  async openCreateDropdownByMainButton() {
    await this.page.mouse.move(1, 1);
    await this.actionsMainButton.click();
    await expect(this.dropdown.contextMenu).toBeVisible();
  }

  async selectCreateAction(actionText: string) {
    if (actionText === DOC_ACTIONS.CREATE_PDF_BLANK) {
      await this.dropdown.contextMenu.getByText("PDF Form").hover();
      await expect(this.dropdown.contextSubmenu).toBeVisible();
      await this.dropdown.contextSubmenu
        .getByText(actionText, { exact: true })
        .click();
    } else {
      await this.dropdown.contextMenu
        .getByText(actionText, { exact: true })
        .click();
    }
  }

  async validateModalForAction(actionText: string) {
    const modalTitle =
      actionText === DOC_ACTIONS.CREATE_PDF_BLANK
        ? DOC_ACTIONS.CREATE_PDF_FORM
        : actionText;

    await this.modal.checkModalExist();
    await this.modal.checkModalTitleExist(modalTitle);
    await this.modal.closeModalByClickOutside();
  }

  async openAndValidateFileCreateModals() {
    for (const actionText of listDocActions) {
      await this.openCreateDropdown();
      await this.selectCreateAction(actionText);
      await this.validateModalForAction(actionText);
    }
  }

  async checkCreatedFileByActionExist(actionText: string) {
    await expect(
      this.page.getByText(actionText, { exact: true }),
    ).toBeVisible();
  }

  async createFiles() {
    for (const actionText of listArticleDocActions) {
      await this.openCreateDropdownByMainButton();
      await this.selectCreateAction(actionText);
      await this.modal.fillCreateTextInput(actionText);

      if (actionText !== "Folder") {
        const [newPage] = await Promise.all([
          this.page.context().waitForEvent("page", { timeout: 5000 }),
          this.modal.clickCreateButton(),
        ]).catch(() => [null]);

        await newPage?.close();
      } else {
        await this.modal.clickCreateButton();
      }

      await this.checkCreatedFileByActionExist(actionText);
    }
  }
}

export default FilesCreateDropdown;
