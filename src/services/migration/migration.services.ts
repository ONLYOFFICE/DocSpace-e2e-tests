import { test, APIRequestContext } from "@playwright/test";
import { TokenStore, Role } from "../token-store";

export type TMigrationUser = {
  key: string;
  email: string;
  displayName: string;
  migratingFiles: {
    foldersCount: number;
    filesCount: number;
    bytesTotal: number;
  };
};

export type TMigrationStatus = {
  progress: number;
  error: string;
  isCompleted: boolean;
  parseResult: {
    operation: string;
    failedArchives: string[];
    users: TMigrationUser[];
    files: string[];
  };
};

export class MigrationApi {
  private request: APIRequestContext;
  private tokenStore: TokenStore;

  constructor(request: APIRequestContext, tokenStore: TokenStore) {
    this.request = request;
    this.tokenStore = tokenStore;
  }

  private get portalBaseUrl() {
    return this.tokenStore.portalBaseUrl;
  }

  private headers(role: Role) {
    return { Authorization: `Bearer ${this.tokenStore.getToken(role)}` };
  }

  async getStatus(role: Role): Promise<TMigrationStatus> {
    return test.step(`${role} get migration status`, async () => {
      const response = await this.request.get(
        `${this.portalBaseUrl}/api/2.0/migration/status`,
        { headers: this.headers(role) },
      );
      const body = await response.json();
      return body.response as TMigrationStatus;
    });
  }
}
