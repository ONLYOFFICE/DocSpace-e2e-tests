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

type RoomShareEntry = { sharedTo?: { shareLink?: string } };

function extractRoomShareLink(body: {
  response?: RoomShareEntry[] | RoomShareEntry;
}): string | undefined {
  const r = body?.response;
  const entries = Array.isArray(r) ? r : r ? [r] : [];
  return entries.map((e) => e.sharedTo?.shareLink).find(Boolean);
}

export async function waitForRoomShareLinkResponse(
  page: Page,
): Promise<string> {
  // The first /share GET can arrive before a link is populated, so wait for the
  // response that actually carries a shareLink rather than the first one.
  const response = await page.waitForResponse(
    async (resp) => {
      const url = resp.url();
      if (
        resp.status() !== 200 ||
        resp.request().method() !== "GET" ||
        !url.includes("/api/2.0/files/rooms/") ||
        !(url.includes("/share") || url.includes("/links"))
      ) {
        return false;
      }
      try {
        return Boolean(extractRoomShareLink(await resp.json()));
      } catch {
        return false;
      }
    },
    { timeout: 30000 },
  );

  const link = extractRoomShareLink(await response.json());
  if (!link) throw new Error("shareLink not found in room share response");
  return link;
}
