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
