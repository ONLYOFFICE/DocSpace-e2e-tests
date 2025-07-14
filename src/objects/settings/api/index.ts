import { Page } from "@playwright/test";

export const waitForGetAuthServiceResponse = (page: Page) => {
  return page.waitForResponse((response) => {
    return (
      response.url().includes("api/2.0/settings/authservice") &&
      response.request().method() === "GET" &&
      response.status() === 200
    );
  });
};
