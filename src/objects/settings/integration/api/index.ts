import { Page } from "@playwright/test";

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

  // Create a promise for each SVG path
  const promises = svgPaths.map((path) =>
    page
      .waitForResponse(
        (response) =>
          response.url().includes(path) && response.status() === 200,
        { timeout: 10000 }, // 10 second timeout
      )
      .catch((err) => {
        console.warn(`Failed to load SVG: ${path}`, err); // Use path instead of logo
        // Return resolved promise to continue even if one SVG fails
        return Promise.resolve();
      }),
  );

  return Promise.all(promises);
};
