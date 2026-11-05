import { test, APIRequestContext, expect } from "@playwright/test";
import { TokenStore, Role } from "../token-store";

// Backend field type enum
export const MetadataFieldType = {
  Text: 0,
  Date: 1,
  Number: 2,
  SingleSelect: 3,
  MultiSelect: 4,
} as const;

export type TMetadataTemplateFieldInput = {
  name: string;
  type: (typeof MetadataFieldType)[keyof typeof MetadataFieldType];
  options?: string[];
};

export type TMetadataTemplate = {
  id: number;
  name: string;
  visible: boolean;
  fields: {
    id: number;
    name: string;
    type: number;
    order: number;
    options?: { id: string; value: string }[];
  }[];
};

export type TMetadataValue = {
  fieldId: number;
  stringValue?: string;
  numberValue?: number;
  dateValue?: string;
  optionIds?: string[];
};

export class MetadataApi {
  private request: APIRequestContext;
  private tokenStore: TokenStore;

  constructor(request: APIRequestContext, tokenStore: TokenStore) {
    this.request = request;
    this.tokenStore = tokenStore;
  }

  private headers(role: Role) {
    return { Authorization: `Bearer ${this.tokenStore.getToken(role)}` };
  }

  private get baseUrl() {
    return `${this.tokenStore.portalBaseUrl}/api/2.0/files/metadata`;
  }

  async createTemplate(
    role: Role,
    data: {
      name: string;
      visible?: boolean;
      fields: TMetadataTemplateFieldInput[];
    },
  ): Promise<TMetadataTemplate> {
    return test.step(`${role} create metadata template "${data.name}"`, async () => {
      const response = await this.request.post(`${this.baseUrl}/templates`, {
        headers: this.headers(role),
        data: {
          name: data.name,
          visible: data.visible ?? true,
          fields: data.fields.map((field, order) => ({
            name: field.name,
            type: field.type,
            order,
            options: field.options?.map((value) => ({ value })),
          })),
        },
      });
      expect(response.ok()).toBeTruthy();
      return (await response.json()).response as TMetadataTemplate;
    });
  }

  async assignTemplatesToFile(
    role: Role,
    fileId: number,
    templateIds: number[],
  ) {
    return test.step(`${role} assign metadata templates to file ${fileId}`, async () => {
      const response = await this.request.put(
        `${this.baseUrl}/file/${fileId}/templates`,
        { headers: this.headers(role), data: { templateIds } },
      );
      expect(response.ok()).toBeTruthy();
    });
  }

  async setFileValues(role: Role, fileId: number, values: TMetadataValue[]) {
    return test.step(`${role} set metadata values of file ${fileId}`, async () => {
      const response = await this.request.put(
        `${this.baseUrl}/file/${fileId}/values`,
        { headers: this.headers(role), data: { values } },
      );
      expect(response.ok()).toBeTruthy();
    });
  }

  async getFileMetadata(role: Role, fileId: number) {
    return test.step(`${role} get metadata of file ${fileId}`, async () => {
      const response = await this.request.get(
        `${this.baseUrl}/file/${fileId}`,
        {
          headers: this.headers(role),
        },
      );
      expect(response.ok()).toBeTruthy();
      return (await response.json()).response as {
        templates: TMetadataTemplate[];
        hasMetadataFields: boolean;
      };
    });
  }
}
