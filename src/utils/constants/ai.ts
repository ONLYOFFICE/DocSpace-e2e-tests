export const aiAgentToastMessages = {
  pinned: "AI agent pinned",
  notificationsDisabled: "AI agent notifications disabled",
  notificationsEnabled: "AI agent notifications enabled",
  linkCopied: "Link has been copied to the clipboard",
  promptSaved: "Prompt saved",
  promptSavedToFolder: (folderName: string) =>
    `Prompt saved to “${folderName}”`,
  // Followed by the generated file name, e.g. "Greeting.docx".
  messageExported: "Message exported to file:",
} as const;

// Confirmation dialog shown when deleting a saved AI prompt from the
// composer's Prompts library.
export const aiDeletePromptDialog = {
  title: "Delete saved prompt",
  message: "This action will permanently delete the selected prompt.",
} as const;

// Confirmation dialog shown when deleting a prompt folder from the
// composer's Prompts library - removes the folder with all its prompts.
export const aiDeletePromptFolderDialog = {
  title: "Warning",
  message: "Are you sure you want to delete this folder and all its prompts?",
} as const;

// Placeholder title a chat has until the AI generates one after the first reply.
export const aiDefaultChatTitle = "New chat";

// Confirmation shown on "Delete" in the AI Chat history list.
export const aiDeleteChatDialog = {
  title: "Warning",
  message: "Are you sure you want to delete this chat?",
} as const;

// Suggestion chips shown above the AI Chat composer on a fresh chat. Every
// section and sub-section has its own set (keys match navigation.ts
// sub-items; "root" is the app's main page). AI agents has none.
export const aiChatSuggestions = {
  files: {
    root: [
      "Show file structure",
      "Organize files into folders",
      "Find files by topic",
      "Find large files",
      "Find possible duplicates",
      "Suggest files to clean up",
    ],
    sharedWithMe: [
      "What's shared with me",
      "What needs my action",
      "Find files from a person",
      "Copy to my files",
    ],
    recent: [
      "Summarize recent files",
      "Find recent files by topic",
      "Organize recent files",
    ],
    favorites: [
      "Summarize favorites",
      "Find information in favorites",
      "Compare favorite files",
      "Copy to a folder",
    ],
    trash: [
      "What's in Trash",
      "Find a deleted file",
      "Restore selected items",
      "What can be deleted permanently",
      "Empty Trash",
    ],
  },
  rooms: {
    root: [
      "Help me choose a room type",
      "Find rooms by participant",
      "Find a room by file",
      "Show rooms I manage",
      "Show rooms with external access",
      "Suggest rooms to archive",
    ],
    recent: [
      "Summarize recent rooms",
      "Where my action is needed",
      "Review access in recent rooms",
      "Archive inactive rooms",
    ],
    favorites: [
      "Summarize favorite rooms",
      "Find a favorite room",
      "Archive selected rooms",
    ],
    templates: [
      "Recommend a room template",
      "Create a room from a template",
      "Explain this template",
      "Update template",
      "Save as template",
    ],
    archive: [
      "Show room archive",
      "Find a room in the archive",
      "Restore a room from the archive",
      "Delete an archived room",
    ],
    trash: [
      "What's deleted",
      "Find a deleted file or folder",
      "Restore a room",
      "Delete permanently",
    ],
  },
  forms: {
    root: [
      "Create a Form Space",
      "Start from a form template",
      "Create a form with AI",
      "Convert a file into a form",
    ],
    recent: [
      "Summarize recent Form Spaces",
      "Recent results",
      "Where action is needed",
      "Continue form setup",
    ],
    favorites: [
      "Summarize favorite Form Spaces",
      "Compare favorite Form Spaces",
      "Create a similar Form Space",
      "Find the form you need",
    ],
    templates: [
      "Recommend a form template",
      "Create a Form Space from a template",
      "Adapt the template to the task",
      "Show template fields",
      "Save as template",
    ],
    trash: [
      "What's deleted",
      "Find a deleted form",
      "Restore selected items",
      "Delete permanently",
    ],
  },
} as const;

// AI Chat panel on a portal where AI features were never activated. A Full
// admin can activate it right there; other users are told to ask an admin.
export const aiChatNotActiveScreen = {
  accessNote:
    "Get access to a wide range of AI models through OpenRouter integration:",
  pricingLinkText: "OpenRouter pricing",
  pricingUrl: "https://openrouter.ai/models",
  admin: {
    description: "Activate AI Chat to start conversations in this section.",
    benefits: [
      "Work with rooms, files, and folders",
      "OpenRouter pricing, plus a 11% service fee",
      "Pay-as-you-go, billed from your Wallet",
    ],
  },
  user: {
    description:
      "Contact your Full admin to activate AI Chat for this workspace.",
    benefits: [
      "Work with rooms, files, and folders",
      "Pay-as-you-go, billed from your Wallet",
    ],
  },
} as const;

// Root sections of the "Save as docx" selector opened from an AI reply.
// Forms is listed here only to assert that it is absent.
export const aiSaveAsDocxSections = {
  files: "Files",
  rooms: "Rooms",
  aiAgents: "AI agents",
  forms: "Forms",
} as const;

// "Export to..." submenu of a chat in the AI Chat history list.
export const aiChatExportFormats = [
  { label: ".pdf document", extension: ".pdf" },
  { label: ".docx document", extension: ".docx" },
  { label: ".md file", extension: ".md" },
] as const;

export type TAiChatExportFormat = (typeof aiChatExportFormats)[number];

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
