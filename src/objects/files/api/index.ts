import { BrowserContext, Page } from "@playwright/test";

export type FileRecentData = {
  canShare: boolean;
  security: {
    Edit: boolean;
    Comment: boolean;
    Review: boolean;
    Rename: boolean;
  };
};

export function waitForFileRecentResponse(
  context: BrowserContext,
): Promise<FileRecentData> {
  return new Promise<FileRecentData>((resolve) => {
    context.once("page", (newPage) => {
      newPage
        .waitForResponse(
          (resp) =>
            resp.url().includes("/api/2.0/files/file/") &&
            resp.url().endsWith("/recent"),
        )
        .then(async (resp) => {
          const body = await resp.json();
          resolve(body.response);
        });
    });
  });
}

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
