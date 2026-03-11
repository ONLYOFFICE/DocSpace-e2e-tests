// Verifies that when multiple users open the same document for editing,
// the pencil icon on the file row shows a tooltip with the correct list of active editors.
import { test } from "@/src/fixtures";
import { expect, BrowserContext, Page } from "@playwright/test";
import MyRooms from "@/src/objects/rooms/Rooms";
import { ShortTour } from "@/src/objects/rooms/ShortTourModal";
import Login from "@/src/objects/common/Login";
import { documentContextMenuOption } from "@/src/utils/constants/files";
import config from "@/config";

const N = 1;

test.describe("Collaboration room - active editors tooltip", () => {
  let roomName: string;
  let roomId: number;
  let docName: string;
  let portalDomain: string;
  let users: Array<{ email: string; password: string }> = [];
  let userDisplayNames: string[] = [];

  test.beforeEach(async ({ api, apiSdk }) => {
    portalDomain = api.portalDomain;

    // Create Collaboration room (retry up to 5 times — portal DB may not be ready immediately)
    roomName = "CollaborationRoom_SimultaneousEdit";
    let roomId_: number | undefined;
    for (let attempt = 1; attempt <= 5; attempt++) {
      const roomResponse = await apiSdk.rooms.createRoom("owner", {
        title: roomName,
        roomType: "EditingRoom",
      });
      if (roomResponse.ok()) {
        const roomBody = await roomResponse.json();
        roomId_ = roomBody.response.id;
        break;
      }
      if (attempt === 5) {
        throw new Error(
          `createRoom failed after ${attempt} attempts (${roomResponse.status()}): ${await roomResponse.text()}`,
        );
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    roomId = roomId_!;

    // Create N users in batches of 5 to avoid overwhelming the server
    const BATCH_SIZE = 5;
    const userResults = [];
    for (let i = 0; i < N; i += BATCH_SIZE) {
      const batch = await Promise.all(
        Array.from({ length: Math.min(BATCH_SIZE, N - i) }, () =>
          apiSdk.profiles.addMember("owner", "User"),
        ),
      );
      userResults.push(...batch);
    }

    // Parse credentials and user IDs
    const userBodies = await Promise.all(
      userResults.map(async (r) => {
        const text = await r.response.text();
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(`addMember returned invalid JSON: "${text}"`);
        }
      }),
    );

    users = userResults.map((r) => ({
      email: r.userData.email,
      password: r.userData.password,
    }));
    userDisplayNames = userBodies.map((b) => b.response.displayName as string);

    // Add all N users to the room with Editing access
    const accessResponse = await apiSdk.rooms.setRoomAccessRights(
      "owner",
      roomId,
      {
        invitations: userBodies.map((b) => ({
          id: b.response.id,
          access: "Editing",
        })),
        notify: false,
      },
    );
    const accessBody = await accessResponse.json();
    if (!accessResponse.ok() || accessBody.error) {
      throw new Error(
        `setRoomAccessRights failed (${accessResponse.status()}): ${JSON.stringify(accessBody)}`,
      );
    }

    // Create a docx file in the room
    const fileResponse = await apiSdk.files.createFile("owner", roomId, {
      title: "CollaborationDoc",
    });
    const fileBody = await fileResponse.json();
    // API appends ".docx" — strip it for context menu matching
    docName = fileBody.response.title.replace(".docx", "");
  });

  test(`${N} users simultaneously open the same document for editing`, async ({
    browser,
  }) => {
    test.setTimeout(300000); // 5 minutes — enough for N users to login, navigate and open editors
    const userContexts: BrowserContext[] = [];
    const userPages: Page[] = [];
    let ownerContext: BrowserContext;
    let ownerPage: Page;

    try {
      await test.step("Create browser sessions for all users and owner", async () => {
        for (let i = 0; i < N; i++) {
          const ctx = await browser.newContext();
          const p = await ctx.newPage();
          userContexts.push(ctx);
          userPages.push(p);
        }
        ownerContext = await browser.newContext();
        ownerPage = await ownerContext.newPage();
      });

      await test.step("Login all users and owner", async () => {
        // bringToFront() is required for Firefox — without focus, pages don't receive input events
        await Promise.all([
          ...userPages.map(async (page, i) => {
            await page.bringToFront();
            const userLogin = new Login(page, portalDomain);
            return userLogin.loginWithCredentials(
              users[i].email,
              users[i].password,
            );
          }),
          (async () => {
            await ownerPage.bringToFront();
            return new Login(ownerPage, portalDomain).loginWithCredentials(
              config.DOCSPACE_OWNER_EMAIL,
              config.DOCSPACE_OWNER_PASSWORD,
            );
          })(),
        ]);
      });

      await test.step("Navigate all users and owner to the collaboration room", async () => {
        await Promise.all([
          ...userPages.map(async (page) => {
            const userRooms = new MyRooms(page, portalDomain);
            const userShortTour = new ShortTour(page);
            await userRooms.roomsTable.openRoomByName(roomName);
            const tourVisible = await userShortTour.isTourVisible(6000);
            if (tourVisible) {
              await userShortTour.clickSkipTour();
            }
            await userRooms.infoPanel.close();
          }),
          (async () => {
            const ownerRooms = new MyRooms(ownerPage, portalDomain);
            const ownerShortTour = new ShortTour(ownerPage);
            await ownerRooms.roomsTable.openRoomByName(roomName);
            const tourVisible = await ownerShortTour.isTourVisible(6000);
            if (tourVisible) {
              await ownerShortTour.clickSkipTour();
            }
            await ownerRooms.infoPanel.close();
          })(),
        ]);
      });

      await test.step(`All ${N} users and owner open the document for editing simultaneously`, async () => {
        const openEditorFor = async (page: Page) => {
          const rooms = new MyRooms(page, portalDomain);
          await rooms.filesTable.openContextMenuForItem(docName);
          const [editorPage] = await Promise.all([
            page.context().waitForEvent("page"),
            rooms.filesTable.contextMenu.clickOption(
              documentContextMenuOption.edit,
            ),
          ]);
          await editorPage.waitForLoadState("load");
          await editorPage.waitForSelector('iframe[name="frameEditor"]', {
            state: "attached",
            timeout: 60000,
          });
          return editorPage;
        };

        const editorPages = await Promise.all([
          ...userPages.map(openEditorFor),
          openEditorFor(ownerPage),
        ]);

        // Verify all editors are loaded
        await Promise.all(
          editorPages.map((editorPage) =>
            expect(
              editorPage.locator('iframe[name="frameEditor"]'),
            ).toBeAttached({ timeout: 60000 }),
          ),
        );
      });

      await test.step("Owner hovers over the pencil icon and sees active editors tooltip", async () => {
        const ownerRooms = new MyRooms(ownerPage, portalDomain);
        await ownerRooms.filesTable.hoverEditorsIcon();
        await ownerRooms.filesTable.checkEditorsTooltip({
          me: true,
          displayNames: [userDisplayNames[0]],
        });
      });
    } finally {
      await Promise.all([
        ...userContexts.map((ctx) => ctx.close().catch(() => {})),
        ownerContext!.close().catch(() => {}),
      ]);
    }
  });
});
