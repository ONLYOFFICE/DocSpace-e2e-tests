import { test } from "@/src/fixtures";
import Dashboard from "@/src/objects/dashboard/Dashboard";
import WelcomeTour from "@/src/objects/dashboard/WelcomeTour";

type TourStep = { title: string; progress: string };

const FILES_STEPS: TourStep[] = [
  { title: "Your everyday files", progress: "1 / 10" },
  { title: "Create anything", progress: "2 / 10" },
  { title: "Your AI assistant", progress: "3 / 10" },
  { title: "Bring your files", progress: "4 / 10" },
  { title: "Find anything fast", progress: "5 / 10" },
  { title: "Narrow the list", progress: "6 / 10" },
  { title: "Choose your view", progress: "7 / 10" },
  { title: "Share and collaborate", progress: "8 / 10" },
  { title: "Everything in its place", progress: "9 / 10" },
  { title: "Now make it yours", progress: "10 / 10" },
];

const ROOMS_STEPS: TourStep[] = [
  { title: "A place to work together", progress: "1 / 9" },
  { title: "A room for every task", progress: "2 / 9" },
  { title: "Reuse what works", progress: "3 / 9" },
  { title: "Your AI assistant", progress: "4 / 9" },
  { title: "Group your rooms", progress: "5 / 9" },
  { title: "A sample to explore", progress: "6 / 9" },
  { title: "Work together", progress: "7 / 9" },
  { title: "Everything in its place", progress: "8 / 9" },
  { title: "Now make it yours", progress: "9 / 9" },
];

const FORMS_STEPS: TourStep[] = [
  { title: "Forms, from start to finish", progress: "1 / 12" },
  { title: "Forms and answers, together", progress: "2 / 12" },
  { title: "Reuse what works", progress: "3 / 12" },
  { title: "A sample to explore", progress: "4 / 12" },
  { title: "Working with a form space", progress: "5 / 12" },
  { title: "The form everyone opens", progress: "6 / 12" },
  { title: "Send it for filling", progress: "7 / 12" },
  { title: "Fill it in yourself", progress: "8 / 12" },
  { title: "Started, not finished", progress: "9 / 12" },
  { title: "Answers, collected", progress: "10 / 12" },
  { title: "Everything in its place", progress: "11 / 12" },
  { title: "Now make it yours", progress: "12 / 12" },
];

const AGENTS_STEPS: TourStep[] = [
  { title: "An assistant for your tasks", progress: "1 / 10" },
  { title: "Give it a job", progress: "2 / 10" },
  { title: "A sample to explore", progress: "3 / 10" },
  { title: "One row, one agent", progress: "4 / 10" },
  { title: "Give it the right context", progress: "5 / 10" },
  { title: "Keep the results at hand", progress: "6 / 10" },
  { title: "Work together", progress: "7 / 10" },
  { title: "Picking one out later", progress: "8 / 10" },
  { title: "Kept within reach", progress: "9 / 10" },
  { title: "Switch it on and see for real", progress: "10 / 10" },
];

// Guests have no personal Files, so their "?" tour on the Files card covers
// the Shared with me view they land on instead, with its own step content.
const GUEST_FILES_STEPS: TourStep[] = [
  { title: "A sample to explore", progress: "1 / 8" },
  { title: "Shared with you", progress: "2 / 8" },
  { title: "Who shared it, and what you can do", progress: "3 / 8" },
  { title: "Find anything fast", progress: "4 / 8" },
  { title: "Narrow the list", progress: "5 / 8" },
  { title: "Choose your view", progress: "6 / 8" },
  { title: "Everything in its place", progress: "7 / 8" },
  { title: "Your list is empty for now", progress: "8 / 8" },
];

// Non-owner roles (Guest and User alike - content is identical between them)
// can't create rooms/form spaces/agents, so their Rooms/Forms/AI agents tours
// drop the creation-related steps and end on "Your list is empty for now"
// instead of the owner's "Now make it yours".
const MEMBER_ROOMS_STEPS: TourStep[] = [
  { title: "A place to work together", progress: "1 / 6" },
  { title: "Group your rooms", progress: "2 / 6" },
  { title: "A sample to explore", progress: "3 / 6" },
  { title: "Work together", progress: "4 / 6" },
  { title: "Everything in its place", progress: "5 / 6" },
  { title: "Your list is empty for now", progress: "6 / 6" },
];

