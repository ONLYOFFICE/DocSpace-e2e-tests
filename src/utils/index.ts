import { BrowserContext, Page } from "@playwright/test";
import { TListDocActions } from "./types/files";

export async function maybeOpenPage(
  context: BrowserContext,
  action?: () => Promise<void>,
  timeout = 1500,
): Promise<Page | null> {
  const waitForPage = context
    .waitForEvent("page", { timeout })
    .catch(() => null);
  await action?.();
  return await waitForPage;
}

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
