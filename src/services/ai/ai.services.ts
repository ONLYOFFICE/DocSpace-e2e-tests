import { test, APIRequestContext } from "@playwright/test";
import { TokenStore, Role } from "../token-store";

export type AiProfile = {
  id: string;
  name: string;
};

export class AiAgentsApi {
  private request: APIRequestContext;
  private tokenStore: TokenStore;

  constructor(request: APIRequestContext, tokenStore: TokenStore) {
    this.request = request;
    this.tokenStore = tokenStore;
  }

  private getToken(role: Role) {
    return this.tokenStore.getToken(role);
  }

  private get portalBaseUrl() {
    return this.tokenStore.portalBaseUrl;
  }

  async listProfiles(role: Role): Promise<AiProfile[]> {
    return test.step(`${role} list AI model profiles`, async () => {
      const response = await this.request.get(
        `${this.portalBaseUrl}/api/2.0/ai/profiles/list`,
        { headers: { Authorization: `Bearer ${this.getToken(role)}` } },
      );
      return response.json();
    });
  }

  async getProfileIdByModelName(
    role: Role,
    modelName: string,
  ): Promise<string> {
    const profiles = await this.listProfiles(role);
    const match = profiles.find((p) => p.name === modelName);
    if (!match) {
      throw new Error(
        `Model profile "${modelName}" not found. Available: ${profiles
          .map((p) => p.name)
          .join(", ")}`,
      );
    }
    return match.id;
  }

  async createAgent(
    role: Role,
    data: {
      title: string;
      prompt?: string;
      profileId?: string;
      color?: string;
      cover?: string;
      attachDefaultTools?: boolean;
    },
  ) {
    return test.step(`${role} create AI agent "${data.title}"`, async () => {
      const profileId =
        data.profileId ?? (await this.listProfiles(role))[0]?.id;

      const response = await this.request.post(
        `${this.portalBaseUrl}/api/2.0/ai/agents`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: {
            title: data.title,
            cover: data.cover ?? "",
            color: data.color ?? "4CAF50",
            attachDefaultTools: data.attachDefaultTools ?? false,
            profileId,
            prompt: data.prompt ?? "",
          },
        },
      );
      return response;
    });
  }
}
