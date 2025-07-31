const navItems = {
  customization: "Customization",
  security: "Security",
  backup: "Backup",
  developerTools: "Developer Tools",
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