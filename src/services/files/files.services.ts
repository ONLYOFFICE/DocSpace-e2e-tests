import { test, APIRequestContext } from "@playwright/test";
import fs from "fs";
import path from "path";

export class FilesApi {
  private request: APIRequestContext;
  private authTokenOwner: string = "";
  private authTokenDocSpaceAdmin: string = "";
  private portalDomain: string = "";

  constructor(
    request: APIRequestContext,
    authToken: string,
    authTokenDocSpaceAdmin: string,
    portalDomain: string,
  ) {
    this.request = request;
    this.authTokenOwner = authToken;
    this.authTokenDocSpaceAdmin = authTokenDocSpaceAdmin;
    this.portalDomain = portalDomain;
  }

  public setAuthTokenDocSpaceAdmin(token: string) {
    this.authTokenDocSpaceAdmin = token;
  }

  private getToken(role: "owner" | "docSpaceAdmin") {
    const tokens = {
      owner: this.authTokenOwner,
      docSpaceAdmin: this.authTokenDocSpaceAdmin,
    };
    return tokens[role];
  }

  async uploadToMyDocuments(role: "owner" | "docSpaceAdmin", filePath: string) {
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

      return response.json();
    });
  }
}
