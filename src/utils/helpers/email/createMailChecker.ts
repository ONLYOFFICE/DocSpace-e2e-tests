import config from "@/config";
import MailChecker from "@/src/utils/helpers/MailChecker";

export function createMailChecker() {
  return new MailChecker({
    url: config.QA_MAIL_DOMAIN ?? "",
    user: config.QA_MAIL_LOGIN ?? "",
    pass: config.QA_MAIL_PASSWORD ?? "",
    recipient: config.DOCSPACE_OWNER_EMAIL,
  });
}
