import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import { Profile } from "@/src/objects/profile/Profile";
import { toastMessages } from "@/src/utils/constants/profile";

test.describe("Profile", () => {
  let profile: Profile;

  test.beforeEach(async ({ page, login }) => {
    profile = new Profile(page);

    await login.loginToPortal();
    await profile.open();
  });

  test("Change name", async () => {
    await test.step("Cancel change name dialog", async () => {
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

      await profile.expectNameVisible(updatedFullName);
    });
  });

  test("Avatar", async () => {
    await test.step("Upload avatar", async () => {
      await profile.uploadAvatar();
      await profile.dismissToastSafely(toastMessages.changesSaved);
      await profile.expectAvatarUploaded();
    });

    await test.step("Delete avatar", async () => {
      await profile.deleteAvatar();
      await profile.expectAvatarDeleted();
    });
  });

  // 80139
  test("Change language", async () => {
    await profile.changeLanguageTo("Deutsch");
    await profile.expectSelectedLanguage("Deutsch");
    await profile.expectLanguageLabel("Sprache");
    await profile.changeLanguageTo("English (United States)");
    await profile.expectSelectedLanguage("English");
  });

  test("Interface theme", async () => {
    await profile.selectInterfaceThemeTabs();
    await profile.selectTheme("Dark");
    await profile.expectThemeApplied("Dark");
    await profile.selectTheme("Light");
    await profile.expectThemeApplied("Light");
  });
});
