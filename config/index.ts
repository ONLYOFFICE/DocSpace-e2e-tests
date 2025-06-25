import dotenv from "dotenv";
import process from "node:process";

dotenv.config();

interface Config {
  PORTAL_REGISTRATION_URL: string;

  DOCSPACE_STANDALONE: boolean;
  DOCSPACE_LOCAL: boolean;

  DOCSPACE_AUTH_TOKEN?: string;

  DOCSPACE_ADMIN_EMAIL: string;
  DOCSPACE_ADMIN_PASSWORD: string;

  // AWS_REGION?: string;
  // DOCSPACE_USER_EMAIL?: string;
  // DOCSPACE_USER_PASSWORD?: string;
  // TEST_SITE_REGISTRATION_URL?: string;
  // FACEBOOK_ID?: string;
  // FACEBOOK_KEY?: string;
  // S3_ACCESS_KEY?: string;
  // S3_SECRET_KEY?: string;
  // LDAP_SERVER?: string;
  // LDAP_USER_DN?: string;
  // LDAP_USER_FILTER?: string;
  // LDAP_LOGIN?: string;
  // LDAP_PASSWORD?: string;
  // SMTP_HOST?: string;
  // SMTP_HOST_LOGIN?: string;
  // SMTP_HOST_PASSWORD?: string;
  // NEXTCLOUD_URL?: string;
  // NEXTCLOUD_LOGIN?: string;
  // NEXTCLOUD_PASSWORD?: string;
  // PDF_CONVERTER_KEY?: string;
  // SPEECH_TO_TEXT_KEY?: string;
  // QA_MAIL_DOMAIN?: string;
  // QA_MAIL_LOGIN?: string;
  // QA_MAIL_LOGIN_USER?: string;
  // QA_MAIL_PASSWORD?: string;
  // QA_MAIL_PASSWORD_USER?: string;
  // logLevel: string;
  // MOBILE_USER_AGENT?: string;
  // IS_MOBILE: boolean;
  // VIEW_PORT?: string;
  // DEVICE?: string;
  // MACHINEKEY?: string;
  // PKEY?: string;
  // BOX_LOGIN?: string;
  // BOX_PASS?: string;
  // BOX_ID?: string;
  // BOX_KEY?: string;
  // ONEDRIVE_LOGIN?: string;
  // ONEDRIVE_PASSWORD?: string;
  // DROPBOX_LOGIN?: string;
  // DROPBOX_PASS?: string;
}

const config: Config = {
  PORTAL_REGISTRATION_URL:
    process.env.PORTAL_REGISTRATION_URL ??
    `https://onlyoffice.io/apisystem/portal`,

  DOCSPACE_STANDALONE: process.env.DOCSPACE_STANDALONE === "true",
  DOCSPACE_LOCAL: process.env.DOCSPACE_LOCAL === "true",

  DOCSPACE_AUTH_TOKEN: process.env.DOCSPACE_AUTH_TOKEN,

  DOCSPACE_ADMIN_EMAIL:
    process.env.DOCSPACE_ADMIN_EMAIL ?? "integration-test-email@gmail.com",
  DOCSPACE_ADMIN_PASSWORD: process.env.DOCSPACE_ADMIN_PASSWORD ?? "test1234",

  // AWS_REGION: process.env.AWS_REGION,
  // DOCSPACE_USER_EMAIL: process.env.DOCSPACE_USER_EMAIL,
  // DOCSPACE_USER_PASSWORD: process.env.DOCSPACE_USER_PASSWORD,
  // TEST_SITE_REGISTRATION_URL: process.env.TEST_SITE_REGISTRATION_URL,
  // FACEBOOK_ID: process.env.FACEBOOK_ID,
  // FACEBOOK_KEY: process.env.FACEBOOK_KEY,
  // S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  // S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  // LDAP_SERVER: process.env.LDAP_SERVER,
  // LDAP_USER_DN: process.env.LDAP_USER_DN,
  // LDAP_USER_FILTER: process.env.LDAP_USER_FILTER,
  // LDAP_LOGIN: process.env.LDAP_LOGIN,
  // LDAP_PASSWORD: process.env.LDAP_PASSWORD,
  // SMTP_HOST: process.env.SMTP_HOST,
  // SMTP_HOST_LOGIN: process.env.SMTP_HOST_LOGIN,
  // SMTP_HOST_PASSWORD: process.env.SMTP_HOST_PASSWORD,
  // NEXTCLOUD_URL: process.env.NEXTCLOUD_URL,
  // NEXTCLOUD_LOGIN: process.env.NEXTCLOUD_LOGIN,
  // NEXTCLOUD_PASSWORD: process.env.NEXTCLOUD_PASSWORD,
  // PDF_CONVERTER_KEY: process.env.PDF_CONVERTER_KEY,
  // SPEECH_TO_TEXT_KEY: process.env.SPEECH_TO_TEXT_KEY,
  // QA_MAIL_DOMAIN: process.env.QA_MAIL_DOMAIN,
  // QA_MAIL_LOGIN: process.env.QA_MAIL_LOGIN,
  // QA_MAIL_LOGIN_USER: process.env.QA_MAIL_LOGIN_USER,
  // QA_MAIL_PASSWORD: process.env.QA_MAIL_PASSWORD,
  // QA_MAIL_PASSWORD_USER: process.env.QA_MAIL_PASSWORD_USER,
  // logLevel: process.env.LOG_LEVEL || "info",
  // MOBILE_USER_AGENT: process.env.MOBILE_USER_AGENT,
  // IS_MOBILE: process.env.IS_MOBILE === "true",
  // VIEW_PORT: process.env.VIEW_PORT,
  // DEVICE: process.env.DEVICE,
  // MACHINEKEY: process.env.MACHINEKEY,
  // PKEY: process.env.PKEY,
  // BOX_LOGIN: process.env.BOX_LOGIN,
  // BOX_PASS: process.env.BOX_PASS,
  // BOX_ID: process.env.BOX_ID,
  // BOX_KEY: process.env.BOX_KEY,
  // ONEDRIVE_LOGIN: process.env.ONEDRIVE_LOGIN,
  // ONEDRIVE_PASSWORD: process.env.ONEDRIVE_PASSWORD,
  // DROPBOX_LOGIN: process.env.DROPBOX_LOGIN,
  // DROPBOX_PASS: process.env.DROPBOX_PASS,
};

export default config;
