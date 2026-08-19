// Room types offered by the "Choose room type" dialog, keyed by the label shown
// in the UI. `formFilling` is no longer creatable from the Rooms app - the type
// moved to the Forms app and was renamed to "Form Filling Space" - but the
// constant stays because prod still runs the legacy UI (see daily_prod_check.spec.ts).
export const roomCreateTitles = {
  public: "Public room",
  formFilling: "Form Filling room",
  formSet: "Form Filling Space",
  collaboration: "Collaboration room",
  virtualData: "Virtual Data Room",
  custom: "Custom room",
  private: "Private Room",
  fromTemplate: "From template",
} as const;

// Types the Rooms app creates without any extra setup. `private` is excluded on
// purpose: it needs an end-to-end encryption key first, so it has its own test.
export const roomTypesCreatableFromRooms = [
  roomCreateTitles.public,
  roomCreateTitles.collaboration,
  roomCreateTitles.virtualData,
  roomCreateTitles.custom,
] as const;

export const encryptionKeyDialog = {
  title: "Encryption key required",
  description:
    "Private rooms use end-to-end encryption. To continue, you need an encryption key.",
} as const;

export const roomTemplateTitles = {
  fromTemplate: "Created from template of the public room",
  roomTemplate: "Template of the public room",
  editedTemplate: "Edited template name",
} as const;

// Entry points to room creation. The old "article" source is gone: the create
// button moved out of the left rail into the filter toolbar (= navigation).
// "quickActions" are the tiles above the list, which skip type selection and
// open the create form for their type directly.
export const roomDialogSource = {
  navigation: "navigation",
  emptyView: "emptyView",
  quickActions: "quickActions",
} as const;

export const roomContextMenuOption = {
  createRoom: "Create room",
  editRoom: "Edit room",
  inviteContacts: "Invite contacts",
  saveAsTemplate: "Save as template",
  changeTheRoomOwner: "Change Room Owner",
  moveToArchive: "Move to archive",
  duplicate: "Duplicate",
  pinToTop: "Pin to top",
  disableNotifications: "Disable notifications",
  manage: "More options",
  removeFromGroup: "Remove from group",
} as const;

export const vdrRoomContextMenuOption = {
  editIndex: "Edit index",
  exportRoomIndex: "Export room index",
  moreOptions: "More options",
} as const;

export const roomGroupContextMenuOption = {
  createGroup: { type: "data-testid" as const, value: "option_create-group" },
  addToGroup: { type: "data-testid" as const, value: "option_add-to-group" },
  leaveRoom: { type: "data-testid" as const, value: "option_leave-room" },
  moreOptions: { type: "data-testid" as const, value: "option_more-options" },
  changeRoomOwner: {
    type: "data-testid" as const,
    value: "option_change-room-owner",
  },
};

export const templateContextMenuOption = {
  createRoom: "Create room",
  editTemplate: "Edit template",
  accessSettings: "Access settings",
  download: "Download",
  delete: "Delete template",
} as const;

export const formFillingRoomContextMenuOption = {
  ...roomContextMenuOption,
  startTour: "Take a short tour",
} as const;

export const formFillingRoomDropdownActions = {
  UPLOAD_PDF_FORM: {
    label: "Upload PDF form",
    submenu: {
      fromDocSpace: "From the workspace",
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
  formFillingLinkShared:
    "Anyone with the link will be able to fill out the form of the room. The link has no expiration date",

  duplicate: (folderName: string) =>
    `The folder ${folderName} successfully duplicated`,
  roomArchived: (roomName: string) => `The room '${roomName}' is archived`,
  templateSaved: (roomName: string) => `Room template «${roomName}» saved`,
  baseOnTemplateCreated: (roomName: string) =>
    `Room based on the template «${roomName}» created.`,
  removedFromGroup: (groupName: string) =>
    `The selected room has been removed from ${groupName}.`,
  roomGroupingEnabled: "Room grouping is enabled",
  roomGroupingDisabled: "Room grouping is disabled",
  leftRoom: "You have left the room",
  appointedNewOwner: "You have appointed a new owner.",
  tagRemoved: (tagName: string) => `${tagName} tag removed`,
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

export const formFillingSystemFolders = {
  complete: "Complete",
  inProcess: "In process",
} as const;

export const tourSteps = {
  welcome: "Welcome to the Form Filling Room!",
  firstStep: "Starting the form filling process",
  secondStep: "Quick sharing",
  thirdStep: "Submitting the responses",
  fourthStep: "Convenient analyzing of the collected responses",
  fifthStep: "Easy form uploading",
};
