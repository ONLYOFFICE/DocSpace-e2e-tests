import { Page } from "@playwright/test";
import API from "@/src/api";
import { PaymentApi } from "@/src/api/payment";
import { ApiSDK } from "@/src/services";
import Login from "@/src/objects/common/Login";
import { Integration } from "@/src/objects/settings/integration/Integration";
import { Plugins } from "@/src/objects/settings/integration/Plugins";
import { integrationTabs } from "@/src/utils/constants/settings";
import { TSystemPlugin } from "@/src/utils/constants/plugins";

type TPluginSetup = {
  page: Page;
  api: API;
  apiSdk: ApiSDK;
  login: Login;
  plugin: TSystemPlugin;
  // Uploaded to the owner's My Documents over the API, before the login
  files?: string[];
  // Runs on the Plugins tab after the plugin is enabled (e.g. enter an API key)
  configure?: (plugins: Plugins) => Promise<void>;
};

// Shared precondition of the plugin specs: a paid portal, the test files in
// My Documents and the plugin turned on in Settings > Integration > Plugins.
export async function setupPlugin({
  page,
  api,
  apiSdk,
  login,
  plugin,
  files = [],
  configure,
}: TPluginSetup) {
  await new PaymentApi(api.apiRequestContext, api.apisystem).setupPayment();

  for (const file of files) {
    await apiSdk.files.uploadToMyDocuments("owner", file);
  }

  await login.loginToPortal();

  const integration = new Integration(page);
  const plugins = new Plugins(page);
  await integration.open();
  await integration.openTab(integrationTabs.plugins);
  await plugins.enablePlugin(plugin);
  if (configure) {
    await configure(plugins);
  }
}
