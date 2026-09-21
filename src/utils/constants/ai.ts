export const aiAgentToastMessages = {
  pinned: "AI agent pinned",
  notificationsDisabled: "AI agent notifications disabled",
  notificationsEnabled: "AI agent notifications enabled",
  linkCopied: "Link has been copied to the clipboard",
} as const;

// Shown instead of the chat composer when a Viewer-access member opens an
// agent that has no chat activity from other members yet.
export const aiAgentViewerChatEmptyView = {
  title: "Nothing to show yet",
  description:
    "You’ll see the results of AI Chat activity from other users here once they become available.",
} as const;

// Shown once when a Viewer-access member opens an agent - regardless of
// whether it already has results to show.
export const aiAgentViewerModeToastMessage =
  "You’re in view-only mode for this AI agent. You can see the results of AI Chat activity from other users.";

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
