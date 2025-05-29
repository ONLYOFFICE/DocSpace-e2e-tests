// Copyright 2025 Abobadance
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { expect, Page } from "@playwright/test";

const DOC_ACTIONS_MAP = {
  "#create-doc-option": "New document",
  "#create-spreadsheet-option": "New spreadsheet",
  "#create-presentation-option": "New presentation",
  "#create-form-option": "New PDF form",
} as const;

const MODAL_DIALOG = "#modal-dialog";
const GOTO_DOCUMENTS_BUTTON = "#empty-view-goto-personal";

class EmptyView {
  page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async checkNoDocsTextExist() {
    await expect(this.page.getByText("No docs here yet")).toBeVisible();
  }

  async checkNoFilesTextExist() {
    await expect(this.page.getByText("No files here yet")).toBeVisible();
  }

  async clickGotoDocumentsButton() {
    await this.page.locator(GOTO_DOCUMENTS_BUTTON).click();
  }

  async checkAllDocActionModalsExist() {
    for (const [selector, modalTitle] of Object.entries(DOC_ACTIONS_MAP)) {
      await this.page.locator(selector).click();
      const modalDialog = this.page.locator(MODAL_DIALOG);
      await expect(modalDialog).toBeVisible();
      await expect(modalDialog.getByText(modalTitle)).toBeVisible();
      await this.page.mouse.click(1, 1);
    }
  }
}

export default EmptyView;
