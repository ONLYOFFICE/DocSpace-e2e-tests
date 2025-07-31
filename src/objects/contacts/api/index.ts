import { Page } from "@playwright/test";

export const waitForGetPeopleResponse = (page: Page) => {
  return page.waitForResponse((response) => {
    return (
      response.url().includes("api/2.0/people") &&
      response.request().method() === "GET"
    );
  });
};

export const waitForGetGroupResponse = (page: Page) => {
  return page.waitForResponse((response) => {
    return (
      response.url().includes("api/2.0/group") &&
      response.request().method() === "GET"
    );
  });
};
