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
