import { expect } from "@playwright/test";
import { test } from "@/src/fixtures";
import Login from "@/src/objects/common/Login";
import { Profile } from "@/src/objects/profile/Profile";
import Customization from "@/src/objects/settings/customization/Customization";
import config, { getPortalUrl } from "@/config";

test.describe("Login page", () => {
  let login: Login;

  test.beforeEach(async ({ page, api }) => {
    login = new Login(page, api.portalDomain);
    await login.openLoginPage();
  });

  test("Empty login shows validation - form stays on login page", async ({
    page,
  }) => {
    await test.step("Click login with empty fields", async () => {
      await login.loginButton.click();
    });

    await test.step("Verify validation errors are shown", async () => {
      await expect(login.emailFieldError).toBeVisible();
      await expect(login.passwordFieldError).toBeVisible();
    });

    await test.step("Verify still on login page", async () => {
      await expect(page).toHaveURL(/\/login/);
      await expect(login.loginButton).toBeVisible();
    });
  });

  test("Forgot password modal shows email field and captcha", async () => {
    await test.step("Open forgot password modal", async () => {
      await login.forgotPasswordLink.click();
      await expect(login.forgotPasswordModalTitle).toBeVisible();
      await expect(login.forgotPasswordEmailInput).toBeVisible();
    });

    await test.step("Verify captcha and Send button are visible", async () => {
      expect(await login.isCaptchaVisible()).toBe(true);
      await expect(login.forgotPasswordSendButton).toBeVisible();
    });

    await test.step("Send with empty email shows Required field error", async () => {
      await login.forgotPasswordSendButton.click();
      await expect(login.forgotPasswordEmailError).toBeVisible();
    });

    await test.step("Send with email but without captcha shows captcha error", async () => {
      await login.forgotPasswordEmailInput.fill("test@example.com");
      await login.forgotPasswordSendButton.click();
      await expect(login.captchaRequiredError).toBeVisible();
    });
  });

  test("Google social button opens Google sign-in popup", async ({ page }) => {
    await test.step("Click Google button and wait for popup", async () => {
      const [popup] = await Promise.all([
        page.waitForEvent("popup"),
        login.googleSocialButton.click(),
      ]);
      await popup.waitForLoadState("load");
      expect(popup.url()).toContain("accounts.google.com");
    });
  });

  test("LinkedIn social button opens LinkedIn sign-in popup", async ({
    page,
  }) => {
    await test.step("Click LinkedIn button and wait for popup", async () => {
      const [popup] = await Promise.all([
        page.waitForEvent("popup"),
        login.linkedInSocialButton.click(),
      ]);
      await popup.waitForLoadState("load");
      expect(popup.url()).toContain("linkedin.com");
    });
  });

  test("Zoom social button opens Zoom sign-in popup", async ({ page }) => {
    await test.step("Click Zoom button and wait for popup", async () => {
      const [popup] = await Promise.all([
        page.waitForEvent("popup"),
        login.zoomSocialButton.click(),
      ]);
      await popup.waitForLoadState("load");
      expect(popup.url()).toContain("zoom.us/signin");
    });
  });

  test("X social button in providers panel opens X sign-in popup", async ({
    page,
  }) => {
    await test.step("Open social providers panel and click X button", async () => {
      await login.openSocialPanel();
      const [popup] = await Promise.all([
        page.waitForEvent("popup"),
        login.twitterSocialButton.click(),
      ]);
      await popup.waitForLoadState("load");
      expect(popup.url()).toContain("api.x.com");
    });
  });

  test("Apple social button in providers panel opens Apple sign-in popup", async ({
    page,
  }) => {
    await test.step("Open social providers panel and click Apple button", async () => {
      await login.openSocialPanel();
      const [popup] = await Promise.all([
        page.waitForEvent("popup"),
        login.appleSocialButton.click(),
      ]);
      await popup.waitForLoadState("load");
      expect(popup.url()).toContain("appleid.apple.com");
    });
  });

  test("WeChat social button in providers panel opens WeChat sign-in popup", async ({
    page,
  }) => {
    await test.step("Open social providers panel and click WeChat button", async () => {
      await login.openSocialPanel();
      const [popup] = await Promise.all([
        page.waitForEvent("popup"),
        login.weixinSocialButton.click(),
      ]);
      await popup.waitForLoadState("load");
      expect(popup.url()).toContain("open.weixin.qq.com");
    });
  });

  test("Login page logo has correct size and src", async () => {
    await test.step("Verify logo is visible with correct dimensions and src", async () => {
      await expect(login.logoLight).toBeVisible();
      await expect(login.logoLight).toHaveAttribute("width", "386");
      await expect(login.logoLight).toHaveAttribute("height", "44");
      await expect(login.logoLight).toHaveAttribute(
        "src",
        /\/logo\.ashx\?logotype=2&dark=false&default=false/,
      );
    });
  });

  test("Remember me checkbox is checked by default", async () => {
    await test.step("Verify Remember me checkbox is checked", async () => {
      await expect(login.rememberMeCheckbox).toBeChecked();
    });
  });

  test("Invalid email format shows Incorrect email error", async () => {
    await test.step("Enter email without @ and submit", async () => {
      await login.emailInput.fill("invalidemail");
      await login.loginButton.click();
    });

    await test.step("Verify Incorrect email error is shown", async () => {
      await expect(login.emailFormatError).toBeVisible();
    });
  });

  test("Wrong credentials - login fails and form stays on login page", async ({
    page,
  }) => {
    await test.step("Enter wrong credentials and submit", async () => {
      await login.emailInput.fill("wronguser@example.com");
      await login.passwordInput.fill("wrongpassword123");
      await login.loginButton.click();
    });

    await test.step("Verify error message and still on login page", async () => {
      await expect(login.authFailedError).toBeVisible();
      await expect(page).toHaveURL(/\/login/);
      await expect(login.loginButton).toBeVisible();
    });
  });

  test("Social networks panel opens and closes", async () => {
    await test.step("Open social networks panel", async () => {
      await login.openSocialPanel();
      await expect(login.socialPanelCloseButton).toBeVisible();
      await login.checkSocialPanelProviders();
    });

    await test.step("Close social networks panel", async () => {
      await login.closeSocialPanel();
      await expect(login.socialPanelCloseButton).not.toBeInViewport();
    });
  });

  test("Language combobox shows language name and allows switching language", async () => {
    await test.step("Verify language combobox shows default language name", async () => {
      await login.checkLanguageComboboxVisible();
      await login.checkLanguageComboboxText("English (United Kingdom)");
    });

    await test.step("Click combobox and verify dropdown opens", async () => {
      await login.clickLanguageCombobox();
      await login.checkLanguageDropdownVisible();
    });

    await test.step("Select Deutsch (Deutschland) and verify label updates", async () => {
      await login.selectLanguage("de");
      await login.checkLanguageComboboxText("Deutsch (Deutschland)");
    });
  });

  test("Password visibility toggle shows and hides password", async () => {
    await test.step("Fill password and verify it is hidden", async () => {
      await login.passwordInput.fill("testpassword");
      await expect(login.passwordInput).toHaveAttribute("type", "password");
      await expect(login.passwordEyeIcon).toBeVisible();
    });

    await test.step("Click eye icon and verify password is visible", async () => {
      await login.passwordEyeIcon.click();
      await expect(login.passwordInput).toHaveAttribute("type", "text");
    });

    await test.step("Click eye icon again and verify password is hidden", async () => {
      await login.passwordEyeIcon.click();
      await expect(login.passwordInput).toHaveAttribute("type", "password");
    });
  });

  test("Filled email with empty password shows only password error", async () => {
    await test.step("Fill email and submit with empty password", async () => {
      await login.emailInput.fill("test@example.com");
      await login.loginButton.click();
    });

    await test.step("Verify only password error is shown", async () => {
      await expect(login.passwordFieldError).toBeVisible();
      await expect(login.emailFieldError).not.toBeVisible();
    });
  });

  test.fail(
    "Login page displays validation and auth errors in selected language [Bug 81951]",
    async ({ page }) => {
      await test.step("Select Deutsch on login page", async () => {
        await login.clickLanguageCombobox();
        await login.selectLanguage("de");
        await page.reload({ waitUntil: "load" });
        await login.checkLanguageComboboxText("Deutsch (Deutschland)");
      });

      await test.step("Enter invalid email format and submit", async () => {
        await login.emailInput.fill("invalidemail");
        await login.loginButton.click();
      });

      await test.step("Verify email format and password required errors are shown in German", async () => {
        await expect(
          page.getByTestId("email_field").getByText("Ungültige E-Mail-Adresse"),
        ).toBeVisible();
        await expect(
          page
            .locator('[data-testid="password_field_container"]')
            .getByText("Pflichtfeld"),
        ).toBeVisible();
      });

      await test.step("Enter correct email and wrong password", async () => {
        await login.emailInput.fill(config.DOCSPACE_OWNER_EMAIL);
        await login.passwordInput.fill("wrongpassword123");
        await login.loginButton.click();
      });

      await test.step("Verify auth error is shown in German", async () => {
        await expect(page).toHaveURL(/\/login/);
        await expect(
          page.getByText("Benutzerauthentifizierung fehlgeschlagen"),
        ).toBeVisible();
      });
    },
  );

  test("Language selection persists after page reload", async ({ page }) => {
    await test.step("Select Deutsch on login page", async () => {
      await login.clickLanguageCombobox();
      await login.selectLanguage("de");
      await login.checkLanguageComboboxText("Deutsch (Deutschland)");
    });

    await test.step("Reload page and verify language is still Deutsch", async () => {
      await page.reload({ waitUntil: "load" });
      await login.checkLanguageComboboxText("Deutsch (Deutschland)");
    });
  });

  test("Language selected on login page is applied to profile", async ({
    page,
    api,
  }) => {
    const profile = new Profile(page);
    const customization = new Customization(page);

    await test.step("Select Deutsch on login page", async () => {
      await login.clickLanguageCombobox();
      await login.selectLanguage("de");
      await login.checkLanguageComboboxText("Deutsch (Deutschland)");
    });

    await test.step("Log in", async () => {
      await login.loginToPortal();
    });

    await test.step("Verify profile language is Deutsch", async () => {
      await profile.open();
      await profile.expectSelectedLanguage("Deutsch");
    });

    await test.step("Verify portal language in settings is unchanged", async () => {
      await page.goto(
        `${getPortalUrl(api.portalDomain)}/portal-settings/customization/general`,
        { waitUntil: "load" },
      );
      const portalLanguage = await customization.getCurrentLanguage();
      expect(portalLanguage).toContain("English (United Kingdom)");
    });
  });
});
