import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";

test.describe("POST /files/@my/file", () => {
  // No extension → .docx added
  test("POST /files/@my/file - Title without extension gets .docx", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.files.createFileInMyDocuments("owner", {
      title: "Autotest Document",
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Document.docx");
    expect(body.response.id).toBeGreaterThan(0);
  });

  test("POST /files/@my/file - Title with .docx extension stays .docx", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.files.createFileInMyDocuments("owner", {
      title: "Autotest Document.docx",
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Document.docx");
    expect(body.response.id).toBeGreaterThan(0);
  });

  // Known text format → converted to .docx by default
  test("POST /files/@my/file - Title with .txt extension is converted to .docx", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.files.createFileInMyDocuments("owner", {
      title: "Autotest Document.txt",
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Document.docx");
    expect(body.response.id).toBeGreaterThan(0);
  });

  // Bug 80324: enableExternalExt: true returns 403 with NullReferenceException
  test.skip("POST /files/@my/file - Title with .md extension and enableExternalExt keeps original extension", async ({
    apiSdk,
  }) => {
    const response = await apiSdk.files.createFileInMyDocuments("owner", {
      title: "Autotest Document.md",
      enableExternalExt: false,
    });

    const body = await response.json();
    console.log("status:", response.status());
    console.log("body:", JSON.stringify(body, null, 2));
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Document.md");
    expect(body.response.id).toBeGreaterThan(0);
  });
});

test.describe("POST /files/:folderId/file", () => {
  test("POST /files/:folderId/file - Owner creates a file in a room", async ({
    apiSdk,
  }) => {
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room For File Creation",
      roomType: "CustomRoom",
    });
    const folderId = (await roomResponse.json()).response.id;

    const response = await apiSdk.files.createFile("owner", folderId, {
      title: "Autotest Document",
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Document.docx");
    expect(body.response.folderId).toBe(folderId);
    expect(body.response.id).toBeGreaterThan(0);
  });
});

test.describe("POST /files/:folderId/html - Create HTML file", () => {
  test("POST /files/:folderId/html - Creates an HTML file with title and content", async ({
    apiSdk,
  }) => {
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room For HTML File",
      roomType: "CustomRoom",
    });
    const folderId = (await roomResponse.json()).response.id;

    const response = await apiSdk.files.createHtmlFile("owner", folderId, {
      title: "Autotest HTML File",
      content: "some text",
      createNewIfExist: true,
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest HTML File.html");
    expect(body.response.folderId).toBe(folderId);
    expect(body.response.id).toBeGreaterThan(0);
  });

  // Bug: createNewIfExist logic is inverted
  test.skip("POST /files/:folderId/html - createNewIfExist: false returns existing file when title already exists", async ({
    apiSdk,
  }) => {
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room For HTML Dedup",
      roomType: "CustomRoom",
    });
    const folderId = (await roomResponse.json()).response.id;

    const first = await apiSdk.files.createHtmlFile("owner", folderId, {
      title: "Autotest HTML Dedup",
      content: "some text",
      createNewIfExist: false,
    });
    const firstId = (await first.json()).response.id;

    const second = await apiSdk.files.createHtmlFile("owner", folderId, {
      title: "Autotest HTML Dedup",
      content: "some text",
      createNewIfExist: false,
    });
    const secondBody = await second.json();
    expect(second.status()).toBe(200);
    expect(secondBody.statusCode).toBe(200);
    expect(secondBody.response.id).toBe(firstId);
  });
});

test.describe("POST /files/:folderId/text - Create text file", () => {
  test("POST /files/:folderId/text - Creates a text file with title and content", async ({
    apiSdk,
  }) => {
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room For Text File",
      roomType: "CustomRoom",
    });
    const folderId = (await roomResponse.json()).response.id;

    const response = await apiSdk.files.createTextFile("owner", folderId, {
      title: "Autotest Text File",
      content: "some text",
      createNewIfExist: true,
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Text File.txt");
    expect(body.response.folderId).toBe(folderId);
    expect(body.response.id).toBeGreaterThan(0);
  });

  // Bug: createNewIfExist logic is inverted
  test.skip("POST /files/:folderId/text - createNewIfExist: false returns existing file when title already exists", async ({
    apiSdk,
  }) => {
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room For Text Dedup",
      roomType: "CustomRoom",
    });
    const folderId = (await roomResponse.json()).response.id;

    const first = await apiSdk.files.createTextFile("owner", folderId, {
      title: "Autotest Text Dedup",
      content: "some text",
      createNewIfExist: false,
    });
    const firstId = (await first.json()).response.id;

    const second = await apiSdk.files.createTextFile("owner", folderId, {
      title: "Autotest Text Dedup",
      content: "some text",
      createNewIfExist: false,
    });
    const secondBody = await second.json();
    expect(second.status()).toBe(200);
    expect(secondBody.statusCode).toBe(200);
    expect(secondBody.response.id).toBe(firstId);
  });
});

