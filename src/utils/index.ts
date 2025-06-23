import { expect, Locator } from "@playwright/test";

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

export const waitForImageLoad = async (
  imageLocator: Locator,
  timeout = 30000,
) => {
  await expect(imageLocator).toBeVisible();
  await imageLocator.evaluate(
    (img) => {
      if (!(img instanceof HTMLImageElement)) {
        throw new Error("Element is not an image");
      }
      return new Promise((resolve, reject) => {
        if (img.complete) {
          resolve(true);
        } else {
          img.onload = () => resolve(true);
          img.onerror = () => reject(new Error("Image failed to load"));
        }
      });
    },
    { timeout },
  );
};
