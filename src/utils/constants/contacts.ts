export const contactsActionsMenu = {
  invite: {
    label: "Invite",
    submenu: {
      docspaceAdmin: "DocSpace admin",
      roomAdmin: "Room admin",
      user: "User",
      inviteAgain: "Invite again",
    },
  },
  createGroup: "Create group",
} as const;

export const ADMIN_OWNER_NAME = "admin-zero admin-zero";

export const GROUP_NAME = "Test Group";

export const menuItemChangeUserType = {
  docspaceAdmin: {
    type: "id",
    value: "menu_change-user_administrator",
  },
  roomAdmin: {
    type: "id",
    value: "menu_change-user_manager",
  },
  user: {
    type: "id",
    value: "menu_change-collaborator",
  },
  guest: {
    type: "id",
    value: "menu_change-guest",
  },
} as const;

export const userEmails = {
  docspaceAdmin: "testDocAdmin123@docspace.com",
  roomAdmin: "testRoomAdmin123@docspace.com",
  user: "testUser123@docspace.com",
  guest: "testGuest123@docspace.com",
} as const;

export const contactTypes = {
  docspaceAdmin: "DocSpace admin",
  roomAdmin: "Room admin",
  user: "User",
  guest: "Guest",
  owner: "Owner",
} as const;

export type TContactType = (typeof contactTypes)[keyof typeof contactTypes];
export type TUserEmail = (typeof userEmails)[keyof typeof userEmails];

export const membersContextMenuOption = {
  invite: "Invite",
  disable: "Disable",
  enable: "Enable",
  delete: "Delete user",
  reassign: "Reassign data",
  info: "Info",
} as const;

export const groupsContextMenuOption = {
  editGroup: "Edit group",
  info: "Info",
  delete: "Delete",
} as const;

export const guestsContextMenuOption = {
  info: "Info",
  delete: "Delete guest",
  enable: "Enable",
  changeType: "Change type",
  disable: "Disable",
} as const;

export const ownerContextMenuOption = {
  changeOwner: "Change owner",
  changeName: "Change name",
  changeEmail: "Change email",
  changePassword: "Change password",
} as const;

export type TGroupsContextMenuOption =
  (typeof groupsContextMenuOption)[keyof typeof groupsContextMenuOption];

export type TGuestsContextMenuOption =
  (typeof guestsContextMenuOption)[keyof typeof guestsContextMenuOption];

export type TMembersContextMenuOption =
  (typeof membersContextMenuOption)[keyof typeof membersContextMenuOption];

export type TOwnerContextMenuOption =
  (typeof ownerContextMenuOption)[keyof typeof ownerContextMenuOption];

export type TContactsContextMenuOption =
  | TMembersContextMenuOption
  | TGroupsContextMenuOption
  | TGuestsContextMenuOption
  | TOwnerContextMenuOption;

export type TInviteResponseData = {
  response: {
    email: string;
    id: string;
  };
};

export const contactSort = {
  name: "Name",
  type: "Type",
  group: "Group",
  email: "Email",
  storage: "Storage",
} as const;

export type TContactSort = (typeof contactSort)[keyof typeof contactSort];

export const toastMessages = {
  changesSaved: "Changes saved successfully",
  userStatusChanged: "The user status was successfully changed",
  userTypeChanged: "The user type was successfully changed",
  usersInvited: "Users invited",
  groupDeleted: "Group was deleted successfully",
  guestDeleted: "Guest was deleted successfully",
  guestTypeChanged: "The guest type was successfully changed",
  guestStatusChanged: "The guest status was successfully changed",
} as const;