test.describe("POST /files/file/:fileId/copyas - Copy file", () => {
  test("POST /files/file/:fileId/copyas - Copies file to a room with specified title and correct destination", async ({
    apiSdk,
  }) => {
    const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
      title: "Autotest Source File",
    });
    const fileId = (await fileResponse.json()).response.id;

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room For Copy",
      roomType: "CustomRoom",
    });
    const destFolderId = (await roomResponse.json()).response.id;

    const response = await apiSdk.files.copyFileAs("owner", fileId, {
      destTitle: "Autotest Copied File.docx",
      destFolderId,
    });

    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Copied File.docx");
    expect(body.response.folderId).toBe(destFolderId);
  });

  test("POST /files/file/:fileId/copyas - Copies and converts file to form (toForm: true)", async ({
    apiSdk,
  }) => {
    const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
      title: "Autotest Source File For Form",
    });
    const fileId = (await fileResponse.json()).response.id;

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room For Form Copy",
      roomType: "CustomRoom",
    });
    const destFolderId = (await roomResponse.json()).response.id;

    const response = await apiSdk.files.copyFileAs("owner", fileId, {
      destTitle: "Autotest Converted Form.docxf",
      destFolderId,
      toForm: true,
    });

    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Converted Form.docxf");
    expect(body.response.folderId).toBe(destFolderId);
  });
  // TODO: requires a password-protected source file — no API method available to create one yet
  test.skip("POST /files/file/:fileId/copyas - Copies file with password", async ({
    apiSdk,
  }) => {
    const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
      title: "Autotest Source File For Password",
    });
    const fileId = (await fileResponse.json()).response.id;

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room For Password Copy",
      roomType: "CustomRoom",
    });
    const destFolderId = (await roomResponse.json()).response.id;

    const response = await apiSdk.files.copyFileAs("owner", fileId, {
      destTitle: "Autotest Password Copy.docx",
      destFolderId,
      password: "TestPassword123",
    });

    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Password Copy.docx");
    expect(body.response.folderId).toBe(destFolderId);
  });

  test("POST /files/file/:fileId/copyas - Copies file with non-standard extension (enableExternalExt: true)", async ({
    apiSdk,
  }) => {
    const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
      title: "Autotest Source File For Ext",
    });
    const fileId = (await fileResponse.json()).response.id;

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room For External Ext",
      roomType: "CustomRoom",
    });
    const destFolderId = (await roomResponse.json()).response.id;

    const response = await apiSdk.files.copyFileAs("owner", fileId, {
      destTitle: "Autotest Copied File.md",
      destFolderId,
      enableExternalExt: true,
    });

    const body = await response.json();
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Copied File.md");
    expect(body.response.folderId).toBe(destFolderId);
  });
});

test.describe("POST /files/file/:id/saveaspdf - Save file as PDF", () => {
  test("POST /files/file/:id/saveaspdf - Saves file as PDF in specified folder", async ({
    apiSdk,
  }) => {
    const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
      title: "Autotest Source File For PDF",
    });
    const fileId = (await fileResponse.json()).response.id;

    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "Autotest Room For PDF",
      roomType: "CustomRoom",
    });
    const folderId = (await roomResponse.json()).response.id;

    const response = await apiSdk.files.saveAsPdf("owner", fileId, {
      folderId,
      title: "Autotest Saved As PDF",
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Saved As PDF.pdf");
    expect(body.response.folderId).toBe(folderId);
  });
});

test.describe("GET /files/favorites/:fileId - Change favorite status", () => {
  test("GET /files/favorites/:fileId - Sets file as favorite", async ({
    apiSdk,
  }) => {
    const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
      title: "Autotest Favorite File",
    });
    const fileId = (await fileResponse.json()).response.id;

    const response = await apiSdk.files.changeFavoriteStatus(
      "owner",
      fileId,
      true,
    );

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response).toBe(true);
  });

  test("GET /files/favorites/:fileId - Removes file from favorites", async ({
    apiSdk,
  }) => {
    const fileResponse = await apiSdk.files.createFileInMyDocuments("owner", {
      title: "Autotest Unfavorite File",
    });
    const fileId = (await fileResponse.json()).response.id;

    await apiSdk.files.changeFavoriteStatus("owner", fileId, true);
    const response = await apiSdk.files.changeFavoriteStatus(
      "owner",
      fileId,
      false,
    );

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response).toBe(false);
  });
});
