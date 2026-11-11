export const toastMessages = {
  changesSaved: "Changes saved successfully",
  passwordChanged: "Password has been successfully changed",
  liveChatConnected: "Live chat was successfully connected",
  liveChatDisconnected: "Live chat was successfully disconnected",
} as const;

export const liveChatWindow = {
  title: "Live Support",
  // Sender shown above Zendesk bot messages in the chat log
  botName: "ONLYOFFICE",
} as const;

export const avatarConstants = {
  storagePathPattern: /storage\/userPhotos/,
} as const;

export const defaultHomepageOptions = {
  home: "Home",
  aiRooms: "AI rooms",
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
  aiRooms: /ai-rooms\/filter/,
  files: /rooms\/personal/,
  rooms: /rooms\/shared\/filter/,
  forms: /forms/,
} as const;
