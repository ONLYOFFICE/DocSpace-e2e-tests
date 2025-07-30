import { expect, Page } from "@playwright/test";
import BaseArticle from "../common/BaseArticle";
import FilesCreateContextMenu from "./FilesCreateContextMenu";
import { listArticleDocActions } from "@/src/utils/constants/files";
import FilesCreateModal from "./FilesCreateModal";

class FilesArticle extends BaseArticle {
  contextMenu: FilesCreateContextMenu;
  modal: FilesCreateModal;

  constructor(page: Page) {
    super(page);
    this.contextMenu = new FilesCreateContextMenu(page);
    this.modal = new FilesCreateModal(page);
  }

  async openMainDropdown() {
    await this.clickArticleMainButton();
    await this.contextMenu.checkMenuExists();
  }

  async closeMainDropdown() {
    await this.contextMenu.close();
  }

  async checkCreatedFileByActionExist(actionText: string) {
    await expect(
      this.page.getByText(actionText, { exact: true }),
    ).toBeVisible();
  }

  async createFiles() {
    for (const actionText of listArticleDocActions) {
      await this.openMainDropdown();
      await this.contextMenu.selectCreateAction(actionText);
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

export default FilesArticle;
