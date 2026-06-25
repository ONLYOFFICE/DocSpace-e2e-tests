import { test } from "@/src/fixtures";
import { Profile } from "@/src/objects/profile/Profile";
import MyDocuments from "@/src/objects/files/MyDocuments";
import Rooms from "@/src/objects/rooms/Rooms";
import { mapInitialDocNames } from "@/src/utils/constants/files";

const SAMPLE_DOC = mapInitialDocNames.ONLYOFFICE_SAMPLE_DOCUMENT;

test.describe("Profile - Interface theme", () => {
  let profile: Profile;
  let myDocuments: MyDocuments;
  let myRooms: Rooms;

  test.beforeEach(async ({ page, api, login }) => {
    profile = new Profile(page);
    myDocuments = new MyDocuments(page, api.portalDomain);
    myRooms = new Rooms(page, api.portalDomain);
    await login.loginToPortal();
    await profile.open();
    await profile.selectInterfaceThemeTabs();
    await profile.selectTheme("Dark");
    await profile.expectThemeApplied("Dark");
  });

  test("Dark theme applies in My Documents", async () => {
    await test.step("Navigate to My Documents", async () => {
      await myDocuments.open();
    });

    await test.step("Verify Dark theme is applied", async () => {
      await profile.expectThemeApplied("Dark");
    });
  });

  test("Dark theme applies in Rooms", async () => {
    await test.step("Navigate to Rooms", async () => {
      await myRooms.openWithoutEmptyCheck();
    });

    await test.step("Verify Dark theme is applied", async () => {
      await profile.expectThemeApplied("Dark");
    });
  });

  test("Dark theme applies in the editor", async () => {
    await test.step("Open document in editor", async () => {
      await myDocuments.open();
    });

    await test.step("Verify Dark theme is applied in the editor", async () => {
      const editor = await myDocuments.openDocumentInEditor(SAMPLE_DOC);
      await editor.waitForLoad();
      await editor.expectThemeApplied("Dark");
    });
  });
});
