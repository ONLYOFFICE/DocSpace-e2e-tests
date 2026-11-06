import { test } from "@/src/fixtures";
import Files from "@/src/objects/files/Files";
import Customization from "@/src/objects/settings/customization/Customization";
import { MetadataFieldType } from "@/src/services/files/metadata.services";
import { toastMessages } from "@/src/utils/constants/settings";
import {
  createDocxInMyDocuments,
  createMetadataTemplate,
} from "@/src/utils/helpers/metadata";

// Templates in Settings are managed by DocSpace admins only; other members
// can only pick visible templates.
test.describe("Metadata access: templates settings", () => {
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
});
