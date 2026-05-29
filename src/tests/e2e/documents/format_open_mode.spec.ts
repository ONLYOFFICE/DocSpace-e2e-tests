import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import MyDocuments from "@/src/objects/files/MyDocuments";
import FilesEditor from "@/src/objects/files/FilesEditor";
import { documentContextMenuOption } from "@/src/utils/constants/files";

interface LossyEditFormat {
  ext: string;
  name: string;
  filePath: string;
  // all formats share the same context-menu testIds regardless of editor type
  type: "word" | "cell" | "slide";
}

const LOSSY_EDIT_FORMATS: LossyEditFormat[] = [
  {
    ext: "txt",
    name: "test-plain-text",
    filePath: "data/documents/test-plain-text.txt",
    type: "word",
  },
  {
    ext: "csv",
    name: "sample",
    filePath: "data/documents/sample.csv",
    type: "cell",
  },
  {
    ext: "tsv",
    name: "test-tsv",
    filePath: "data/documents/test-tsv.tsv",
    type: "cell",
  },
];

test.describe("My Documents: all lossy-edit formats open in view mode", () => {
  for (const format of LOSSY_EDIT_FORMATS) {
    test.describe(`.${format.ext} (${format.type})`, () => {
      let myDocuments: MyDocuments;

      test.beforeEach(async ({ page, api, login, apiSdk }) => {
        myDocuments = new MyDocuments(page, api.portalDomain);
        await login.loginToPortal();
        await apiSdk.files.uploadToMyDocuments("owner", format.filePath);
        await myDocuments.open();
      });

      // TODO: update when Edit+warning flow is implemented (Bug 79081)
      test("context menu: no Edit, has Preview", async () => {
        await test.step(`Open context menu for ${format.name}`, async () => {
          await myDocuments.filesTable.openContextMenuForItem(
            format.name,
            true,
          );
        });

        await test.step("Edit option is absent (view-only by default)", async () => {
          await expect(
            myDocuments.filesTable.contextMenu.getItemLocator(
              documentContextMenuOption.edit,
            ),
          ).not.toBeVisible();
        });

        await test.step("Preview option is present", async () => {
          await expect(
            myDocuments.filesTable.contextMenu.getItemLocator(
              documentContextMenuOption.preview,
            ),
          ).toBeVisible();
        });

        await myDocuments.filesTable.contextMenu.close();
      });

      test("opens in view mode via Preview", async () => {
        let editor: FilesEditor;

        await test.step(`Open .${format.ext} via Preview`, async () => {
          const editorPage = await myDocuments.openFileViaPreview(format.name);
          editor = new FilesEditor(editorPage);
          // Set up capture immediately — the editor takes several seconds to
          // initialise, so the "opened in mode view" message won't be missed.
          editor.setupConsoleCapture();
        });

        await test.step("Wait for editor to load", async () => {
          await editor!.waitForLoad();
        });

        await test.step("Editor is in view mode (no edit approval given)", async () => {
          await editor!.checkViewMode();
        });

        await editor!.close();
      });
    });
  }
});
