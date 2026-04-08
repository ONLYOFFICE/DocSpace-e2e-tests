import { Page } from "@playwright/test";

export const waitForGetRoomsResponse = (page: Page) => {
  return page.waitForResponse((response) => {
    return (
      response.url().includes("api/2.0/files/rooms?count") &&
      response.request().method() === "GET" &&
      response.status() === 200
    );
  });
};

export const waitForCreateRoomResponse = (page: Page) => {
  return page.waitForResponse((response) => {
    const url = response.url();
    return (
      url.includes("/api/2.0/files/rooms") &&
      !url.includes("count=") &&
      response.request().method() === "POST" &&
      response.status() === 200
    );
  });
};

export async function waitForRoomShareLinkResponse(
  page: Page,
): Promise<string> {
  const response = await page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/2.0/files/rooms/") &&
      resp.url().includes("/share") &&
      resp.request().method() === "GET" &&
      resp.status() === 200,
    { timeout: 30000 },
  );
  const body = await response.json();
  const linkEntry = body?.response?.find(
    (entry: { sharedTo: { shareLink?: string } }) => entry.sharedTo?.shareLink,
  );
  if (!linkEntry) throw new Error("shareLink not found in room share response");
  return linkEntry.sharedTo.shareLink;
}
