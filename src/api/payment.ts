import crypto from "node:crypto";
import config from "../../config";
import { APIRequestContext } from "@playwright/test";
import Apisystem from "./apisystem";

export class PaymentApi {
  private apiContext: APIRequestContext;
  private portalSetupApi: Apisystem;
  private machineKey: string;
  private pKey: string;

  constructor(apiContext: APIRequestContext, portalSetupApi: Apisystem) {
    this.apiContext = apiContext;
    this.portalSetupApi = portalSetupApi;
    this.machineKey = config.MACHINEKEY ?? "";
    this.pKey = config.PKEY ?? "";
  }

  createToken() {
    const now = new Date();
    const timestamp =
      now.getUTCFullYear() +
      String(now.getUTCMonth() + 1).padStart(2, "0") +
      String(now.getUTCDate()).padStart(2, "0") +
      String(now.getUTCHours()).padStart(2, "0") +
      String(now.getUTCMinutes()).padStart(2, "0") +
      String(now.getUTCSeconds()).padStart(2, "0");

    let authkey = crypto
      .createHmac("sha1", this.machineKey)
      .update(`${timestamp}\n${this.pKey}`)
      .digest("base64");

    authkey = authkey.replaceAll("+", "-").replaceAll("/", "_");
    authkey = authkey.slice(0, Math.max(0, authkey.length - 1));
    const hash = `ASC ${this.pKey}:${timestamp}:${authkey}`;

    return hash;
  }

  async getPortalInfo(portalDomain: string) {
    if (!portalDomain) {
      throw new Error("Portal domain is required to get portal info");
    }

    const response = await this.apiContext.get(
      `https://${portalDomain}/api/2.0/portal`,
    );
    if (!response.ok()) {
      const error = await response.json();
      throw new Error(
        `Failed to get portal info: ${error.message || "Unknown error"}`,
      );
    }
    const portalInfo = await response.json();

    const tenantId = portalInfo.response?.tenantId;
    if (!tenantId) {
      throw new Error("TenantId not found in portal info response");
    }

    return portalInfo.response;
  }

  async makePortalPayment(tenantId: string, quantity = 10) {
    try {
      const token = this.createToken();
      const region = process.env.AWS_REGION;
      const portalId =
        region === "us-east-2"
          ? `docspace.io.ohio${tenantId}`
          : `docspace.io${tenantId}`;

      const headers = {
        Authorization: token,
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const data = {
        portalId: portalId,
        customerEmail: config.DOCSPACE_OWNER_EMAIL,
        quantity: quantity,
      };

      const response = await this.apiContext.post(
        "https://payments.teamlab.info/api/license/setdspsaaspaid",
        {
          headers: headers,
          data: data,
        },
      );

      if (!response.ok()) {
        const error = await response.json();
        throw new Error(`Payment failed: ${error.message || "Unknown error"}`);
      }

      return response.json();
    } catch (error) {
      console.log(error);
    }
  }

  async refreshPaymentInfo(portalDomain: string) {
    const ownerToken = this.portalSetupApi.getOwnerAuthToken();
    if (!ownerToken) {
      throw new Error(
        "Portal authentication token is not set. Please authenticate first.",
      );
    }

    const headers = {
      Authorization: `Bearer ${ownerToken}`,
      Accept: "application/json",
    };

    const tariffResponse = await this.apiContext.get(
      `https://${portalDomain}/api/2.0/portal/tariff?refresh=true`,
      {
        headers: headers,
        params: { refresh: true },
      },
    );

    if (!tariffResponse.ok()) {
      const error = await tariffResponse.json();
      throw new Error(
        `Failed to refresh tariff info: ${error.message || "Unknown error"}`,
      );
    }

    const quotaResponse = await this.apiContext.get(
      `https://${portalDomain}/api/2.0/portal/payment/quota?refresh=true`,
      {
        headers: headers,
        params: { refresh: true },
      },
    );

    if (!quotaResponse.ok()) {
      const error = await quotaResponse.json();
      throw new Error(
        `Failed to refresh quota info: ${error.message || "Unknown error"}`,
      );
    }

    return {
      tariff: await tariffResponse.json(),
      quota: await quotaResponse.json(),
    };
  }

  async setupPayment(portalDomain: string, quantity = 10) {
    const portalInfo = await this.getPortalInfo(portalDomain);
    const paymentResult = await this.makePortalPayment(
      portalInfo.tenantId,
      quantity,
    );

    const refreshResult = await this.refreshPaymentInfo(portalDomain);

    return {
      payment: paymentResult,
      refresh: refreshResult,
    };
  }
}
