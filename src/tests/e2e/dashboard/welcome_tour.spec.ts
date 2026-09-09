import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import WelcomeTour from "@/src/objects/dashboard/WelcomeTour";

const TOUR_STEPS = [
  { title: "Check your profile details", progress: "1 / 6" },
  { title: "Start creating", progress: "2 / 6" },
  { title: "Explore your apps", progress: "3 / 6" },
  { title: "Connect your platform", progress: "4 / 6" },
  { title: "Build with ONLYOFFICE", progress: "5 / 6" },
  { title: "Come back anytime", progress: "6 / 6" },
];

test.describe("Dashboard: Welcome tour", () => {
  let welcomeTour: WelcomeTour;

  test.beforeEach(async ({ page, login }) => {
    welcomeTour = new WelcomeTour(page);
    await login.loginToPortal({ dismissTour: false });
  });

  test("Maybe later dismisses the welcome modal without starting the tour", async () => {
    await test.step("Dismiss the welcome modal", async () => {
      await welcomeTour.dismiss();
    });

    await test.step("Verify no tour step is shown", async () => {
      await welcomeTour.expectClosed();
    });
  });

  test("Take a tour walks through all steps and returns to the dashboard", async ({
    page,
  }) => {
    await test.step("Start the tour", async () => {
      await welcomeTour.startTour();
    });

    await test.step("Back returns to the previous step", async () => {
      await welcomeTour.expectStep(TOUR_STEPS[0].title, TOUR_STEPS[0].progress);
      await welcomeTour.clickNext();
      await welcomeTour.expectStep(TOUR_STEPS[1].title, TOUR_STEPS[1].progress);
      await welcomeTour.clickBack();
      await welcomeTour.expectStep(TOUR_STEPS[0].title, TOUR_STEPS[0].progress);
      await welcomeTour.clickNext();
    });

    const remainingSteps = TOUR_STEPS.slice(1);

    for (const [index, step] of remainingSteps.entries()) {
      await test.step(`Step ${index + 2}: ${step.title}`, async () => {
        await welcomeTour.expectStep(step.title, step.progress);

        if (index < remainingSteps.length - 1) {
          await welcomeTour.clickNext();
        } else {
          await welcomeTour.clickDone();
        }
      });
    }

    await test.step("Verify the tour is closed", async () => {
      await welcomeTour.expectClosed();
      await expect(page).toHaveURL(/\/dashboard/);
    });
  });
});
