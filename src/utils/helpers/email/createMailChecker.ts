import config from "@/config";
import MailChecker from "@/src/utils/helpers/MailChecker";

export function createMailChecker(recipient?: string) {
  return new MailChecker({
    url: config.QA_MAIL_DOMAIN ?? "",
    user: config.QA_MAIL_LOGIN ?? "",
    pass: config.QA_MAIL_PASSWORD ?? "",
    recipient: recipient ?? config.DOCSPACE_OWNER_EMAIL,
    maxEmailsToScan: 20,
  });
}
