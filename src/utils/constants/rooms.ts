export const roomCreateTitles = {
  public: "Public room",
  formFilling: "Form filling room",
  collaboration: "Collaboration room",
  virtualData: "Virtual data room",
  custom: "Custom room",
  fromTemplate: "From template",
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
} as const;

export const templateContextMenuOption = {
  createRoom: "Create room",
  editTemplate: "Edit template",
  accessSettings: "Access settings",
} as const;

export type TRoomContextMenuOption =
  (typeof roomContextMenuOption)[keyof typeof roomContextMenuOption];

export type TTemplateContextMenuOption =
  (typeof templateContextMenuOption)[keyof typeof templateContextMenuOption];

export type TRoomDialogSource =
  (typeof roomDialogSource)[keyof typeof roomDialogSource];

export type TRoomCreateTitles =
  (typeof roomCreateTitles)[keyof typeof roomCreateTitles];
