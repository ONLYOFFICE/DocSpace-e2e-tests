import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Files from "@/src/objects/files/Files";
import SharedWithMe from "@/src/objects/files/SharedWithMe";
import MyRooms from "@/src/objects/rooms/Rooms";
import Customization from "@/src/objects/settings/customization/Customization";
import Login from "@/src/objects/common/Login";
import { ApiSDK } from "@/src/services";
import { MetadataFieldType } from "@/src/services/files/metadata.services";
import { toastMessages } from "@/src/utils/constants/settings";
import { CONTRACT_TEMPLATE } from "@/src/utils/constants/metadata";
import {
  createContractTemplate,
  createDocxInMyDocuments,
  createFileWithMetadata,
  createFolderInMyDocuments,
  createMetadataTemplate,
  getFileFieldValue,
} from "@/src/utils/helpers/metadata";

const TEMPLATE_NAME = CONTRACT_TEMPLATE.name;
const FIELDS = CONTRACT_TEMPLATE.fields;

// Backend share access levels for PUT files/file/{id}/share
const FILE_ACCESS = { read: 2, comment: 6, editing: 10 } as const;

// Item metadata rights follow the access to the item, not the user type:
// Read / Comment / room Viewer - read-only, Editing / room Editor - full edit.
// Templates in Settings are managed by DocSpace admins only.
test.describe("Metadata: access rights", () => {
  test("DocSpace admin manages templates created by the owner", async ({
    page,
    apiSdk,
    login,
  }) => {
    const ownerTemplate = "Owner template";
    const adminTemplate = "Admin template";
    const customization = new Customization(page);
    const metadataTemplates = customization.metadataTemplates;
    let ownerName: string;
    let adminName: string;

    await test.step("Seed owner template and DocSpace admin via API", async () => {
      await createMetadataTemplate(apiSdk, ownerTemplate, [
        { name: "Note", type: MetadataFieldType.Text },
      ]);
      const ownerResponse =
        await apiSdk.profiles.returnHimselfInformation("owner");
      ownerName = (await ownerResponse.json()).response.displayName;
      const { userData } = await apiSdk.profiles.addMemberWithId(
        "owner",
        "DocSpaceAdmin",
      );
      adminName = `${userData.firstName} ${userData.lastName}`;
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("Admin opens Metadata templates and sees the owner template", async () => {
      await customization.open();
      await customization.openTab("Metadata templates");
      await metadataTemplates.checkTemplateRow(ownerTemplate, {
        fieldsCount: 1,
        author: ownerName,
      });
    });

    await test.step("Admin hides the owner template", async () => {
      await metadataTemplates.setVisibilityInTable(ownerTemplate, false);
    });

    await test.step("Admin creates own template", async () => {
      await metadataTemplates.createTemplate(adminTemplate, [
        { name: "Comment", type: "Text" },
      ]);
      await customization.dismissToastSafely(
        toastMessages.metadataTemplateSaved,
      );
      await metadataTemplates.checkTemplateRow(adminTemplate, {
        fieldsCount: 1,
        author: adminName,
      });
    });

    // The row toggle and the table update without a server round trip -
    // reopen the tab to check the changes were saved
    const reopenTab = async () => {
      await customization.open();
      await customization.openTab("Metadata templates");
    };

    await test.step("Changes are kept after reopening the tab", async () => {
      await reopenTab();
      await metadataTemplates.checkVisibilityInTable(ownerTemplate, false);
      await metadataTemplates.checkTemplateRow(adminTemplate, {
        fieldsCount: 1,
        author: adminName,
      });
    });

    await test.step("Admin deletes the owner template", async () => {
      await metadataTemplates.deleteTemplate(ownerTemplate);
      await customization.dismissToastSafely(
        toastMessages.metadataTemplateDeleted,
      );
      await metadataTemplates.checkTemplateNotInTable(ownerTemplate);
    });

    await test.step("Deleted template does not come back after reopening", async () => {
      await reopenTab();
      // Admin template row proves the table is loaded before the absence check
      await metadataTemplates.checkTemplateRow(adminTemplate, {
        fieldsCount: 1,
        author: adminName,
      });
      await metadataTemplates.checkTemplateNotInTable(ownerTemplate);
    });
  });

  test("User has no access to Metadata templates settings", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const customization = new Customization(page);

    await test.step("Log in as User", async () => {
      const { userData } = await apiSdk.profiles.addMemberWithId(
        "owner",
        "User",
      );
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("User menu has no Settings item", async () => {
      await customization.checkSettingsMenuItemNotVisible();
    });

    await test.step("Direct link to Metadata templates shows the error page", async () => {
      await customization.metadataTemplates.openByUrl(api.portalDomain);
      await customization.metadataTemplates.checkAccessDenied();
    });
  });

  test("User assigns a template to own file and fills values", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const fileName = "User contract";
    const files = new Files(page, api.portalDomain);

    await test.step("Seed owner template and user file via API", async () => {
      await createContractTemplate(apiSdk);
      const { userData } = await apiSdk.profiles.addMemberWithId(
        "owner",
        "User",
      );
      await api.auth.authenticateUser();
      await createDocxInMyDocuments(apiSdk, fileName, "user");
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("Open the file metadata - it is editable", async () => {
      await files.open();
      await files.openItemMetadata(fileName);
      await files.infoPanel.metadata.checkEmptyState();
    });

    await test.step("Pick the owner template and fill values", async () => {
      const metadata = files.infoPanel.metadata;
      await metadata.openTemplatePicker();
      await metadata.selectTemplateInPicker(TEMPLATE_NAME);
      await metadata.fillTextValue(FIELDS.comment, "Filled by user");
      await metadata.fillNumberValue(FIELDS.amount, "300");
      await metadata.selectSingleOption(FIELDS.status, "Open");
      await metadata.saveValues();
    });

    const checkCard = async () => {
      const metadata = files.infoPanel.metadata;
      await metadata.checkCardEditable(TEMPLATE_NAME);
      await metadata.checkCardValue(
        TEMPLATE_NAME,
        FIELDS.comment,
        "Filled by user",
      );
      await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.amount, "300");
      await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.status, "Open");
    };

    await test.step("Verify values on the card", async () => {
      await checkCard();
    });

    await test.step("Values are kept after reopening the file", async () => {
      await files.open();
      await files.openItemMetadata(fileName);
      await checkCard();
    });
  });

  test("File shared with Read or Comment access shows metadata read-only", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const readFile = "Read only contract";
    const commentFile = "Comment contract";
    const emptyFile = "Read only empty";
    const sharedWithMe = new SharedWithMe(page, api.portalDomain);

    await test.step("Seed files with metadata and share them via API", async () => {
      const template = await createContractTemplate(apiSdk);
      const { userData, userId } = await apiSdk.profiles.addMemberWithId(
        "owner",
        "User",
      );
      const values = {
        [FIELDS.comment]: "Owner note",
        [FIELDS.amount]: 500,
      };
      const shares: [number, number][] = [
        [
          await createFileWithMetadata(apiSdk, {
            title: readFile,
            template,
            values,
          }),
          FILE_ACCESS.read,
        ],
        [
          await createFileWithMetadata(apiSdk, {
            title: commentFile,
            template,
            values,
          }),
          FILE_ACCESS.comment,
        ],
        [await createDocxInMyDocuments(apiSdk, emptyFile), FILE_ACCESS.read],
      ];
      for (const [fileId, access] of shares) {
        const response = await apiSdk.files.shareFile("owner", fileId, {
          share: [{ shareTo: userId, access }],
          notify: false,
        });
        expect(response.ok()).toBeTruthy();
      }
      await login.loginWithCredentials(userData.email, userData.password);
    });

    for (const fileName of [readFile, commentFile]) {
      await test.step(`${fileName}: values are shown without edit controls`, async () => {
        await sharedWithMe.open();
        await sharedWithMe.openItemMetadata(fileName);
        const metadata = sharedWithMe.infoPanel.metadata;
        await metadata.checkCardReadOnly(TEMPLATE_NAME);
        await metadata.checkCardValue(
          TEMPLATE_NAME,
          FIELDS.comment,
          "Owner note",
        );
        await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.amount, "500");
      });
    }

    await test.step("File without metadata has no Add metadata link", async () => {
      await sharedWithMe.open();
      await sharedWithMe.openItemMetadata(emptyFile);
      await sharedWithMe.infoPanel.metadata.checkEmptyStateReadOnly();
    });
  });

  test("File shared with Editing access: user edits metadata values", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const fileName = "Shared for editing";
    const sharedWithMe = new SharedWithMe(page, api.portalDomain);
    let fileId: number;

    await test.step("Seed file with metadata and share it via API", async () => {
      const template = await createContractTemplate(apiSdk);
      const { userData, userId } = await apiSdk.profiles.addMemberWithId(
        "owner",
        "User",
      );
      fileId = await createFileWithMetadata(apiSdk, {
        title: fileName,
        template,
        values: { [FIELDS.comment]: "Owner note", [FIELDS.amount]: 100 },
      });
      const response = await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access: FILE_ACCESS.editing }],
        notify: false,
      });
      expect(response.ok()).toBeTruthy();
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("Open the file metadata - it is editable", async () => {
      await sharedWithMe.open();
      await sharedWithMe.openItemMetadata(fileName);
      await sharedWithMe.infoPanel.metadata.checkCardEditable(TEMPLATE_NAME);
    });

    await test.step("Change values from the card and save", async () => {
      const metadata = sharedWithMe.infoPanel.metadata;
      await metadata.openCardEdit(TEMPLATE_NAME);
      await metadata.fillTextValue(FIELDS.comment, "Edited by user");
      await metadata.fillNumberValue(FIELDS.amount, "250");
      await metadata.saveValues();
      await metadata.checkCardValue(
        TEMPLATE_NAME,
        FIELDS.comment,
        "Edited by user",
      );
      await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.amount, "250");
    });

    await test.step("Owner sees the values changed by the user", async () => {
      const value = await getFileFieldValue(
        apiSdk,
        fileId,
        TEMPLATE_NAME,
        FIELDS.comment,
      );
      expect(value?.stringValue).toBe("Edited by user");
    });
  });

  test("User picks templates managed by the DocSpace admin", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const adminTemplate = "Admin template";
    const hiddenTemplate = "Hidden by admin";
    const fileName = "User report";
    const customization = new Customization(page);
    const files = new Files(page, api.portalDomain);
    let admin: { email: string; password: string };
    let user: { email: string; password: string };

    await test.step("Seed members, owner template and user file via API", async () => {
      await createMetadataTemplate(apiSdk, hiddenTemplate, [
        { name: "Note", type: MetadataFieldType.Text },
      ]);
      admin = (await apiSdk.profiles.addMemberWithId("owner", "DocSpaceAdmin"))
        .userData;
      user = (await apiSdk.profiles.addMemberWithId("owner", "User")).userData;
      await api.auth.authenticateUser();
      await createDocxInMyDocuments(apiSdk, fileName, "user");
    });

    await test.step("Admin creates a template and hides the owner template", async () => {
      await login.loginWithCredentials(admin.email, admin.password);
      await customization.open();
      await customization.openTab("Metadata templates");
      await customization.metadataTemplates.createTemplate(adminTemplate, [
        { name: "Reviewer", type: "Text" },
      ]);
      await customization.dismissToastSafely(
        toastMessages.metadataTemplateSaved,
      );
      await customization.metadataTemplates.setVisibilityInTable(
        hiddenTemplate,
        false,
      );
    });

    await test.step("User sees only the visible template in the picker", async () => {
      // Clear cookies to log out from the admin account
      await page.context().clearCookies();
      await login.loginWithCredentials(user.email, user.password);
      await files.open();
      await files.openItemMetadata(fileName);
      await files.infoPanel.metadata.openTemplatePicker();
      await files.infoPanel.metadata.checkTemplateInPicker(adminTemplate);
      await files.infoPanel.metadata.checkTemplateNotInPicker(hiddenTemplate);
    });

    await test.step("User assigns the admin template and fills a value", async () => {
      const metadata = files.infoPanel.metadata;
      await metadata.selectTemplateInPicker(adminTemplate);
      await metadata.fillTextValue("Reviewer", "Jane");
      await metadata.saveValues();
      await metadata.checkCardValue(adminTemplate, "Reviewer", "Jane");
    });
  });

  test("Lowering share access to Read makes user values read-only", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const fileName = "Downgraded contract";
    const sharedWithMe = new SharedWithMe(page, api.portalDomain);
    let fileId: number;
    let userId: string;

    const share = async (access: number) => {
      const response = await apiSdk.files.shareFile("owner", fileId, {
        share: [{ shareTo: userId, access }],
        notify: false,
      });
      expect(response.ok()).toBeTruthy();
    };

    await test.step("Seed file with metadata and share it for editing", async () => {
      const template = await createContractTemplate(apiSdk);
      const member = await apiSdk.profiles.addMemberWithId("owner", "User");
      userId = member.userId;
      fileId = await createFileWithMetadata(apiSdk, {
        title: fileName,
        template,
        values: { [FIELDS.comment]: "Owner note" },
      });
      await share(FILE_ACCESS.editing);
      await login.loginWithCredentials(
        member.userData.email,
        member.userData.password,
      );
    });

    await test.step("User changes a value while having Editing access", async () => {
      await sharedWithMe.open();
      await sharedWithMe.openItemMetadata(fileName);
      const metadata = sharedWithMe.infoPanel.metadata;
      await metadata.openCardEdit(TEMPLATE_NAME);
      await metadata.fillTextValue(FIELDS.comment, "User note");
      await metadata.saveValues();
      await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.comment, "User note");
    });

    await test.step("Owner lowers the access to Read", async () => {
      await share(FILE_ACCESS.read);
    });

    await test.step("User value is kept, but the card is read-only", async () => {
      await sharedWithMe.open();
      await sharedWithMe.openItemMetadata(fileName);
      const metadata = sharedWithMe.infoPanel.metadata;
      await metadata.checkCardReadOnly(TEMPLATE_NAME);
      await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.comment, "User note");
    });
  });

  test("Guest edits metadata only on a file shared with Editing access", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const readFile = "Guest read contract";
    const editFile = "Guest edit contract";
    const sharedWithMe = new SharedWithMe(page, api.portalDomain);
    let editFileId: number;

    await test.step("Seed files with metadata and share them with a guest", async () => {
      const template = await createContractTemplate(apiSdk);
      const { userData, userId } = await apiSdk.profiles.addMemberWithId(
        "owner",
        "Guest",
      );
      const values = { [FIELDS.comment]: "Owner note" };
      const readFileId = await createFileWithMetadata(apiSdk, {
        title: readFile,
        template,
        values,
      });
      editFileId = await createFileWithMetadata(apiSdk, {
        title: editFile,
        template,
        values,
      });
      for (const [fileId, access] of [
        [readFileId, FILE_ACCESS.read],
        [editFileId, FILE_ACCESS.editing],
      ]) {
        const response = await apiSdk.files.shareFile("owner", fileId, {
          share: [{ shareTo: userId, access }],
          notify: false,
        });
        expect(response.ok()).toBeTruthy();
      }
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("Read access: values are shown without edit controls", async () => {
      await sharedWithMe.open();
      await sharedWithMe.openItemMetadata(readFile);
      const metadata = sharedWithMe.infoPanel.metadata;
      await metadata.checkCardReadOnly(TEMPLATE_NAME);
      await metadata.checkCardValue(
        TEMPLATE_NAME,
        FIELDS.comment,
        "Owner note",
      );
    });

    await test.step("Editing access: guest changes a value", async () => {
      await sharedWithMe.open();
      await sharedWithMe.openItemMetadata(editFile);
      const metadata = sharedWithMe.infoPanel.metadata;
      await metadata.checkCardEditable(TEMPLATE_NAME);
      await metadata.openCardEdit(TEMPLATE_NAME);
      await metadata.fillTextValue(FIELDS.comment, "Edited by guest");
      await metadata.saveValues();
      await metadata.checkCardValue(
        TEMPLATE_NAME,
        FIELDS.comment,
        "Edited by guest",
      );
    });

    await test.step("Owner sees the value changed by the guest", async () => {
      const value = await getFileFieldValue(
        apiSdk,
        editFileId,
        TEMPLATE_NAME,
        FIELDS.comment,
      );
      expect(value?.stringValue).toBe("Edited by guest");
    });
  });

  // The owner sees the cascade toggle on a folder with a template - see
  // metadata_folder_cascade.spec.ts. With Read access it is not shown.
  test("Folder shared with Read access: folder and its files are read-only", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const folderName = "Shared read folder";
    const fileName = "Folder contract";
    const sharedWithMe = new SharedWithMe(page, api.portalDomain);

    await test.step("Seed folder and file with metadata, share the folder", async () => {
      const template = await createContractTemplate(apiSdk);
      const { userData, userId } = await apiSdk.profiles.addMemberWithId(
        "owner",
        "User",
      );
      const folderId = await createFolderInMyDocuments(apiSdk, folderName);
      await apiSdk.metadata.assignTemplatesToFolder("owner", folderId, [
        template.id,
      ]);
      await createFileWithMetadata(apiSdk, {
        title: fileName,
        template,
        folderId,
        values: { [FIELDS.comment]: "Owner note" },
      });
      const response = await apiSdk.files.shareFolder("owner", folderId, {
        share: [{ shareTo: userId, access: FILE_ACCESS.read }],
        notify: false,
      });
      expect(response.ok()).toBeTruthy();
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("Folder card is read-only and has no cascade toggle", async () => {
      await sharedWithMe.open();
      await sharedWithMe.openItemMetadata(folderName);
      const metadata = sharedWithMe.infoPanel.metadata;
      await metadata.checkCardReadOnly(TEMPLATE_NAME);
      await metadata.checkCascadeToggleHidden();
    });

    await test.step("File inside the folder is read-only", async () => {
      await sharedWithMe.filesTable.openItem(folderName);
      await sharedWithMe.openItemMetadata(fileName);
      const metadata = sharedWithMe.infoPanel.metadata;
      await metadata.checkCardReadOnly(TEMPLATE_NAME);
      await metadata.checkCardValue(
        TEMPLATE_NAME,
        FIELDS.comment,
        "Owner note",
      );
    });
  });

  // Public room has no Viewer / Editor roles - Content creator is the
  // lowest member role there
  test("Public room Content creator edits metadata", async ({
    page,
    api,
    apiSdk,
    login,
  }) => {
    const roomName = "Public metadata room";
    const fileName = "Public contract";
    const myRooms = new MyRooms(page, api.portalDomain);
    let fileId: number;

    await test.step("Seed public room and file, invite a content creator", async () => {
      const template = await createContractTemplate(apiSdk);
      const response = await apiSdk.rooms.createRoom("owner", {
        title: roomName,
        roomType: "PublicRoom",
      });
      const roomId = (await response.json()).response.id;
      fileId = await createFileWithMetadata(apiSdk, {
        title: fileName,
        template,
        folderId: roomId,
        values: { [FIELDS.comment]: "Owner note" },
      });
      const { userData, userId } = await apiSdk.profiles.addMemberWithId(
        "owner",
        "User",
      );
      await apiSdk.rooms.inviteToRoom(
        "owner",
        roomId,
        userId,
        "ContentCreator",
      );
      await login.loginWithCredentials(userData.email, userData.password);
    });

    await test.step("Content creator changes a value from the card", async () => {
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await myRooms.openItemMetadata(fileName);
      const metadata = myRooms.infoPanel.metadata;
      await metadata.checkCardEditable(TEMPLATE_NAME);
      await metadata.openCardEdit(TEMPLATE_NAME);
      await metadata.fillTextValue(FIELDS.comment, "Edited in public room");
      await metadata.saveValues();
      await metadata.checkCardValue(
        TEMPLATE_NAME,
        FIELDS.comment,
        "Edited in public room",
      );
    });

    await test.step("Owner sees the new value", async () => {
      const value = await getFileFieldValue(
        apiSdk,
        fileId,
        TEMPLATE_NAME,
        FIELDS.comment,
      );
      expect(value?.stringValue).toBe("Edited in public room");
    });
  });

  test.describe("In a room", () => {
    const roomName = "Metadata room";
    const fileName = "Room contract";
    let myRooms: MyRooms;
    let roomId: number;
    let fileId: number;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      myRooms = new MyRooms(page, api.portalDomain);
      const template = await createContractTemplate(apiSdk);
      const response = await apiSdk.rooms.createRoom("owner", {
        title: roomName,
        roomType: "CustomRoom",
      });
      roomId = (await response.json()).response.id;
      fileId = await createFileWithMetadata(apiSdk, {
        title: fileName,
        template,
        folderId: roomId,
        values: { [FIELDS.comment]: "Owner note", [FIELDS.amount]: 100 },
      });
    });

    // Invites a new member with the given room role, logs in and opens the
    // file metadata inside the room. Room manager needs the RoomAdmin type.
    const openFileAs = async (
      apiSdk: ApiSDK,
      login: Login,
      access: "Read" | "Editing" | "ContentCreator" | "RoomManager",
    ) => {
      const { userData, userId } = await apiSdk.profiles.addMemberWithId(
        "owner",
        access === "RoomManager" ? "RoomAdmin" : "User",
      );
      await apiSdk.rooms.inviteToRoom("owner", roomId, userId, access);
      await login.loginWithCredentials(userData.email, userData.password);
      await myRooms.openWithoutEmptyCheck();
      await myRooms.roomsTable.openRoomByName(roomName);
      await myRooms.openItemMetadata(fileName);
    };

    test("Room Viewer sees metadata read-only", async ({ apiSdk, login }) => {
      await test.step("Viewer opens the file metadata in the room", async () => {
        await openFileAs(apiSdk, login, "Read");
      });

      await test.step("Values are shown without edit controls", async () => {
        const metadata = myRooms.infoPanel.metadata;
        await metadata.checkCardReadOnly(TEMPLATE_NAME);
        await metadata.checkCardValue(
          TEMPLATE_NAME,
          FIELDS.comment,
          "Owner note",
        );
        await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.amount, "100");
      });
    });

    test("Room Editor edits metadata values", async ({ apiSdk, login }) => {
      await test.step("Editor opens the file metadata in the room", async () => {
        await openFileAs(apiSdk, login, "Editing");
        await myRooms.infoPanel.metadata.checkCardEditable(TEMPLATE_NAME);
      });

      await test.step("Change a value from the card and save", async () => {
        const metadata = myRooms.infoPanel.metadata;
        await metadata.openCardEdit(TEMPLATE_NAME);
        await metadata.fillNumberValue(FIELDS.amount, "700");
        await metadata.saveValues();
        await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.amount, "700");
      });

      await test.step("Owner sees the value changed by the editor", async () => {
        const value = await getFileFieldValue(
          apiSdk,
          fileId,
          TEMPLATE_NAME,
          FIELDS.amount,
        );
        expect(value?.numberValue).toBe(700);
      });
    });

    // Content creator is not the file author here, yet can edit its metadata
    test("Room Content creator edits metadata on a file of another member", async ({
      apiSdk,
      login,
    }) => {
      await test.step("Content creator opens the owner file metadata", async () => {
        await openFileAs(apiSdk, login, "ContentCreator");
        await myRooms.infoPanel.metadata.checkCardEditable(TEMPLATE_NAME);
      });

      await test.step("Change a value from the card and save", async () => {
        const metadata = myRooms.infoPanel.metadata;
        await metadata.openCardEdit(TEMPLATE_NAME);
        await metadata.fillTextValue(FIELDS.comment, "Edited by creator");
        await metadata.saveValues();
        await metadata.checkCardValue(
          TEMPLATE_NAME,
          FIELDS.comment,
          "Edited by creator",
        );
      });

      await test.step("Owner sees the value changed by the content creator", async () => {
        const value = await getFileFieldValue(
          apiSdk,
          fileId,
          TEMPLATE_NAME,
          FIELDS.comment,
        );
        expect(value?.stringValue).toBe("Edited by creator");
      });
    });

    test("Room manager removes and reassigns a template on a file", async ({
      apiSdk,
      login,
    }) => {
      await test.step("Room manager opens the file metadata", async () => {
        await openFileAs(apiSdk, login, "RoomManager");
        await myRooms.infoPanel.metadata.checkCardEditable(TEMPLATE_NAME);
      });

      await test.step("Remove the template from the file", async () => {
        await myRooms.infoPanel.metadata.removeCard(TEMPLATE_NAME);
        await myRooms.infoPanel.metadata.checkEmptyState();
      });

      await test.step("Assign the template again and fill a value", async () => {
        const metadata = myRooms.infoPanel.metadata;
        await metadata.openTemplatePicker();
        await metadata.selectTemplateInPicker(TEMPLATE_NAME);
        await metadata.fillTextValue(FIELDS.comment, "Set by manager");
        await metadata.saveValues();
        await metadata.checkCardValue(
          TEMPLATE_NAME,
          FIELDS.comment,
          "Set by manager",
        );
        // Values of the removed assignment are not restored
        await metadata.checkCardValue(TEMPLATE_NAME, FIELDS.amount, "—");
      });

      await test.step("Owner sees the new value", async () => {
        const value = await getFileFieldValue(
          apiSdk,
          fileId,
          TEMPLATE_NAME,
          FIELDS.comment,
        );
        expect(value?.stringValue).toBe("Set by manager");
      });
    });
  });
});
