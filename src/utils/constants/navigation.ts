const apps = {
  overview: "Overview",
  files: "Files",
  rooms: "Rooms",
  forms: "Forms",
  aiAgents: "AI agents",
} as const;

const filesSubItems = {
  sharedWithMe: "Shared with me",
  recent: "Recent",
  favorites: "Favorites",
  trash: "Trash",
} as const;

const roomsSubItems = {
  recent: "Recent",
  favorites: "Favorites",
  templates: "Templates",
  archive: "Archive",
  trash: "Trash",
} as const;

const formsSubItems = {
  recent: "Recent",
  favorites: "Favorites",
  templates: "Templates",
  trash: "Trash",
} as const;

const aiAgentsSubItems = {
  recent: "Recent",
  favorites: "Favorites",
  trash: "Trash",
} as const;

type TApp = (typeof apps)[keyof typeof apps];

export {
  apps,
  filesSubItems,
  roomsSubItems,
  formsSubItems,
  aiAgentsSubItems,
  TApp,
};
