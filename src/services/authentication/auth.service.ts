import { test, APIRequestContext } from "@playwright/test";
import fs from "fs";
import path from "path";

export class AUTH {
  private request: APIRequestContext;
  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async ownerAuth() {
    return test.step("Owner Auth", async () => {
      const response = await this.request.post("/api/2.0/authentication", {
        data: {
          userName: process.env.OWNER_USER_NAME,
          password: process.env.OWNER_PASSWORD,
        },
      });
      const headers = response.headers();
      const cookie = headers["set-cookie"];
      const cookieValue = cookie.split(";")[0];
      this.saveToken("owner", cookieValue);
      return response;
    });
  }

  async userAuth() {
    return test.step("User Auth", async () => {
      const usersData = JSON.parse(fs.readFileSync("users.json", "utf8"));
      const userData = usersData.user;

      const response = await this.request.post("/api/2.0/authentication", {
        data: {
          userName: userData.email,
          password: userData.password,
        },
      });
      const headers = response.headers();
      const cookie = headers["set-cookie"];
      const cookieValue = cookie.split(";")[0];
      this.saveToken("user", cookieValue);
      return response;
    });
  }

  async roomAdminAuth() {
    return test.step("Room admin auth", async () => {
      const usersData = JSON.parse(fs.readFileSync("users.json", "utf8"));
      const userData = usersData.roomAdmin;

      const response = await this.request.post("/api/2.0/authentication", {
        data: {
          userName: userData.email,
          password: userData.password,
        },
      });
      const headers = response.headers();
      const cookie = headers["set-cookie"];
      const cookieValue = cookie.split(";")[0];
      this.saveToken("roomAdmin", cookieValue);
      return response;
    });
  }

  async docSpaceAdminAuth() {
    return test.step("DocSpace admin auth", async () => {
      const usersData = JSON.parse(fs.readFileSync("users.json", "utf8"));
      const userData = usersData.docSpaceAdmin;

      const response = await this.request.post("/api/2.0/authentication", {
        data: {
          userName: userData.email,
          password: userData.password,
        },
      });
      const headers = response.headers();
      const cookie = headers["set-cookie"];
      const cookieValue = cookie.split(";")[0];
      this.saveToken("docspaceAdmin", cookieValue);
      return response;
    });
  }

  private saveToken(role: string, token: string) {
    const tokensPath = path.resolve("tokens.json");
    let tokenData: Record<string, string> = {};

    try {
      const existingData = fs.readFileSync(tokensPath, "utf8");
      tokenData = JSON.parse(existingData);
    } catch {
      console.log("Creating new tokens file");
    }

    tokenData[role] = token;

    fs.writeFileSync(tokensPath, JSON.stringify(tokenData, null, 2));
    console.log(`${role} token saved to tokens.json`);
  }
}
