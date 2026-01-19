export const roomCreateTitles = {
  public: "Public room",
  formFilling: "Form filling room",
  collaboration: "Collaboration room",
  virtualData: "Virtual data room",
  custom: "Custom room",
  fromTemplate: "From template",
} as const;

export const roomTemplateTitles = {
  fromTemplate: "Created from template of the public room",
  roomTemplate: "Template of the public room",
} as const;

export const roomDialogSource = {
  navigation: "navigation",
  emptyView: "emptyView",
  article: "article",
} as const;

export const roomContextMenuOption = {
  createRoom: "Create room",
  editRoom: "Edit room",
  inviteContacts: "Invite contacts",
  saveAsTemplate: "Save as template",
  changeTheRoomOwner: "Change the Room Owner",
  moveToArchive: "Move to archive",
  duplicate: "Duplicate",
  pinToTop: "Pin to top",
  disableNotifications: "Disable notifications",
  manage: "Manage",
} as const;

export const templateContextMenuOption = {
  createRoom: "Create room",
  editTemplate: "Edit template",
  accessSettings: "Access settings",
} as const;

export const formFillingRoomContextMenuOption = {
  ...roomContextMenuOption,
  startTour: "Take a short tour",
} as const;

export const formFillingRoomDropdownActions = {
  UPLOAD_PDF_FORM: {
    label: "Upload PDF form",
    submenu: {
      fromDocSpace: "From DocSpace",
      fromDevice: "From device",
    },
  },
  CHOOSE_FROM_TEMPLATE: "Choose from Templates",
  CREATE_FOLDER: "Create new Folder",
} as const;

export type TFormFillingRoomContextMenuOption =
  (typeof formFillingRoomContextMenuOption)[keyof typeof formFillingRoomContextMenuOption];
export const roomSort = {
  name: "Name",
  type: "Type",
  tags: "Size",
  owner: "Owner",
  lastActivity: "Last activity date",
  storage: "Storage",
} as const;

export const roomToastMessages = {
  pinned: "Room pinned",
  notifyDisabled: "Room notifications disabled",
  notifyEnabled: "Room notifications enabled",
  roomsArchived: "The rooms are archived",
  selectedTemplatesDeleted: "Selected room templates have been deleted",
  linkCopied: "Link copied to clipboard",

  duplicate: (folderName: string) =>
    `The folder ${folderName} successfully duplicated`,
  roomArchived: (roomName: string) => `The room '${roomName}' is archived`,
  templateSaved: (roomName: string) => `Room template «${roomName}» saved`,
  baseOnTemplateCreated: (roomName: string) =>
    `Room based on the template «${roomName}» created.`,
};

export type TRoomSort = (typeof roomSort)[keyof typeof roomSort];

export type TRoomContextMenuOption =
  (typeof roomContextMenuOption)[keyof typeof roomContextMenuOption];

export type TTemplateContextMenuOption =
  (typeof templateContextMenuOption)[keyof typeof templateContextMenuOption];

export type TRoomDialogSource =
  (typeof roomDialogSource)[keyof typeof roomDialogSource];

export type TRoomCreateTitles =
  (typeof roomCreateTitles)[keyof typeof roomCreateTitles];

export const tourSteps = {
  welcome: "Welcome to the Form Filling Room!",
  firstStep: "Starting the form filling process",
  secondStep: "Quick sharing",
  thirdStep: "Submitting the responses",
  fourthStep: "Convenient analyzing of the collected responses",
  fifthStep: "Easy form uploading",
};
