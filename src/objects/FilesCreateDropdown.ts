import { expect, Page } from "@playwright/test";
import {
  listArticleDocActions,
  DOC_ACTIONS,
  listDocActions,
} from "../utils/constants/files";
import FilesCreateModal from "./FilesCreateModal";
import { maybeOpenPage } from "../utils";

const DROPDOWN_CREATE = ".p-contextmenu.p-component.p-contextmenu-enter-done";
const DROPDOWN_CREATE_SUBMENU = ".p-submenu-list.p-contextmenusub-enter-done";
const HEADER_ADD_BUTTON = "#header_add-button";
const ACTIONS_MAIN_BUTTON = "#actions-main-button";

class FilesCreateDropdown {
  page: Page;
  modal: FilesCreateModal;

  constructor(page: Page) {
    this.page = page;
    this.modal = new FilesCreateModal(page);
  }

  private get dropDownCreate() {
    return this.page.locator(DROPDOWN_CREATE);
  }

  private get dropDownCreateSubMenu() {
    return this.page.locator(DROPDOWN_CREATE_SUBMENU);
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
    await expect(this.dropDownCreate).toBeVisible();
  }

  async closeCreateDropdown() {
    await this.page.mouse.click(1, 1);
    await expect(this.dropDownCreate).not.toBeVisible();
  }

  async openCreateDropdownByMainButton() {
    await this.actionsMainButton.click();
    await expect(this.dropDownCreate).toBeVisible();
  }

  async selectCreateAction(actionText: string) {
    if (actionText === DOC_ACTIONS.CREATE_PDF_BLANK) {
      await this.dropDownCreate.getByText("PDF Form").hover();
      await expect(this.dropDownCreateSubMenu).toBeVisible();
      await this.dropDownCreateSubMenu
        .getByText(actionText, { exact: true })
        .click();
    } else {
      await this.dropDownCreate.getByText(actionText, { exact: true }).click();
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
      await this.modal.clickCreateButton();

      const newPage = await maybeOpenPage(this.page.context());
      await newPage?.close();

      await this.checkCreatedFileByActionExist(actionText);
    }
  }
}

export default FilesCreateDropdown;
