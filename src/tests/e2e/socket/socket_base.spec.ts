import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Folder from "@/src/objects/files/Folder";
import Socket from "@/src/objects/socket/Socket";
import { DOC_ACTIONS } from "@/src/utils/constants/files";

test.describe("Socket: basic", () => {
  let folder: Folder;
  let socket: Socket;

  test.beforeEach(async ({ page, api, login }) => {
    socket = new Socket(page);
    folder = new Folder(page, api.portalDomain);

    await login.loginToPortal();
    await folder.open();
    await folder.filesTable.checkTableExist();
  });

  test("Socket is established and stays alive", async ({ page, context }) => {
    // 1. The socket is established after login and reaches ready state (connection-init)
    await test.step("Socket.io websocket appears, is open and receives connection-init", async () => {
      const ws = await socket.waitForSocketIo(15000);

      expect(ws.url()).toContain("/socket.io/");
      expect(ws.isClosed(), "Socket.io connection must be open").toBeFalsy();

      await socket.waitForConnectionInit(15000);
    });

    // 2. Create a folder and verify that the socket remains active
    await test.step("Create folder and check socket stays active", async () => {
      const folderName = "SocketFolderCreateTest";

      await folder.filesNavigation.openCreateDropdown();
      await folder.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_FOLDER,
      );

      await folder.filesNavigation.modal.fillCreateTextInput(folderName);
      await folder.filesNavigation.modal.clickCreateButton();

      await folder.expectFolderVisible(folderName);

      const active = socket.getActiveSocketIo();
      expect(active, "Active socket.io connection must exist").toBeDefined();
      expect(active!.isClosed(), "Socket must still be open").toBeFalsy();
    });

    // 3. Go offline → online and ensure the socket is active again
    await test.step("Go offline", async () => {
      await context.setOffline(true);
      await page.waitForTimeout(3000);
    });

    await test.step("Back online and wait for active socket connection", async () => {
      await context.setOffline(false);

      const active = await socket.waitForAnyActiveSocket(15000);

      expect(
        active.isClosed(),
        "After offline → online there must be an active socket.io connection",
      ).toBeFalsy();
    });

    // 4. Additionally: verify that the UI is still functional after reconnecting
    await test.step("UI still works after offline → online", async () => {
      const folderName = "SocketAfterOfflineOnline";

      await folder.filesNavigation.openCreateDropdown();
      await folder.filesNavigation.selectCreateAction(
        DOC_ACTIONS.CREATE_FOLDER,
      );

      await folder.filesNavigation.modal.fillCreateTextInput(folderName);
      await folder.filesNavigation.modal.clickCreateButton();

      await folder.expectFolderVisible(folderName);
    });
  });
});
