import { test } from "@/src/fixtures";
import Dashboard from "@/src/objects/dashboard/Dashboard";
import WelcomeTour from "@/src/objects/dashboard/WelcomeTour";

type TourStep = { title: string; progress: string };

const FILES_STEPS: TourStep[] = [
  { title: "Create anything", progress: "1 / 6" },
  { title: "Your AI assistant", progress: "2 / 6" },
  { title: "Bring your files", progress: "3 / 6" },
  { title: "Find anything fast", progress: "4 / 6" },
  { title: "Share and collaborate", progress: "5 / 6" },
  { title: "Everything in its place", progress: "6 / 6" },
];

const ROOMS_STEPS: TourStep[] = [
  { title: "A room for every task", progress: "1 / 7" },
  { title: "Reuse what works", progress: "2 / 7" },
  { title: "Your AI assistant", progress: "3 / 7" },
  { title: "Group your rooms", progress: "4 / 7" },
  { title: "Work together", progress: "5 / 7" },
  { title: "Everything in its place", progress: "6 / 7" },
  { title: "Now make it yours", progress: "7 / 7" },
];

const FORMS_STEPS: TourStep[] = [
  { title: "One space per form", progress: "1 / 8" },
  { title: "Reuse what works", progress: "2 / 8" },
  { title: "Working with a form space", progress: "3 / 8" },
  { title: "The form everyone opens", progress: "4 / 8" },
  { title: "Started, not finished", progress: "5 / 8" },
  { title: "Answers, collected", progress: "6 / 8" },
  { title: "Everything in its place", progress: "7 / 8" },
  { title: "Now make it yours", progress: "8 / 8" },
];

const AGENTS_STEPS: TourStep[] = [
  { title: "An agent, not a chat", progress: "1 / 7" },
  { title: "Give it a job", progress: "2 / 7" },
  { title: "One row, one agent", progress: "3 / 7" },
  { title: "Who gets to use it", progress: "4 / 7" },
  { title: "Picking one out later", progress: "5 / 7" },
  { title: "Kept within reach", progress: "6 / 7" },
  { title: "Switch it on and see for real", progress: "7 / 7" },
];

// Guests have no personal Files, so their "?" tour on the Files card covers
// the Shared with me view they land on instead, with its own step content.
const GUEST_FILES_STEPS: TourStep[] = [
  { title: "Shared with you", progress: "1 / 5" },
  { title: "Who shared it, and what you can do", progress: "2 / 5" },
  { title: "Find anything fast", progress: "3 / 5" },
  { title: "Everything in its place", progress: "4 / 5" },
  { title: "Your list is empty for now", progress: "5 / 5" },
];

// Non-owner roles (Guest and User alike - content is identical between them)
// can't create rooms/form spaces/agents, so their Rooms/Forms/AI agents tours
// drop the creation-related steps and end on "Your list is empty for now"
// instead of the owner's "Now make it yours".
const MEMBER_ROOMS_STEPS: TourStep[] = [
  { title: "Group your rooms", progress: "1 / 4" },
  { title: "Work together", progress: "2 / 4" },
  { title: "Everything in its place", progress: "3 / 4" },
  { title: "Your list is empty for now", progress: "4 / 4" },
];

const MEMBER_FORMS_STEPS: TourStep[] = [
  { title: "Working with a form space", progress: "1 / 6" },
  { title: "The form everyone opens", progress: "2 / 6" },
  { title: "Started, not finished", progress: "3 / 6" },
  { title: "Answers, collected", progress: "4 / 6" },
  { title: "Everything in its place", progress: "5 / 6" },
  { title: "Your list is empty for now", progress: "6 / 6" },
];

const MEMBER_AGENTS_STEPS: TourStep[] = [
  { title: "An agent, not a chat", progress: "1 / 6" },
  { title: "One row, one agent", progress: "2 / 6" },
  { title: "Who else is in here", progress: "3 / 6" },
  { title: "Picking one out later", progress: "4 / 6" },
  { title: "Kept within reach", progress: "5 / 6" },
  { title: "Your list is empty for now", progress: "6 / 6" },
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
