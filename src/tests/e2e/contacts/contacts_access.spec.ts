import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import Login from "@/src/objects/common/Login";
import Contacts from "@/src/objects/contacts/Contacts";
import { getPortalUrl } from "@/config";

const CONTACTS_URL = /accounts\/people/;

test.describe("Contacts - section access by role", () => {
  test.describe("Owner has access", () => {
    let contacts: Contacts;

    test.beforeEach(async ({ page, api, login }) => {
      contacts = new Contacts(page, api.portalDomain);
      await login.loginToPortal();
    });

    test("Owner can open Contacts section", async ({ page }) => {
      await test.step("Accounts link is visible in profile menu", async () => {
        await page.getByTestId("profile_user_icon_button").click();
        await expect(page.getByTestId("user-menu-accounts")).toBeVisible();
        await page.keyboard.press("Escape");
      });

      await test.step("Contacts section opens successfully", async () => {
        await contacts.open();
      });
    });
  });

  test.describe("DocSpace admin has access", () => {
    let contacts: Contacts;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      contacts = new Contacts(page, api.portalDomain);
      const login = new Login(page, api.portalDomain);
      const { userData } = await apiSdk.profiles.addMember(
        "owner",
        "DocSpaceAdmin",
      );
      await login.loginWithCredentials(userData.email, userData.password);
    });

    test("DocSpace admin can open Contacts section", async ({ page }) => {
      await test.step("Accounts link is visible in profile menu", async () => {
        await page.getByTestId("profile_user_icon_button").click();
        await expect(page.getByTestId("user-menu-accounts")).toBeVisible();
        await page.keyboard.press("Escape");
      });

      await test.step("Contacts section opens successfully", async () => {
        await contacts.open();
      });
    });
  });

  test.describe("Room admin has access", () => {
    let contacts: Contacts;

    test.beforeEach(async ({ page, api, apiSdk }) => {
      contacts = new Contacts(page, api.portalDomain);
      const login = new Login(page, api.portalDomain);
      const { userData } = await apiSdk.profiles.addMember(
        "owner",
        "RoomAdmin",
      );
      await login.loginWithCredentials(userData.email, userData.password);
    });

    test("Room admin can open Contacts section", async ({ page }) => {
      await test.step("Accounts link is visible in profile menu", async () => {
        await page.getByTestId("profile_user_icon_button").click();
        await expect(page.getByTestId("user-menu-accounts")).toBeVisible();
        await page.keyboard.press("Escape");
      });

      await test.step("Contacts section opens successfully", async () => {
        await contacts.open();
      });
    });
  });

  test.describe("User does not have access", () => {
    test.beforeEach(async ({ page, api, apiSdk }) => {
      const login = new Login(page, api.portalDomain);
      const { userData } = await apiSdk.profiles.addMember("owner", "User");
      await login.loginWithCredentials(userData.email, userData.password);
    });

    test("User cannot access Contacts section", async ({ page, api }) => {
      await test.step("Accounts link is NOT visible in profile menu", async () => {
        await page.getByTestId("profile_user_icon_button").click();
        await expect(page.getByTestId("user-menu-accounts")).not.toBeVisible();
        await page.keyboard.press("Escape");
      });

      await test.step("Navigate to Contacts URL is redirected away", async () => {
        await page.goto(`${getPortalUrl(api.portalDomain)}/accounts/people`, {
          waitUntil: "load",
        });
        await expect(page).not.toHaveURL(CONTACTS_URL);
      });
    });
  });

  test.describe("Guest does not have access", () => {
    test.beforeEach(async ({ page, api, apiSdk }) => {
      const login = new Login(page, api.portalDomain);
      const { userData } = await apiSdk.profiles.addMember("owner", "Guest");
      await login.loginWithCredentials(userData.email, userData.password);
    });

    test("Guest cannot access Contacts section", async ({ page, api }) => {
      await test.step("Accounts link is NOT visible in profile menu", async () => {
        await page.getByTestId("profile_user_icon_button").click();
        await expect(page.getByTestId("user-menu-accounts")).not.toBeVisible();
        await page.keyboard.press("Escape");
      });

      await test.step("Navigate to Contacts URL is redirected away", async () => {
        await page.goto(`${getPortalUrl(api.portalDomain)}/accounts/people`, {
          waitUntil: "load",
        });
        await expect(page).not.toHaveURL(CONTACTS_URL);
      });
    });
  });
});
