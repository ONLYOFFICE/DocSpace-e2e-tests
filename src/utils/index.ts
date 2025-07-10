import { Page } from "@playwright/test";
import { Page } from "@playwright/test";
import { TListDocActions } from "./types/files";
import Network from "../objects/common/Network";

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

export async function waitUntilReady(page: Page) {
  const network = Network.getInstance(page);
  await network.waitForNetworkIdle();
  await page.evaluate(async () => {
    await document.fonts.ready;

    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) return;
        return new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve());
          img.addEventListener("error", () => resolve());
        });
      }),
    );
  });
}
