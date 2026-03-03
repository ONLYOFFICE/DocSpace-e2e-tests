import { test, APIRequestContext } from "@playwright/test";
import { TokenStore, Role } from "../token-store";

export class FoldersApi {
  private request: APIRequestContext;
  private tokenStore: TokenStore;

  constructor(request: APIRequestContext, tokenStore: TokenStore) {
    this.request = request;
    this.tokenStore = tokenStore;
  }

  private getToken(role: Role) {
    return this.tokenStore.getToken(role);
  }

  private get portalDomain() {
    return this.tokenStore.portalDomain;
  }

  async getMyDocumentsFolderId(role: Role): Promise<number> {
    return test.step(`${role} get My Documents folder ID`, async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/files/@my`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );
      const body = await response.json();
      return body.response.current.id as number;
    });
  }

  async setFolderOrder(role: Role, folderId: number, order: number) {
    return test.step(`${role} set order ${order} for folder ${folderId}`, async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/files/folder/${folderId}/order`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: { order },
        },
      );
      return response;
    });
  }

  async createFolder(role: Role, folderId: number, data: { title: string }) {
    return test.step(`${role} create folder "${data.title}" in ${folderId}`, async () => {
      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/files/folder/${folderId}`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data,
        },
      );
      return response;
    });
  }
}
