import { createMailChecker } from "@/src/utils/helpers/email/createMailChecker";

export async function getOwnerConfirmLink(
  portalName: string,
  timeoutSeconds = 120,
): Promise<string> {
  const mailChecker = createMailChecker();
  const confirmLink = await mailChecker.extractPortalLink({
    subject: "Welcome to ONLYOFFICE DocSpace!",
    portalName,
    timeoutSeconds,
  });

  if (!confirmLink) {
    throw new Error(`Owner confirmation email was not found for ${portalName}`);
  }

  return confirmLink;
}
