import type { TMenuItem } from "@/src/objects/common/BaseMenu";

const menuText = (value: string): TMenuItem => ({ type: "text", value });

// Context menu for a file inside Forms > Recent (matches Files > Recent's
// reduced set: no edit/rename/delete/share since it's a read-only view).
export const formsRecentContextMenuOption = {
  select: menuText("Select"),
  open: menuText("Open"),
  openLocation: menuText("Open location"),
  moveOrCopy: menuText("Move or copy"),
  download: menuText("Download"),
  markAsFavorite: menuText("Mark as favorite"),
  moreOptions: menuText("More options"),
  removeFromList: menuText("Remove from list"),
} as const;

// Same reduced set, but Favorites has no "Mark as favorite" and its removal
// option is labeled differently.
export const formsFavoritesContextMenuOption = {
  select: menuText("Select"),
  open: menuText("Open"),
  openLocation: menuText("Open location"),
  moveOrCopy: menuText("Move or copy"),
  download: menuText("Download"),
  moreOptions: menuText("More options"),
  removeFromFavorites: menuText("Remove from favorites"),
} as const;

export const formsSectionEmptyView = {
  recent: {
    heading: "Recent",
    title: "No recent forms yet",
    description:
      "Forms you've recently opened show up here and stick around for 90 days.",
  },
  favorites: {
    heading: "Favorites",
    title: "No favorite forms yet",
    description: "Star forms to keep them close at hand.",
  },
} as const;
