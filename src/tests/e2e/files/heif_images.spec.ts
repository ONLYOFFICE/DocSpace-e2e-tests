import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";

const HEIC_FILE = "data/documents/test-image.heic";
const HEIC_TITLE = "test-image";
const HEIC_FULL_TITLE = "test-image.heic";

test.describe("My Documents: HEIF images", () => {
  let files: Files;

  test.beforeEach(async ({ page, api, login }) => {
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();
    await files.open();

    await files.filesNavigation.uploadFiles(HEIC_FILE);
    await files.filesTable.expectItemVisible(HEIC_TITLE);
  });

  test("HEIC image gets a thumbnail in the thumbnail view", async () => {
    await test.step("Switch to the thumbnail view", async () => {
      await files.filesFilter.switchToThumbnailView();
    });

    await test.step("HEIC tile shows a decoded thumbnail", async () => {
      await files.filesTable.expectTileThumbnailLoaded(HEIC_FULL_TITLE);
    });
  });

  test("HEIC image opens in the media viewer", async () => {
    await test.step("Open the HEIC image", async () => {
      await files.filesTable.openItem(HEIC_TITLE);
      await files.mediaViewer.expectOpened();
    });

    await test.step("The picture is shown", async () => {
      await files.mediaViewer.expectImageShown();
    });

    await test.step("Close the viewer back to the list", async () => {
      await files.mediaViewer.close();
      await files.filesTable.expectItemVisible(HEIC_TITLE);
    });
  });
});
