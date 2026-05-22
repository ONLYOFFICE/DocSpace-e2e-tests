import { Locator, Page } from "@playwright/test";

// Moves the mouse gradually to hoverTarget to reliably trigger hover state on
// floating/nested elements in Firefox, then clicks clickTarget with force.
// startLocator - element whose bounding box defines both the start X and the Y
//                for the entire movement (defaults to hoverTarget itself).
//                Use this when hoverTarget is a column header but the mouse must
//                stay at the row's Y level throughout the movement.
// startOffsetX - additional X offset applied to the start point (default 0)
// steps        - number of intermediate mouse-move steps (default 10)
export async function hoverGradually(
  page: Page,
  hoverTarget: Locator,
  clickTarget: Locator,
  options: { steps?: number; startLocator?: Locator; startOffsetX?: number } = {},
): Promise<void> {
  const { steps = 10, startLocator, startOffsetX = 0 } = options;
  const targetBox = await hoverTarget.boundingBox();
  const targetX = targetBox!.x + targetBox!.width / 2;
  const startBox = startLocator ? await startLocator.boundingBox() : targetBox;
  // When startLocator is provided, use its center Y so the mouse stays on the row
  // rather than drifting to the hoverTarget's own Y (e.g. a column header)
  const targetY = startBox!.y + startBox!.height / 2;
  await page.mouse.move(startBox!.x + startOffsetX, targetY);
  await page.mouse.move(targetX, targetY, { steps });
  await clickTarget.click({ force: true });
}
