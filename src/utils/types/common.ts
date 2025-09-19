type TabInfo = {
  name: string;
  testId: string;
};

export const INFO_PANEL_TABS = {
  History: { name: "History", testId: "info_history_tab" },
  Share: { name: "Share", testId: "info_share_tab" },
  Details: { name: "Details", testId: "info_details_tab" },
  Accesses: { name: "Accesses", testId: "info_access_tab" },
  Contacts: { name: "Contacts", testId: "info_members_tab" },
} as const;

export type TInfoPanelTabs = keyof typeof INFO_PANEL_TABS;

// Helper function to get tab by name
export function getTabInfo(tabName: TInfoPanelTabs): TabInfo {
  return INFO_PANEL_TABS[tabName];
}
