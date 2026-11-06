import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Files from "@/src/objects/files/Files";
import SharedWithMe from "@/src/objects/files/SharedWithMe";
import {
  CONTRACT_TEMPLATE,
  FILE_SHARE_ACCESS,
} from "@/src/utils/constants/metadata";
import {
  createContractTemplate,
  createDocxInMyDocuments,
  createFileWithMetadata,
  createFolderInMyDocuments,
  getFileFieldValue,
} from "@/src/utils/helpers/metadata";

const TEMPLATE_NAME = CONTRACT_TEMPLATE.name;
const FIELDS = CONTRACT_TEMPLATE.fields;

// Item metadata rights follow the access to the item, not the user type:
// own file and Editing - full edit, Read / Comment - read-only.
test.describe("Metadata access: own and shared items", () => {
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
          FILE_SHARE_ACCESS.read,
        ],
        [
          await createFileWithMetadata(apiSdk, {
            title: commentFile,
            template,
            values,
          }),
          FILE_SHARE_ACCESS.comment,
        ],
        [
          await createDocxInMyDocuments(apiSdk, emptyFile),
          FILE_SHARE_ACCESS.read,
        ],
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
        share: [{ shareTo: userId, access: FILE_SHARE_ACCESS.editing }],
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
      await share(FILE_SHARE_ACCESS.editing);
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
      await share(FILE_SHARE_ACCESS.read);
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
        [readFileId, FILE_SHARE_ACCESS.read],
        [editFileId, FILE_SHARE_ACCESS.editing],
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
        share: [{ shareTo: userId, access: FILE_SHARE_ACCESS.read }],
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
});
