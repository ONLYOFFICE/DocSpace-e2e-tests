const apps = {
  overview: "Overview",
  files: "Files",
  rooms: "Rooms",
  forms: "Forms",
  aiAgents: "AI Chat",
} as const;

const filesSubItems = {
  sharedWithMe: "Shared with me",
  recent: "Recent files",
  favorites: "Favorite files",
  trash: "Trash",
} as const;

const roomsSubItems = {
  recent: "Recent files",
  favorites: "Favorite files",
  templates: "Templates",
  archive: "Archive",
  trash: "Trash",
} as const;

const formsSubItems = {
  recent: "Recent files",
  favorites: "Favorite files",
  templates: "Templates",
  trash: "Trash",
} as const;

// "AI Chat" itself opens the chat fullscreen over the Agents list; the
// list is reached through its "Agents" sub-item.
const aiAgentsSubItems = {
  agents: "Agents",
  recents: "Recents",
  skillSets: "Skill sets",
  knowledgeBases: "Knowledge bases",
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
