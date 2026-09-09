export const toastMessages = {
  changesSaved: "Changes saved successfully",
  passwordChanged: "Password has been successfully changed",
} as const;

export const avatarConstants = {
  storagePathPattern: /storage\/userPhotos/,
} as const;

export const defaultHomepageOptions = {
  home: "Home",
  aiAgents: "AI agents",
  files: "Files",
  rooms: "Rooms",
  forms: "Forms",
} as const;

export const notificationsText = {
  fileActivityDescription:
    "Badges highlight file activities like uploads, edits, and shares across Files, Rooms, Forms, and AI agents apps.",
  roomsActivityDescription:
    "Get instant email notifications about new shared files and folders and activity in Files, Rooms, Forms, and AI agents.",
  dailyFeedDescription:
    "Receive a daily digest of news and events from ONLYOFFICE Apps.",
  usefulTipsDescription:
    "Discover useful tips and guides for using ONLYOFFICE Apps.",
} as const;

export const defaultHomepageUrls = {
  aiAgents: /ai-agents\/filter/,
  files: /rooms\/personal/,
  rooms: /rooms\/shared\/filter/,
  forms: /forms/,
} as const;
