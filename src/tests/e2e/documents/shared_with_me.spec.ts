import SharedWithMe from "@/src/objects/files/SharedWithMe";
import FilesTable from "@/src/objects/files/FilesTable";
import Login from "@/src/objects/common/Login";
import { test } from "@/src/fixtures";

test.describe("Shared with me", () => {
  test("Empty view is shown when nothing is shared", async ({
    page,
    api,
    login,
  }) => {
    await login.loginToPortal();
    const sharedWithMe = new SharedWithMe(page, api.portalDomain);

    await test.step("Open Shared with me", async () => {
      await sharedWithMe.open();
    });

    await test.step("Check empty view", async () => {
      await sharedWithMe.checkEmptyViewVisible();
    });
  });

  test("Shared file appears in Shared with me for invited user", async ({
    page,
    api,
    apiSdk,
  }) => {
    const fileName = "SharedDocument";
    let fileId: number;
    let userEmail: string;
    let userPassword: string;

    await test.step("Create file in My Documents via API", async () => {
      const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
        title: fileName,
      });
      const fileBody = await fileResponse.json();
      fileId = fileBody.response.id;
    });

    await test.step("Create user and share file with them", async () => {
      const { userData, response } = await apiSdk.profiles.addMember(
        "owner",
        "User",
      );
      userEmail = userData.email;
      userPassword = userData.password;

      const userBody = await response.json();
      const userId = userBody.response.id;

      await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: 2 }],
        notify: false,
      });
    });

    await test.step("Login as user and check Shared with me", async () => {
      const userLogin = new Login(page, api.portalDomain);
      await userLogin.loginWithCredentials(userEmail, userPassword);

      const sharedWithMe = new SharedWithMe(page, api.portalDomain);
      await sharedWithMe.open();

      const filesTable = new FilesTable(page);
      await filesTable.checkRowExist(fileName);
    });
  });
});
