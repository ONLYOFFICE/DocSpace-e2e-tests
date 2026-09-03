import { Integration } from "@/src/objects/settings/integration/Integration";
import { test } from "@/src/fixtures";
import { expect } from "@playwright/test";
import { toastMessages } from "@/src/utils/constants/settings";

const INVALID_ADDRESS = "https://this-is-not-a-docserver.invalid/";
const CONNECTION_ERROR = toastMessages.documentServiceConnectionError;
const CHANGES_SAVED = toastMessages.documentServiceSaved;

test.describe("Integration: Document Service", () => {
  let integration: Integration;

  test.beforeEach(async ({ page, login }) => {
    integration = new Integration(page);
    await login.loginToPortal();
    await integration.open();
    await integration.openDocumentServiceTab();
  });

  test("Disable certificate verification can be toggled and saved", async ({
    page,
  }) => {
    await expect(integration.documentServiceAddressInput).not.toHaveValue("");
    await expect(integration.documentServiceSecretInput).toBeVisible();
    await expect(integration.documentServiceDisableCertInput).not.toBeChecked();
    // No edits yet, so Save is disabled.
    await expect(integration.documentServiceSaveButton).toBeDisabled();

    await test.step("Toggle the checkbox and verify Save becomes available", async () => {
      await integration.toggleDocumentServiceDisableCert();
      await expect(integration.documentServiceDisableCertInput).toBeChecked();
      await expect(integration.documentServiceSaveButton).toBeEnabled();
    });

    await test.step("Save and verify the change persists", async () => {
      await integration.saveDocumentService();
      await expect(
        page.getByTestId("toast-content").getByText(CHANGES_SAVED),
      ).toBeVisible();
      await expect(integration.documentServiceDisableCertInput).toBeChecked();
    });
  });

  test("Default settings resets the configuration to defaults", async ({
    page,
  }) => {
    await test.step("Change and save the configuration so it differs from default", async () => {
      await integration.toggleDocumentServiceDisableCert();
      await integration.saveDocumentService();
      await expect(
        page.getByTestId("toast-content").getByText(CHANGES_SAVED),
      ).toBeVisible();
    });

    await test.step("Reset to default settings and verify it reverts", async () => {
      await expect(integration.documentServiceDefaultButton).toBeEnabled();
      await integration.resetDocumentServiceToDefault();
      await expect(
        integration.documentServiceDisableCertInput,
      ).not.toBeChecked();
      await expect(integration.documentServiceDefaultButton).toBeDisabled();
    });
  });

  test("Advanced server settings: workspace address can be changed and saved", async ({
    page,
    api,
  }) => {
    const portalUrl = `https://${api.portalDomain}`;

    await test.step("Expand advanced settings and set the workspace address", async () => {
      await integration.toggleDocumentServiceAdvancedSettings();
      await expect(integration.documentServicePortalAddressInput).toBeVisible();
      await integration.documentServicePortalAddressInput.fill(portalUrl);
      await expect(integration.documentServiceSaveButton).toBeEnabled();
    });

    await test.step("Save and verify success", async () => {
      await integration.saveDocumentService();
      await expect(
        page.getByTestId("toast-content").getByText(CHANGES_SAVED),
      ).toBeVisible();
    });

    await test.step("Reopen the tab and verify the value persisted", async () => {
      await integration.open();
      await integration.openDocumentServiceTab();
      await integration.toggleDocumentServiceAdvancedSettings();
      await expect(integration.documentServicePortalAddressInput).toHaveValue(
        new RegExp(api.portalDomain.replace(/\./g, "\\.")),
      );
    });
  });

  test("Invalid Document Server address is rejected with a connection warning", async ({
    page,
  }) => {
    await integration.setDocumentServiceAddress(INVALID_ADDRESS);
    await expect(integration.documentServiceSaveButton).toBeEnabled();
    await integration.saveDocumentService();

    // The backend health-checks the address before applying it.
    await expect(
      page.getByTestId("toast-content").getByText(CONNECTION_ERROR),
    ).toBeVisible({ timeout: 90000 });
  });
});
