import { Page } from "@playwright/test";

export const waitForGetFilesResponse = (page: Page) => {
  return page.waitForResponse((response) => {
    return (
      response.url().includes("api/2.0/files") &&
      response.request().method() === "GET"
    );
  });
};
