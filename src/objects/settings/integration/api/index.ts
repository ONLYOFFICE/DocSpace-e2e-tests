import { waitForAllResponses } from "@/src/utils";
import { Page } from "@playwright/test";

export const waitForGetSsoV2Response = (page: Page) => {
  return page.waitForResponse((response) => {
    return (
      response.url().includes("api/2.0/settings/ssov2") &&
      response.request().method() === "GET" &&
      response.status() === 200
    );
  });
};

export const waitForUpdateSsoV2Response = (page: Page) => {
  return page.waitForResponse((response) => {
    return (
      response.url().includes("api/2.0/settings/ssov2") &&
      response.request().method() === "PUT"
    );
  });
};

export const waitForDeleteSsoV2Response = (page: Page) => {
  return page.waitForResponse((response) => {
    return (
      response.url().includes("api/2.0/settings/ssov2") &&
      response.request().method() === "DELETE"
    );
  });
};

export const waitForGetAuthServiceResponse = (page: Page) => {
  return page.waitForResponse((response) => {
    return (
      response.url().includes("api/2.0/settings/authservice") &&
      response.request().method() === "GET" &&
      response.status() === 200
    );
  });
};

export const waitForGetSmptResponse = (page: Page) => {
  return page.waitForResponse((response) => {
    return (
      response.url().includes("api/2.0/smtpsettings/smtp") &&
      response.request().method() === "GET" &&
      response.status() === 200
    );
  });
};

export const waitForSystemWebPluginsIconsResponse = async (page: Page) => {
  const svgPaths = [
    "systemwebplugins/root/markdown",
    "systemwebplugins/root/pdf-converter",
    "systemwebplugins/root/speech-to-text",
    "systemwebplugins/root/draw.io",
  ];

  return waitForAllResponses(page, svgPaths);
};
