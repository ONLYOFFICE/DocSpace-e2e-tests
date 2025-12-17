import MyDocuments from "@/src/objects/files/MyDocuments";
import Recent from "@/src/objects/files/Recent";
import { test } from "@/src/fixtures";

test.describe("My documents: Recent", () => {
  let myDocuments: MyDocuments;
  let recent: Recent;

  test.beforeEach(async ({ page, api, login }) => {
    myDocuments = new MyDocuments(page, api.portalDomain);
    recent = new Recent(page, api.portalDomain);

    await login.loginToPortal();
    await myDocuments.open();
  });

  test("Recent section shows empty view", async () => {
    await recent.openFromNavigation();

    await recent.checkNoRecentFilesTextExist();
  });
});
