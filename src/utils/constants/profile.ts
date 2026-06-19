export const toastMessages = {
  changesSaved: "Changes saved successfully",
} as const;

export const avatarConstants = {
  storagePathPattern: /storage\/userPhotos/,
} as const;

export const defaultHomepageOptions = {
  aiAgents: "AI agents",
  myDocuments: "My documents",
  rooms: "Rooms",
  sharedWithMe: "Shared with me",
  favorites: "Favorites",
  recent: "Recent",
} as const;

export const notificationsText = {
  fileActivityDescription:
    "Badges will highlight file activity — uploads, edits, or shares — across the Rooms, Shared with me, My documents, and AI agents sections.",
  roomsActivityDescription:
    "Get instant email notifications about new shared files/folders and activity inside your Rooms and AI agents.",
  dailyFeedDescription:
    "Read news and events from your DocSpace in a daily digest.",
  usefulTipsDescription: "Get useful guides about DocSpace",
} as const;

export const defaultHomepageUrls = {
  aiAgents: /ai-agents\/filter/,
  myDocuments: /rooms\/personal/,
  rooms: /rooms\/shared\/filter/,
  sharedWithMe: /shared-with-me/,
  favorites: /files\/favorite/,
  recent: /recent\/filter/,
} as const;
