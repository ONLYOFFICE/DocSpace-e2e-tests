const navItems = {
  customization: "Customization",
  security: "Security",
  backup: "Backup",
  integration: "Integration",
  payments: "Payments",
  developerTools: "Developer Tools",
  services: "Services",
  storageManagement: "Storage Management",
} as const;

const mapBackupMethodsIds = {
  temporaryStorage: "temporary_storage_radio_button",
  backupRoom: "backup_room_radio_button",
  thirdPartyResource: "third_party_resource_radio_button",
  thirdPartyStorage: "third_party_storage_radio_button",
} as const;

const mapAutoBackupMethodsIds = {
  backupRoom: "auto_backup_room_radio_button",
  thirdPartyResource: "auto_backup_resource_radio_button",
  thirdPartyStorage: "auto_backup_storage_radio_button",
} as const;

type TBackupMethodsIds =
  (typeof mapBackupMethodsIds)[keyof typeof mapBackupMethodsIds];

type TAutoBackupMethodsIds =
  (typeof mapAutoBackupMethodsIds)[keyof typeof mapAutoBackupMethodsIds];

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
  ldap: "ldap_tab",
  sso: "sso_tab",
  plugins: "plugins_tab",
  thirdPartyServices: "third-party-services_tab",
  smtp: "smtp-settings_tab",
} as const;

type TIntegrationTabs = (typeof integrationTabs)[keyof typeof integrationTabs];

const certificateType = {
  signing: "Signing",
  encryption: "Encryption",
  signAndEcrypt: "Signing and encryption",
} as const;

type TCertificateType = (typeof certificateType)[keyof typeof certificateType];

const paymentsTab = {
  tariffPlan: "portal-payments_tab",
  wallet: "wallet_tab",
};

type TPaymentsTab = (typeof paymentsTab)[keyof typeof paymentsTab];

const transactionHistoryFilter = {
  allTransactions: "all_transactions_option",
  credit: "credit_transactions_option",
  debit: "debit_transactions_option",
} as const;

type TTransactionHistoryFilter =
  (typeof transactionHistoryFilter)[keyof typeof transactionHistoryFilter];

const toastMessages = {
  // backup
  backCopyCreated: "The backup copy has been successfully created.",
  settingsUpdated: "Settings have been successfully updated",
  operationCompleted: "Operation has been successfully completed.",
  updatedSuccessfully: "Updated successfully",
  deactivatedSuccessfully: "Deactivated successfully",
  welcomePageSaved: "Welcome Page settings have been successfully saved",

  // storage management
  roomQuotaEnabled: "Room quota has been successfully enabled",
  userQuotaEnabled: "User quota has been successfully enabled",
  aiQuotaEnabled: "AI agent quota has been successfully enabled",

  // plugins
  pluginEnabled: "Plugin enabled",
  pluginDisabled: "Plugin disabled",
  tokenSaved: "Token is saved",

  // security
  addTrustedDomain: "Add at least 1 trusted domain.",
  addAllowedIp: "Add at least 1 allowed IP address.",

  //sso
  certificateExists: "Certificate with same action type already exists",
  invalidBinding:
    "Invalid binding: SSO urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST",

  //payments
  walletToppedUp: "Wallet has been successfully topped up",
  planUpdated: "Business plan updated",
  requestSent:
    "Your message was successfully sent. You will be contacted by the Sales Department.",
} as const;

export {
  navItems,
  TBackupMethodsIds,
  TAutoBackupMethodsIds,
  mapBackupMethodsIds,
  mapAutoBackupMethodsIds,
  TThirdPartyResource,
  mapThirdPartyResource,
  TThirdPartyStorage,
  mapThirdPartyStorage,
  toastMessages,
  integrationTabs,
  TIntegrationTabs,
  certificateType,
  TCertificateType,
  paymentsTab,
  TPaymentsTab,
  transactionHistoryFilter,
  TTransactionHistoryFilter,
};
