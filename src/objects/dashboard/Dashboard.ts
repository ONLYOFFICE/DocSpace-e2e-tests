import { expect, Locator, Page } from "@playwright/test";
import { getPortalUrl } from "@/config";
import BasePage from "../common/BasePage";

const OPEN_WELCOME_BUTTON = "dashboard-open-welcome";
const PROFILE_RENAME_BUTTON = "dashboard-profile-rename";
// The "--" avoids matching the sibling "profileCardValueRow" wrapper class
const PROFILE_CARD_VALUE = '[class*="profileCardValue--"]';
const OPEN_FILES_BUTTON = "dashboard-app-open-ai-files";
const CREATE_ROOM_BUTTON = "dashboard-app-open-ai-rooms";
const CREATE_FORM_SPACE_BUTTON = "dashboard-app-open-ai-forms";
const CREATE_AI_AGENT_BUTTON = "dashboard-app-open-ai-agents";
const FILES_TOUR_BUTTON = "dashboard-app-tour-ai-files";
const ROOMS_TOUR_BUTTON = "dashboard-app-tour-ai-rooms";
const FORMS_TOUR_BUTTON = "dashboard-app-tour-ai-forms";
const AGENTS_TOUR_BUTTON = "dashboard-app-tour-ai-agents";
const WELCOME_HEADING_TEXT = "Welcome to ONLYOFFICE";

export class Dashboard extends BasePage {
  portalDomain: string;

  constructor(page: Page, portalDomain: string) {
    super(page);
    this.portalDomain = portalDomain;
  }

  async open() {
    await this.page.goto(`${getPortalUrl(this.portalDomain)}/dashboard`, {
      waitUntil: "load",
    });
  }

  get welcomeHeading(): Locator {
    return this.page.getByText(WELCOME_HEADING_TEXT, { exact: true });
  }

  get openWelcomeButton(): Locator {
    return this.page.getByTestId(OPEN_WELCOME_BUTTON);
  }

  get profileRenameButton(): Locator {
    return this.page.getByTestId(PROFILE_RENAME_BUTTON);
  }

  private get profileCardValues(): Locator {
    return this.page.locator(PROFILE_CARD_VALUE);
  }

  get workspaceNameValue(): Locator {
    return this.profileCardValues.nth(0);
  }

  get ownerNameValue(): Locator {
    return this.profileCardValues.nth(1);
  }

  get ownerEmailValue(): Locator {
    return this.profileCardValues.nth(2);
  }

  get openFilesButton(): Locator {
    return this.page.getByTestId(OPEN_FILES_BUTTON);
  }

  get createRoomButton(): Locator {
    return this.page.getByTestId(CREATE_ROOM_BUTTON);
  }

  get createFormSpaceButton(): Locator {
    return this.page.getByTestId(CREATE_FORM_SPACE_BUTTON);
  }

  get createAiAgentButton(): Locator {
    return this.page.getByTestId(CREATE_AI_AGENT_BUTTON);
  }

  get filesTourButton(): Locator {
    return this.page.getByTestId(FILES_TOUR_BUTTON);
  }

  get roomsTourButton(): Locator {
    return this.page.getByTestId(ROOMS_TOUR_BUTTON);
  }

  get formsTourButton(): Locator {
    return this.page.getByTestId(FORMS_TOUR_BUTTON);
  }

  get agentsTourButton(): Locator {
    return this.page.getByTestId(AGENTS_TOUR_BUTTON);
  }

  async expectProfileDetails(
    workspaceName: string,
    ownerName: string,
    ownerEmail: string,
  ) {
    await expect(this.workspaceNameValue).toHaveText(workspaceName);
    await expect(this.ownerNameValue).toHaveText(ownerName);
    await expect(this.ownerEmailValue).toHaveText(ownerEmail);
  }

  async expectRoomTypeSelectorVisible() {
    await expect(
      this.page.getByTestId("room-type-list-item").first(),
    ).toBeVisible();
  }

  async expectCreateRoomFormVisible() {
    await expect(this.page.getByTestId("create_edit_room_input")).toBeVisible();
  }

  async expectActivateAiDialogVisible() {
    await expect(
      this.page.getByTestId("activate-ai-dialog-activate-button"),
    ).toBeVisible();
  }

  // Non-owner roles can't create rooms/form spaces/AI agents, so their
  // Discover Apps cards all read "Open" instead of the owner's create actions
  async expectDiscoverAppsShowOpen() {
    await expect(this.openFilesButton).toHaveText("Open");
    await expect(this.createRoomButton).toHaveText("Open");
    await expect(this.createFormSpaceButton).toHaveText("Open");
    await expect(this.createAiAgentButton).toHaveText("Open");
  }
}

export default Dashboard;
