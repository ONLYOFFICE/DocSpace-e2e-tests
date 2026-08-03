import { Page } from "@playwright/test";

const AGENTS_ENDPOINT = "/api/2.0/ai/agents";

export const waitForCreateAgentResponse = (page: Page) => {
  return page.waitForResponse(
    (response) =>
      response.url().includes(AGENTS_ENDPOINT) &&
      response.request().method() === "POST",
  );
};
