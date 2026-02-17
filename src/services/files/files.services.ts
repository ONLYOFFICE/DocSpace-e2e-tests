import { test, APIRequestContext } from "@playwright/test";
import { TokenStore, Role } from "../token-store";
import fs from "fs";
import path from "path";

export class FilesApi {
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

  async uploadToMyDocuments(role: Role, filePath: string) {
    return test.step(`${role} upload file to My Documents`, async () => {
      const resolvedPath = path.resolve(process.cwd(), filePath);

      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`File not found: ${resolvedPath}`);
      }

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/files/@my/upload`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          multipart: {
            file: {
              name: path.basename(resolvedPath),
              mimeType: "application/pdf",
              buffer: fs.readFileSync(resolvedPath),
            },
          },
        },
      );

      if (!response.ok()) {
        const body = await response.text();
        throw new Error(`Upload failed: ${response.status()} - ${body}`);
      }

      const result = await response.json();
      return result.response[0];
    });
  }

  async uploadToFolder(role: Role, folderId: number, filePath: string) {
    return test.step(`${role} upload file to folder ${folderId}`, async () => {
      const resolvedPath = path.resolve(process.cwd(), filePath);

      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`File not found: ${resolvedPath}`);
      }

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/files/${folderId}/upload`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          multipart: {
            file: {
              name: path.basename(resolvedPath),
              mimeType: "application/pdf",
              buffer: fs.readFileSync(resolvedPath),
            },
          },
        },
      );

      if (!response.ok()) {
        const body = await response.text();
        throw new Error(`Upload failed: ${response.status()} - ${body}`);
      }

      const result = await response.json();
      return result.response[0];
    });
  }

  async getMyDocuments(role: Role) {
    return test.step(`${role} get My Documents`, async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/files/@my`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );

      if (!response.ok()) {
        const body = await response.text();
        throw new Error(
          `Get My Documents failed: ${response.status()} - ${body}`,
        );
      }

      return response.json();
    });
  }

  async getFileIdByTitle(role: Role, title: string) {
    return test.step(`${role} get file id by title "${title}"`, async () => {
      const result = await this.getMyDocuments(role);
      const file = result.response.files.find((f: { title: string }) =>
        f.title.includes(title),
      );

      if (!file) {
        const allTitles = result.response.files.map(
          (f: { title: string }) => f.title,
        );
        throw new Error(
          `File "${title}" not found in My Documents. Available files: ${allTitles.join(", ")}`,
        );
      }

      return file.id as number;
    });
  }

  async addToRecent(role: Role, fileId: number) {
    return test.step(`${role} add file to recent`, async () => {
      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/files/file/${fileId}/recent`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );

      if (!response.ok()) {
        const body = await response.text();
        throw new Error(`Add to recent failed: ${response.status()} - ${body}`);
      }

      return response.json();
    });
  }

  async addToFavorites(role: Role, fileIds: number[]) {
    return test.step(`${role} add files to favorites`, async () => {
      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/files/favorites`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: { fileIds },
        },
      );

      if (!response.ok()) {
        const body = await response.text();
        throw new Error(
          `Add to favorites failed: ${response.status()} - ${body}`,
        );
      }

      return response.json();
    });
  }
}
