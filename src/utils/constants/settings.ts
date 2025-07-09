const navItems = {
  customization: "Customization",
  security: "Security",
  backup: "Backup",
  storageManagement: "Storage Management",
} as const;

const mapBackupMethodsIds = {
  temporaryStorage: "#temporary-storage",
  backupRoom: "#backup-room",
  thirdPartyResource: "#third-party-resource",
  thirdPartyStorage: "#third-party-storage",
} as const;

type TBackupMethodsIds =
  (typeof mapBackupMethodsIds)[keyof typeof mapBackupMethodsIds];

const mapThirdPartyResource = {
  nextcloud: "Nextcloud",
  box: "Box",
  dropbox: "Dropbox",
} as const;

type TThirdPartyResource =
  (typeof mapThirdPartyResource)[keyof typeof mapThirdPartyResource];

const mapThirdPartyStorage = {
  aws: "Amazon AWS S3",
  google: "Google Cloud Storage",
} as const;

type TThirdPartyStorage =
  (typeof mapThirdPartyStorage)[keyof typeof mapThirdPartyStorage];

export {
  navItems,
  TBackupMethodsIds,
  mapBackupMethodsIds,
  TThirdPartyResource,
  mapThirdPartyResource,
  TThirdPartyStorage,
  mapThirdPartyStorage,
};
