import MyRooms from "@/src/objects/rooms/Rooms";
import TemplateGallery from "@/src/objects/rooms/TemplateGallery";
import AiAgents from "@/src/objects/ai/AiAgents";
import { waitForGetRoomsResponse } from "@/src/objects/rooms/api";
import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";

test.describe("Forms: quick actions panel", () => {
  let myRooms: MyRooms;

  test.beforeEach(async ({ page, api, login }) => {
    myRooms = new MyRooms(page, api.portalDomain);
    await login.loginToPortal();

    // The panel, like the Rooms page tiles, only shows once a room already exists.
    await test.step("Precondition: create a Form space", async () => {
      await myRooms.createFormFillingRoom("Form space for quick actions");
      await myRooms.openForms();
    });
  });

  test("All quick action buttons are visible", async () => {
    await myRooms.formsQuickActions.checkAllButtonsExist();
  });

  test("Form space button opens the create form directly", async () => {
    await test.step("Click Form space", async () => {
      await myRooms.formsQuickActions.clickFormSpace();
    });

    await test.step("Verify the create form opened", async () => {
      await myRooms.roomsCreateDialog.checkCreateFormExist();
    });

    await myRooms.roomsCreateDialog.close();
  });

  test("Space template button opens the from-template picker", async ({
    page,
  }) => {
    await test.step("Click Space template", async () => {
      const responsePromise = waitForGetRoomsResponse(page);
      await myRooms.formsQuickActions.clickSpaceTemplate();
      await responsePromise;
    });

    await test.step("Verify the template picker opened", async () => {
      // Fresh portal has no room templates saved yet.
      await myRooms.roomsCreateDialog.checkNoTemplatesFoundExist();
    });

    await myRooms.roomsCreateDialog.close();
  });

  test("Template galery button opens the Template Gallery", async ({
    page,
  }) => {
    await test.step("Click Template galery", async () => {
      await myRooms.formsQuickActions.clickTemplateGallery();
    });

    await test.step("Verify the Template Gallery opened", async () => {
      const templateGallery = new TemplateGallery(page);
      await expect(templateGallery.searchInput).toBeVisible({
        timeout: 20000,
      });
    });
  });

  test("Template galery: selecting a template creates a room with the form and system folders", async ({
    page,
  }) => {
    const templateTitle = "30-day eviction notice form";
    const roomName = "Room from template";

    await test.step("Open Template Gallery", async () => {
      await myRooms.formsQuickActions.clickTemplateGallery();
      const templateGallery = new TemplateGallery(page);
      await expect(templateGallery.searchInput).toBeVisible({
        timeout: 20000,
      });
    });

    await test.step("Select a template", async () => {
      const templateGallery = new TemplateGallery(page);
      await templateGallery.selectTemplate(templateTitle);
    });

    await test.step("Verify the room creation form appears", async () => {
      await myRooms.roomsCreateDialog.checkCreateFormExist();
    });

    await test.step("Fill room name and create the room", async () => {
      await myRooms.roomsCreateDialog.fillRoomName(roomName);
      await myRooms.roomsCreateDialog.clickRoomDialogSubmit();
      await myRooms.checkHeadingExist(roomName);
    });

    await test.step("Verify the room already has the form and system folders", async () => {
      await myRooms.verifyCompleteFolderVisible();
      await myRooms.verifyInProcessFolderVisible();
      await expect(
        page.getByLabel(templateTitle, { exact: false }),
      ).toBeVisible();
    });
  });

  test("AI chat button opens the AI agents section", async ({ page, api }) => {
    await test.step("Click AI chat", async () => {
      await myRooms.formsQuickActions.clickAiChat();
    });

    await test.step("Verify the inline AI Chat panel opened", async () => {
      // Opens an inline chat panel on the same page, not a navigation
      // to /ai-agents. Fresh portal has no wallet top-up / activation yet.
      const aiAgents = new AiAgents(page, api.portalDomain);
      await aiAgents.expectQuickChatNotActive();
    });
  });
});
