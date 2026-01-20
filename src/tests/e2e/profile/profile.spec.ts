import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import { Profile } from "@/src/objects/profile/Profile";
import { toastMessages } from "@/src/utils/constants/profile";

test.describe("Profile", () => {
  let profile: Profile;

  test.beforeEach(async ({ page, login }) => {
    profile = new Profile(page);

    await login.loginToPortal();
  });

  test("Open profile and edit name", async () => {
    await test.step("Open profile", async () => {
      await profile.open();
      await expect(profile.profileAvatar).toBeVisible();
    });

    await test.step("Open and cancel change name dialog", async () => {
      await profile.openChangeNameDialog();
      await profile.changeNameCancelButton.click();
      await expect(profile.firstNameInput).not.toBeVisible();
    });

    await test.step("Update name", async () => {
      await profile.openChangeNameDialog();

      const updatedFirstName = "Autotest Admin";
      const updatedLastName = "Autotest User";
      const updatedFullName = `${updatedFirstName} ${updatedLastName}`;

      await profile.firstNameInput.fill(updatedFirstName);
      await profile.lastNameInput.fill(updatedLastName);
      await profile.changeNameSaveButton.click();

      await expect(profile.displayedName).toHaveText(updatedFullName);
    });

    await test.step("Upload avatar", async () => {
      await profile.uploadAvatar();
      await profile.dismissToastSafely(toastMessages.changesSaved);
      await profile.expectAvatarUploaded();
    });

    await test.step("Delete avatar", async () => {
      await profile.deleteAvatar();
      await profile.expectAvatarDeleted();
    });

    await test.step("Change language via combobox", async () => {
      await profile.changeLanguageTo("Deutsch");
      await profile.expectSelectedLanguage("Deutsch");
      await profile.expectLanguageLabel("Sprache");
      await profile.changeLanguageTo("English (United States)");
      await profile.expectSelectedLanguage("English");
    });

    await test.step("Switch interface themes", async () => {
      await profile.selectInterfaceThemeTabs();
      await profile.selectTheme("Dark");
      await profile.expectThemeApplied("Dark");
      await profile.selectTheme("Light");
      await profile.expectThemeApplied("Light");
    });
  });
});
