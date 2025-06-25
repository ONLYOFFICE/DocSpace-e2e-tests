import { TListDocActions } from "./types/files";

export const transformDocActions = (docActions: TListDocActions) => {
  return docActions.map((actionText) => {
    const trimmed = actionText.trim();
    if (trimmed.toLowerCase().startsWith("new")) {
      const rest = trimmed.slice(3).trim();
      return rest.charAt(0).toUpperCase() + rest.slice(1);
    }
    return actionText;
  });
};
