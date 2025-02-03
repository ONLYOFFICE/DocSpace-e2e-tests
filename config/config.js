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
  logLevel: process.env.LOG_LEVEL || "info",
};

export default config;
