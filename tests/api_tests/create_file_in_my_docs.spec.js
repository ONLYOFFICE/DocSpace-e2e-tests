import { test, expect } from "@playwright/test";
import { PortalSetupApi } from "../../api_library/portal_setup";
import { FilesApi } from "../../api_library/files/files_api";

test.describe("File Creation API", () => {
  let apiContext;
  let portalSetup;
  let filesApi;
  let portalDomain;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext();
    portalSetup = new PortalSetupApi(apiContext);
    const portalData = await portalSetup.setupPortal();
    portalDomain = portalData.tenant.domain;
    filesApi = new FilesApi(apiContext, portalDomain, () =>
      portalSetup.getAuthHeaders(),
    );
  });

  test.afterAll(async () => {
    await portalSetup.deletePortal();
    await apiContext.dispose();
  });

  test("Create DOCX file in My Documents", async () => {
    const fileName = "Test_File_DOCX";
    const fileType = "docx";
    const fileData = await filesApi.createFileInMyDocs(fileName, fileType);
    expect(fileData).toHaveProperty("id");
    expect(fileData).toHaveProperty("title", `${fileName}.${fileType}`);
  });

  test("Create XLSX file in My Documents", async () => {
    const fileName = "Test_File_XLSX";
    const fileType = "xlsx";
    const fileData = await filesApi.createFileInMyDocs(fileName, fileType);
    expect(fileData).toHaveProperty("id");
    expect(fileData).toHaveProperty("title", `${fileName}.${fileType}`);
  });

  test("Create PPTX file in My Documents", async () => {
    const fileName = "Test_File_PPTX";
    const fileType = "pptx";
    const fileData = await filesApi.createFileInMyDocs(fileName, fileType);
    expect(fileData).toHaveProperty("id");
    expect(fileData).toHaveProperty("title", `${fileName}.${fileType}`);
  });
});
