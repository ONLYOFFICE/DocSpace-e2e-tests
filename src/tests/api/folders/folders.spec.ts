import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";

test.describe("POST /files/folder/:folderId - Create folder", () => {
  test("POST /files/folder/:folderId - Owner creates a folder in a room", async ({
    apiSdk,
  }) => {
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room For Folder Creation",
      roomType: "CustomRoom",
    });
    const roomId = (await roomResponse.json()).response.id;

    const response = await apiSdk.folders.createFolder("owner", roomId, {
      title: "Autotest Folder",
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Folder");
    expect(body.response.parentId).toBe(roomId);
    expect(body.response.id).toBeGreaterThan(0);
  });

  test("POST /files/folder/:folderId - Owner creates a folder in My Documents", async ({
    apiSdk,
  }) => {
    const myDocsFolderId = await apiSdk.folders.getMyDocumentsFolderId("owner");

    const response = await apiSdk.folders.createFolder(
      "owner",
      myDocsFolderId,
      {
        title: "Autotest Folder In My Docs",
      },
    );

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Folder In My Docs");
    expect(body.response.parentId).toBe(myDocsFolderId);
    expect(body.response.id).toBeGreaterThan(0);
  });
});

test.describe("PUT /files/folder/:folderId/order - Set folder order", () => {
  test("PUT /files/folder/:folderId/order - Sets order for a folder in My Documents", async ({
    apiSdk,
  }) => {
    const myDocsFolderId = await apiSdk.folders.getMyDocumentsFolderId("owner");

    const folderResponse = await apiSdk.folders.createFolder(
      "owner",
      myDocsFolderId,
      { title: "Autotest Folder For Order" },
    );
    const folderId = (await folderResponse.json()).response.id;

    const response = await apiSdk.folders.setFolderOrder("owner", folderId, 1);

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
  });
});
