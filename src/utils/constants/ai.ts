export const aiAgentToastMessages = {
  pinned: "AI agent pinned",
  notificationsDisabled: "AI agent notifications disabled",
  notificationsEnabled: "AI agent notifications enabled",
  linkCopied: "Link has been copied to the clipboard",
} as const;

export const aiSectionEmptyView = {
  recent: {
    heading: "Recent",
    title: "No recent files yet",
    description:
      "Files recently generated in AI agent chats show up here and stick around for 90 days.",
  },
  favorites: {
    heading: "Favorites",
    title: "No favorite files yet",
    description:
      "Star files generated in AI agent chats to keep them close at hand.",
  },
} as const;
