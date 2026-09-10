import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Dashboard from "@/src/objects/dashboard/Dashboard";
import WelcomeTour from "@/src/objects/dashboard/WelcomeTour";

const TOUR_STEPS = [
  { title: "Check your profile details", progress: "1 / 6" },
  { title: "Start creating", progress: "2 / 6" },
  { title: "Explore your apps", progress: "3 / 6" },
  { title: "Connect your platform", progress: "4 / 6" },
  { title: "Build with ONLYOFFICE", progress: "5 / 6" },
  { title: "Come back anytime", progress: "6 / 6" },
];

async function walkTour(welcomeTour: WelcomeTour, steps: typeof TOUR_STEPS) {
  for (const [index, step] of steps.entries()) {
    await test.step(`Step ${index + 1}: ${step.title}`, async () => {
      await welcomeTour.expectStep(step.title, step.progress);

      if (index < steps.length - 1) {
        await welcomeTour.clickNext();
      } else {
        await welcomeTour.clickDone();
      }
    });
  }

  await welcomeTour.expectClosed();
}

test.describe("Dashboard: Welcome tour", () => {
  let dashboard: Dashboard;
  let welcomeTour: WelcomeTour;

  test.beforeEach(async ({ page, api, login }) => {
    dashboard = new Dashboard(page, api.portalDomain);
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

  test("Open Welcome reopens the modal so the tour can be taken again", async () => {
    await test.step("Dismiss the welcome modal", async () => {
      await welcomeTour.dismiss();
      await welcomeTour.expectClosed();
    });

    await test.step("Reopen it via Open Welcome", async () => {
      await dashboard.openWelcomeButton.click();
      // The dashboard page itself carries the same "Welcome to ONLYOFFICE"
      // heading behind the modal, so assert on the modal's own actions
      // (data-testid based, unambiguous) instead of dashboard.welcomeHeading.
      await expect(welcomeTour.takeTourButton).toBeVisible();
    });

    await test.step("Take the tour again", async () => {
      await welcomeTour.startTour();
      await walkTour(welcomeTour, TOUR_STEPS);
    });
  });

  test("Open Welcome still reopens the modal after completing the tour once", async () => {
    await test.step("Complete the tour", async () => {
      await welcomeTour.startTour();
      await walkTour(welcomeTour, TOUR_STEPS);
    });

    await test.step("Reopen it via Open Welcome", async () => {
      await dashboard.openWelcomeButton.click();
      // The dashboard page itself carries the same "Welcome to ONLYOFFICE"
      // heading behind the modal, so assert on the modal's own actions
      // (data-testid based, unambiguous) instead of dashboard.welcomeHeading.
      await expect(welcomeTour.takeTourButton).toBeVisible();
    });

    await test.step("Take the tour again", async () => {
      await welcomeTour.startTour();
      await walkTour(welcomeTour, TOUR_STEPS);
    });
  });

  test("Open Welcome: the reopened modal can be dismissed again with Maybe later", async () => {
    await test.step("Dismiss the welcome modal", async () => {
      await welcomeTour.dismiss();
      await welcomeTour.expectClosed();
    });

    await test.step("Reopen it via Open Welcome", async () => {
      await dashboard.openWelcomeButton.click();
      // The dashboard page itself carries the same "Welcome to ONLYOFFICE"
      // heading behind the modal, so assert on the modal's own actions
      // (data-testid based, unambiguous) instead of dashboard.welcomeHeading.
      await expect(welcomeTour.takeTourButton).toBeVisible();
    });

    await test.step("Dismiss it again", async () => {
      await welcomeTour.dismiss();
      await welcomeTour.expectClosed();
    });
  });
});
