import { Page } from "@playwright/test";

export const waitForGetFilesResponse = (page: Page) => {
  return page.waitForResponse((response) => {
    return (
      response.url().includes("api/2.0/files") &&
      response.url().includes("?count") &&
      response.request().method() === "GET" &&
      response.status() === 200
    );
  });
};

export async function waitForShareLinkResponse(page: Page): Promise<string> {
  const response = await page.waitForResponse(
    (resp) =>
      resp.url().includes("/link") &&
      resp.url().includes("api/2.0/files/file/") &&
      resp.status() === 200,
    { timeout: 30000 },
  );
  const body = await response.json();
  const link: string =
    body?.response?.sharedTo?.shareLink ?? body?.sharedTo?.shareLink;
  if (!link) throw new Error("shareLink not found in API response");
  return link;
}
