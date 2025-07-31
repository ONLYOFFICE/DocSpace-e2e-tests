const navItems = {
  customization: "Customization",
  security: "Security",
  backup: "Backup",
<<<<<<< HEAD
  storageManagement: "Storage Management",
=======
  integration: "Integration",
  payments: "Payments",
>>>>>>> origin/main
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

const certificateType = {
  signing: "Signing",
  encryption: "Encryption",
  signAndEcrypt: "Signing and encryption",
} as const;

type TCertificateType = (typeof certificateType)[keyof typeof certificateType];

const paymentsTab = {
  tariffPlan: "Tariff plan",
  wallet: "Wallet",
};

type TPaymentsTab = (typeof paymentsTab)[keyof typeof paymentsTab];

const transactionHistoryFilter = {
  allTransactions: "All transactions",
  credit: "Credit",
  debit: "Debit",
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
  mapBackupMethodsIds,
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
