import { Page } from "@playwright/test";
import { TListDocActions } from "./types/files";

export const transformDocActions = (docActions: TListDocActions) => {
  return docActions.map((actionText) => {
    const trimmed = actionText.trim();
    if (trimmed.toLowerCase().startsWith("new")) {
      const rest = trimmed.slice(3).trim();
      return rest.charAt(0).toUpperCase() + rest.slice(1);
    }
    return actionText;
  });
};

export async function waitForAllResponses(
  page: Page,
  paths: string[],
  options: { timeout?: number; shouldLogErrors?: boolean } = {},
) {
  const { timeout = 10000, shouldLogErrors = true } = options;

  // Create a promise for each path
  const promises = paths.map((path) =>
    page
      .waitForResponse(
        (response) =>
          response.url().includes(path) && response.status() === 200,
        { timeout }, // configurable timeout
      )
      .catch((err) => {
        if (shouldLogErrors) {
          console.warn(`Failed to load resource: ${path}`, err);
        }
        // Return resolved promise to continue even if one request fails
        return Promise.resolve();
      }),
  );

  return Promise.all(promises);
}
