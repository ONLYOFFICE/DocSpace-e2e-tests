import { ApiSDK } from "@/src/services";
import { Role } from "@/src/services/token-store";
import {
  MetadataFieldType,
  TMetadataTemplate,
  TMetadataTemplateFieldInput,
  TMetadataValue,
} from "@/src/services/files/metadata.services";
import { CONTRACT_TEMPLATE } from "@/src/utils/constants/metadata";

/**
 * API seeding helpers for metadata specs. All items are created as owner
 * unless another role is passed.
 */

// Text and Date take a string (Date - ISO), Number takes a number,
// Single/Multi select take option names
export type TMetadataFieldValue = string | number | string[];

export function getTemplateField(template: TMetadataTemplate, name: string) {
  const field = template.fields.find((f) => f.name === name);
  if (!field) {
    throw new Error(`Field "${name}" not found in "${template.name}"`);
  }
  return field;
}

export function getTemplateOptionId(
  template: TMetadataTemplate,
  fieldName: string,
  value: string,
) {
  const option = getTemplateField(template, fieldName).options?.find(
    (o) => o.value === value,
  );
  if (!option) throw new Error(`Option "${value}" not found in "${fieldName}"`);
  return option.id;
}

export async function createMetadataTemplate(
  apiSdk: ApiSDK,
  name: string,
  fields: TMetadataTemplateFieldInput[],
  role: Role = "owner",
) {
  return apiSdk.metadata.createTemplate(role, { name, fields });
}

// Template with one field of every type - see CONTRACT_TEMPLATE
export async function createContractTemplate(
  apiSdk: ApiSDK,
  role: Role = "owner",
) {
  const { fields } = CONTRACT_TEMPLATE;
  return createMetadataTemplate(
    apiSdk,
    CONTRACT_TEMPLATE.name,
    [
      { name: fields.comment, type: MetadataFieldType.Text },
      { name: fields.due, type: MetadataFieldType.Date },
      { name: fields.amount, type: MetadataFieldType.Number },
      {
        name: fields.status,
        type: MetadataFieldType.SingleSelect,
        options: [...CONTRACT_TEMPLATE.statusOptions],
      },
      {
        name: fields.labels,
        type: MetadataFieldType.MultiSelect,
        options: [...CONTRACT_TEMPLATE.labelsOptions],
      },
    ],
    role,
  );
}

// Title without extension - a .docx is created, the list shows the bare title
export async function createDocxInMyDocuments(
  apiSdk: ApiSDK,
  title: string,
  role: Role = "owner",
): Promise<number> {
  const response = await apiSdk.files.createFileInMyDocuments(role, {
    title: `${title}.docx`,
  });
  return (await response.json()).response.id;
}

export async function createDocxInFolder(
  apiSdk: ApiSDK,
  folderId: number,
  title: string,
  role: Role = "owner",
): Promise<number> {
  const response = await apiSdk.files.createFile(role, folderId, {
    title: `${title}.docx`,
  });
  return (await response.json()).response.id;
}

export async function createFolderInMyDocuments(
  apiSdk: ApiSDK,
  title: string,
  role: Role = "owner",
): Promise<number> {
  const myDocumentsId = await apiSdk.folders.getMyDocumentsFolderId(role);
  const response = await apiSdk.files.createFolder(role, myDocumentsId, title);
  return (await response.json()).response.id;
}

function toMetadataValue(
  template: TMetadataTemplate,
  fieldName: string,
  value: TMetadataFieldValue,
): TMetadataValue {
  const field = getTemplateField(template, fieldName);
  switch (field.type) {
    case MetadataFieldType.Text:
      return { fieldId: field.id, stringValue: String(value) };
    case MetadataFieldType.Date:
      return { fieldId: field.id, dateValue: String(value) };
    case MetadataFieldType.Number:
      return { fieldId: field.id, numberValue: Number(value) };
    default: {
      const names = Array.isArray(value) ? value : [String(value)];
      return {
        fieldId: field.id,
        optionIds: names.map((n) =>
          getTemplateOptionId(template, fieldName, n),
        ),
      };
    }
  }
}

/**
 * Creates a .docx (in My Documents or in a folder), assigns the template and
 * sets values by field name. Returns the file id.
 */
export async function createFileWithMetadata(
  apiSdk: ApiSDK,
  data: {
    title: string;
    template: TMetadataTemplate;
    values: Record<string, TMetadataFieldValue>;
    folderId?: number;
  },
  role: Role = "owner",
): Promise<number> {
  const fileId =
    data.folderId === undefined
      ? await createDocxInMyDocuments(apiSdk, data.title, role)
      : await createDocxInFolder(apiSdk, data.folderId, data.title, role);
  await apiSdk.metadata.assignTemplatesToFile(role, fileId, [data.template.id]);
  await apiSdk.metadata.setFileValues(
    role,
    fileId,
    Object.entries(data.values).map(([name, value]) =>
      toMetadataValue(data.template, name, value),
    ),
  );
  return fileId;
}

// Undefined when the template is not assigned or the field has no value
export async function getFileFieldValue(
  apiSdk: ApiSDK,
  fileId: number,
  templateName: string,
  fieldName: string,
  role: Role = "owner",
) {
  const metadata = await apiSdk.metadata.getFileMetadata(role, fileId);
  return metadata.templates
    .find((t) => t.name === templateName)
    ?.fields.find((f) => f.name === fieldName)?.value;
}
