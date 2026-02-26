import { expect } from "@playwright/test";
import { test } from "@/src/fixtures/index";

test.describe("POST /files/@my/file - Create a file in My Documents", () => {
  // No extension → .docx added
  test("Title without extension gets .docx", async ({ apiSdk }) => {
    const response = await apiSdk.files.createFileInMyDocuments("owner", {
      title: "Autotest Document",
    });

    const body = await response.json();
    expect(response.status()).toBe(200);
    expect(body.statusCode).toBe(200);
    expect(body.response.title).toBe("Autotest Document.docx");
    expect(body.response.id).toBeGreaterThan(0);
  });

  test("Title with .docx extension stays .docx", async ({ apiSdk }) => {
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
  test("Title with .txt extension is converted to .docx", async ({
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
  test.skip("Title with .md extension and enableExternalExt keeps original extension", async ({
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

test.describe("POST /files/:folderId/file - Create a file in a folder", () => {
  test("Owner creates a file in a room", async ({ apiSdk }) => {
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
