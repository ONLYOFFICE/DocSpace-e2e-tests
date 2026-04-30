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

export const defaultHomepageUrls = {
  aiAgents: /ai-agents\/filter/,
  myDocuments: /rooms\/personal/,
  rooms: /rooms\/shared\/filter/,
  sharedWithMe: /shared-with-me/,
  favorites: /files\/favorite/,
  recent: /recent\/filter/,
} as const;
