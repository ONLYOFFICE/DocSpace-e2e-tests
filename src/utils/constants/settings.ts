const navItems = {
  customization: "Customization",
  security: "Security",
  backup: "Backup",
  integration: "Integration",
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

const integrationTabs = {
  ldap: "LDAP Settings",
  sso: "Single Sign-On",
  plugins: "Plugins",
  thirdPartyServices: "Third-party services",
  smtp: "SMTP Settings",
} as const;

type TIntegrationTabs = (typeof integrationTabs)[keyof typeof integrationTabs];

const toastMessages = {
  backCopyCreated: "The backup copy has been successfully created.",

  settingsUpdated: "Settings have been successfully updated",
  operationCompleted: "Operation has been successfully completed.",
  updatedSuccessfully: "Updated successfully",
  deactivatedSuccessfully: "Deactivated successfully",
  welcomePageSaved: "Welcome Page settings have been successfully saved",

  pluginEnabled: "Plugin enabled",
  pluginDisabled: "Plugin disabled",

  addTrustedDomain: "Add at least 1 trusted domain.",
  addAllowedIp: "Add at least 1 allowed IP address.",
} as const;

export {
  navItems,
  TBackupMethodsIds,
  mapBackupMethodsIds,
  TThirdPartyResource,
  mapThirdPartyResource,
  TThirdPartyStorage,
  mapThirdPartyStorage,
  toastMessages,
  integrationTabs,
  TIntegrationTabs,
};
