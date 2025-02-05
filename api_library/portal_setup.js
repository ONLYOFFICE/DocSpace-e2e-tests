import { FilesApi } from "../api_library/files/files_api";
import config from "../config/config";
import log from "../utils/logger";

export class PortalSetupApi {
  constructor(apiContext) {
    this.apiContext = apiContext;
    this.baseURL = config.PORTAL_REGISTRATION_URL;
    this.awsRegion = config.AWS_REGION;
    this.token = null;
    this.portalName = null;
    this.portalDomain = null;
    this.adminUserId = null;
    this.documentsApi = null;
  }

  // Creating a portal
  async createPortal(portalNamePrefix = "test-portal") {
    this.portalName = `${portalNamePrefix}-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    log.info(`Creating portal: ${this.portalName}`);

    const response = await this.apiContext.post(`${this.baseURL}/register`, {
      data: {
        portalName: this.portalName,
        firstName: "admin-zero",
        lastName: "admin-zero",
        email: config.DOCSPACE_ADMIN_EMAIL,
        password: config.DOCSPACE_ADMIN_PASSWORD,
        language: "en",
        awsRegion: this.awsRegion,
      },
    });

    const body = await response.json();
    if (!response.ok()) {
      log.debug(
        `Failed to create portal: ${response.status()} - ${body.error || body.message}`,
      );
      throw new Error(
        `Failed to create portal: ${response.status()} - ${body.error || body.message}`,
      );
    }

    this.portalDomain = body.tenant.domain;
    this.adminUserId = body.tenant.ownerId;

    log.info(
      `Portal created successfully: ${this.portalName} (${this.portalDomain})`,
    );
    log.debug(`Full Response: ${JSON.stringify(body, null, 2)}`);

    return body;
  }

  async authenticate() {
    const email = config.DOCSPACE_ADMIN_EMAIL;
    const password = config.DOCSPACE_ADMIN_PASSWORD;

    log.debug(`Authenticating admin user: ${email}`);
    const authResponse = await this.apiContext.post(
      `https://${this.portalDomain}/api/2.0/authentication`,
      {
        data: { userName: email, password },
      },
    );

    const authBody = await authResponse.json();
    if (!authResponse.ok()) {
      log.debug(
        `Authentication failed: ${authResponse.status()} - ${authBody.error || authBody.message}`,
      );
      throw new Error(
        `Authentication failed: ${authResponse.status()} - ${authBody.error || authBody.message}`,
      );
    }

    this.token = authBody.response.token;
    log.info("Authenticated successfully.");
    log.debug(`Token: ${this.token}`);
    return this.token;
  }

  getAuthHeaders() {
    if (!this.token) {
      throw new Error("Token is not set. Please authenticate first.");
    }
    return { Authorization: `Bearer ${this.token}` };
  }

  async activateAdminUser() {
    log.debug("Activating admin user...");
    const response = await this.apiContext.put(
      `https://${this.portalDomain}/api/2.0/people/activationstatus/Activated`,
      {
        headers: this.getAuthHeaders(),
        data: { userIds: [this.adminUserId] },
      },
    );

    const body = await response.json();
    if (!response.ok()) {
      log.error(
        `Failed to activate admin user: ${response.status()} - ${body.error || body.message}`,
      );
      throw new Error(
        `Failed to activate admin user: ${response.status()} - ${body.error || body.message}`,
      );
    }

    log.debug(`Activation Response: ${JSON.stringify(body, null, 2)}`);
    return body;
  }

  //Lazy initialization of DocumentsApi
  async #initDocumentsApi() {
    if (!this.documentsApi) {
      this.documentsApi = new FilesApi(this.apiContext, this.portalDomain, () =>
        this.getAuthHeaders(),
      );
    }
  }

  /**
   * Clean up all files and folders in "My Documents".
   * This method ensures that the portal is clean before deletion.
   */
  async cleanupFilesAndFolders() {
    await this.#initDocumentsApi();
    try {
      log.info("Cleaning up files and folders in My Documents...");
      await this.documentsApi.deleteAllFilesInMyDocs();
      await this.documentsApi.deleteAllFoldersInMyDocs();
      log.info("All files and folders deleted successfully.");
    } catch (error) {
      log.error("Error during cleanup:", error.message);
      throw error;
    }
  }

  /**
   * Delete the portal, optionally cleaning up files and folders first.
   * @param {boolean} cleanup - If true, cleans up files and folders before deleting the portal.
   */
  async deletePortal(cleanup = true) {
    if (cleanup) {
      await this.cleanupFilesAndFolders();
    }
    const deleteUrl = `https://${this.portalDomain}/api/2.0/portal/deleteportalimmediately`;
    log.debug(`Attempting to delete portal: ${this.portalName}`);

    const response = await this.apiContext.delete(deleteUrl, {
      headers: this.getAuthHeaders(),
      data: { reference: `${this.portalName}.onlyoffice.io` },
    });

    if (response.status() !== 200) {
      const errorText = await response.text();
      log.error(`Failed to delete portal: ${response.status()} - ${errorText}`);
      throw new Error(
        `Failed to delete portal: ${response.status()} - ${errorText}`,
      );
    }

    log.info(`Portal deleted successfully: ${this.portalName}`);
  }

  async setupPortal(portalNamePrefix = "test-portal") {
    const portalData = await this.createPortal(portalNamePrefix);
    await this.authenticate();
    await this.activateAdminUser();
    return portalData;
  }
}
