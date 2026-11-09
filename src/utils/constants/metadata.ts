// Default template seeded via API in metadata specs - one field of every type
export const CONTRACT_TEMPLATE = {
  name: "Contract details",
  fields: {
    comment: "Comment",
    due: "Due",
    amount: "Amount",
    status: "Status",
    labels: "Labels",
  },
  statusOptions: ["Open", "Closed"],
  labelsOptions: ["Urgent", "Internal"],
} as const;

// Backend share access levels for PUT files/file|folder/{id}/share
export const FILE_SHARE_ACCESS = { read: 2, comment: 6, editing: 10 } as const;

export const metadataToastMessages = {
  appliedToFolder: (template: string, folder: string) =>
    `${template} metadata has been applied to all items in ${folder}`,
} as const;
