import dotenv from "dotenv";
import process from "node:process";

dotenv.config();

if (!process.env.TEST_DOMAIN) {
  throw new Error("TEST_DOMAIN environment variable is not set.");
}

const config = {
  PORTAL_REGISTRATION_URL:
    process.env.PORTAL_REGISTRATION_URL ||
    `https://${process.env.TEST_DOMAIN}/apisystem/portal`,
  AWS_REGION: process.env.AWS_REGION,
  DOCSPACE_ADMIN_EMAIL: process.env.DOCSPACE_ADMIN_EMAIL,
  DOCSPACE_ADMIN_PASSWORD: process.env.DOCSPACE_ADMIN_PASSWORD,
  DOCSPACE_USER_EMAIL: process.env.DOCSPACE_USER_EMAIL,
  DOCSPACE_USER_PASSWORD: process.env.DOCSPACE_USER_PASSWORD,
  TEST_SITE_REGISTRATION_URL: process.env.TEST_SITE_REGISTRATION_URL,
  FACEBOOK_ID: process.env.FACEBOOK_ID,
  FACEBOOK_KEY: process.env.FACEBOOK_KEY,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  LDAP_SERVER: process.env.LDAP_SERVER,
  LDAP_USER_DN: process.env.LDAP_USER_DN,
  LDAP_USER_FILTER: process.env.LDAP_USER_FILTER,
  LDAP_LOGIN: process.env.LDAP_LOGIN,
  LDAP_PASSWORD: process.env.LDAP_PASSWORD,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_HOST_LOGIN: process.env.SMTP_HOST_LOGIN,
  SMTP_HOST_PASSWORD: process.env.SMTP_HOST_PASSWORD,
  NEXTCLOUD_URL: process.env.NEXTCLOUD_URL,
  NEXTCLOUD_LOGIN: process.env.NEXTCLOUD_LOGIN,
  NEXTCLOUD_PASSWORD: process.env.NEXTCLOUD_PASSWORD,
  QA_MAIL_DOMAIN: process.env.QA_MAIL_DOMAIN,
  QA_MAIL_LOGIN: process.env.QA_MAIL_LOGIN,
  QA_MAIL_PASSWORD: process.env.QA_MAIL_PASSWORD,
  logLevel: process.env.LOG_LEVEL || "info",
  MOBILE_USER_AGENT: process.env.MOBILE_USER_AGENT,
  IS_MOBILE: process.env.IS_MOBILE === "true",
  VIEW_PORT: process.env.VIEW_PORT,
};

export default config;
