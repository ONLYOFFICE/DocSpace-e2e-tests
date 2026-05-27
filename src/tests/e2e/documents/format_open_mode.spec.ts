import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import MyDocuments from "@/src/objects/files/MyDocuments";
import FilesEditor from "@/src/objects/files/FilesEditor";
import { documentContextMenuOption } from "@/src/utils/constants/files";

/**
 * All "lossy-edit" formats defined in onlyoffice-docs-formats.json open in
 * view mode by default. Switching to edit mode requires an explicit user
 * confirmation because saving back may lose data incompatible with the source
 * format (no diagrams in CSV/TSV, no images in TXT, etc.).
 *
 * Full lossy-edit list (source: onlyoffice-docs-formats.json):
 *   word:  epub, fb2, html, odt, ott, rtf, txt
 *   cell:  csv, ods, ots, tsv
 *   slide: odp, otp
 *
 * Planned behaviour (not yet implemented):
 *   Nextcloud-style admin setting will allow enabling editing per format.
 *   csv and txt are expected to be enabled by default (with a data-loss warning).
 *   Other formats will be disabled by default (admin opt-in).
 *
 * TODO: When the Edit+warning flow lands, update the "no Edit" tests below
 * so they assert that "Edit" IS present (opens with data-loss warning) while
 * "Preview" remains available for silent viewing.
 */

interface LossyEditFormat {
  /** Extension label, used in describe/step titles */
  ext: string;
  /** Filename as displayed in the DocSpace file table (non-native formats show with extension) */
  name: string;
  filePath: string;
  /** ONLYOFFICE editor type — for documentation; all share the same context-menu testIds */
  type: "word" | "cell" | "slide";
}

const LOSSY_EDIT_FORMATS: LossyEditFormat[] = [
  // word-type (document editor)
  {
    ext: "epub",
    name: "test-epub.epub",
    filePath: "data/documents/test-epub.epub",
    type: "word",
  },
  {
    ext: "fb2",
    name: "test-fb2.fb2",
    filePath: "data/documents/test-fb2.fb2",
    type: "word",
  },
  {
    ext: "html",
    name: "test-html.html",
    filePath: "data/documents/test-html.html",
    type: "word",
  },
  {
    ext: "odt",
    name: "test-odt.odt",
    filePath: "data/documents/test-odt.odt",
    type: "word",
  },
  {
    ext: "ott",
    name: "test-ott.ott",
    filePath: "data/documents/test-ott.ott",
    type: "word",
  },
  {
    ext: "rtf",
    name: "test-rtf.rtf",
    filePath: "data/documents/test-rtf.rtf",
    type: "word",
  },
  {
    ext: "txt",
    name: "test-plain-text.txt",
    filePath: "data/documents/test-plain-text.txt",
    type: "word",
  },
  // cell-type (spreadsheet editor)
  {
    ext: "csv",
    name: "sample.csv",
    filePath: "data/documents/sample.csv",
    type: "cell",
  },
  {
    ext: "ods",
    name: "test-ods.ods",
    filePath: "data/documents/test-ods.ods",
    type: "cell",
  },
  {
    ext: "ots",
    name: "test-ots.ots",
    filePath: "data/documents/test-ots.ots",
    type: "cell",
  },
  {
    ext: "tsv",
    name: "test-tsv.tsv",
    filePath: "data/documents/test-tsv.tsv",
    type: "cell",
  },
  // slide-type (presentation editor)
  {
    ext: "odp",
    name: "test-odp.odp",
    filePath: "data/documents/test-odp.odp",
    type: "slide",
  },
  {
    ext: "otp",
    name: "test-otp.otp",
    filePath: "data/documents/test-otp.otp",
    type: "slide",
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

      // TODO: update when Edit+warning flow is implemented —
      // assert "Edit" is visible (with data-loss warning on click)
      // while "Preview" remains available for silent view-only access.
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

      test("opens in view mode via Preview", async ({ page }) => {
        // setupConsoleCapture() must be called BEFORE navigation so the
        // "opened in mode view" message emitted by the editor is captured.
        const editor = new FilesEditor(page);
        editor.setupConsoleCapture();

        await test.step(`Open .${format.ext} via Preview`, async () => {
          await myDocuments.openFileViaPreview(format.name);
        });

        await test.step("Wait for editor to load", async () => {
          await editor.waitForLoad();
        });

        await test.step("Editor is in view mode (no edit approval given)", async () => {
          await editor.checkViewMode();
        });

        await editor.close();
      });
    });
  }
});