const MEMBER_FORMS_STEPS: TourStep[] = [
  { title: "Forms, from start to finish", progress: "1 / 10" },
  { title: "A sample to explore", progress: "2 / 10" },
  { title: "Find a form space", progress: "3 / 10" },
  { title: "The form everyone opens", progress: "4 / 10" },
  { title: "Send it for filling", progress: "5 / 10" },
  { title: "Fill it in yourself", progress: "6 / 10" },
  { title: "Started, not finished", progress: "7 / 10" },
  { title: "Answers, collected", progress: "8 / 10" },
  { title: "Everything in its place", progress: "9 / 10" },
  { title: "Your list is empty for now", progress: "10 / 10" },
];

const MEMBER_AGENTS_STEPS: TourStep[] = [
  { title: "An assistant for your tasks", progress: "1 / 9" },
  { title: "A sample to explore", progress: "2 / 9" },
  { title: "One row, one agent", progress: "3 / 9" },
  { title: "Give it the right context", progress: "4 / 9" },
  { title: "Keep the results at hand", progress: "5 / 9" },
  { title: "Who else is in here", progress: "6 / 9" },
  { title: "Picking one out later", progress: "7 / 9" },
  { title: "Kept within reach", progress: "8 / 9" },
  { title: "Your list is empty for now", progress: "9 / 9" },
];

async function walkModuleTour(tour: WelcomeTour, steps: TourStep[]) {
  for (const [index, step] of steps.entries()) {
    await test.step(`Step ${index + 1}: ${step.title}`, async () => {
      await tour.expectStep(step.title, step.progress);

      if (index < steps.length - 1) {
        await tour.clickNext();
      } else {
        await tour.clickDone();
      }
    });
  }

  await tour.expectClosed();
}

test.describe("Dashboard: Module tours", () => {
  let dashboard: Dashboard;
  let tour: WelcomeTour;

  test.beforeEach(async ({ page, api, login }) => {
    dashboard = new Dashboard(page, api.portalDomain);
    tour = new WelcomeTour(page);
    await login.loginToPortal();
  });

  test("Files: tour walks through all steps", async () => {
    await dashboard.filesTourButton.click();
    await walkModuleTour(tour, FILES_STEPS);
  });

  test("Rooms: tour walks through all steps", async () => {
    await dashboard.roomsTourButton.click();
    await walkModuleTour(tour, ROOMS_STEPS);
  });

  test("Forms: tour walks through all steps", async () => {
    await dashboard.formsTourButton.click();
    await walkModuleTour(tour, FORMS_STEPS);
  });

  test("AI agents: tour walks through all steps", async () => {
    await dashboard.agentsTourButton.click();
    await walkModuleTour(tour, AGENTS_STEPS);
  });
});

test.describe("Dashboard: Module tours (non-owner roles)", () => {
  test("Guest: Files tour shows the Shared with me variant", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const dashboard = new Dashboard(page, api.portalDomain);
    const tour = new WelcomeTour(page);
    const { userData } = await apiSdk.profiles.addMember("owner", "Guest");

    await login.loginWithCredentials(userData.email, userData.password);

    await dashboard.filesTourButton.click();
    await walkModuleTour(tour, GUEST_FILES_STEPS);
  });

  test("User: Files tour matches the owner's tour", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const dashboard = new Dashboard(page, api.portalDomain);
    const tour = new WelcomeTour(page);
    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    await login.loginWithCredentials(userData.email, userData.password);

    await dashboard.filesTourButton.click();
    await walkModuleTour(tour, FILES_STEPS);
  });

  test("User: Rooms tour shows the member variant", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const dashboard = new Dashboard(page, api.portalDomain);
    const tour = new WelcomeTour(page);
    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    await login.loginWithCredentials(userData.email, userData.password);

    await dashboard.roomsTourButton.click();
    await walkModuleTour(tour, MEMBER_ROOMS_STEPS);
  });

  test("User: Forms tour shows the member variant", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const dashboard = new Dashboard(page, api.portalDomain);
    const tour = new WelcomeTour(page);
    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    await login.loginWithCredentials(userData.email, userData.password);

    await dashboard.formsTourButton.click();
    await walkModuleTour(tour, MEMBER_FORMS_STEPS);
  });

  test("User: AI agents tour shows the member variant", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const dashboard = new Dashboard(page, api.portalDomain);
    const tour = new WelcomeTour(page);
    const { userData } = await apiSdk.profiles.addMember("owner", "User");

    await login.loginWithCredentials(userData.email, userData.password);

    await dashboard.agentsTourButton.click();
    await walkModuleTour(tour, MEMBER_AGENTS_STEPS);
  });
});
