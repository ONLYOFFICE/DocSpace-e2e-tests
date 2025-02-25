import crypto from "node:crypto";
import config from "../../config/config";

export class PaymentApi {
  constructor(apiContext, portalSetupApi) {
    this.apiContext = apiContext;
    this.portalSetupApi = portalSetupApi;
    this.machineKey = config.MACHINEKEY;
    this.pKey = config.PKEY;
  }

  createToken() {
    const now = new Date();
    const timestamp = now.getUTCFullYear() +
      String(now.getUTCMonth() + 1).padStart(2, '0') +
      String(now.getUTCDate()).padStart(2, '0') +
      String(now.getUTCHours()).padStart(2, '0') +
      String(now.getUTCMinutes()).padStart(2, '0') +
      String(now.getUTCSeconds()).padStart(2, '0');

    let authkey = crypto.createHmac("sha1", this.machineKey)
      .update(`${timestamp}\n${this.pKey}`)
      .digest("base64");

    authkey = authkey.replaceAll("+", "-").replaceAll("/", "_");
    authkey = authkey.slice(0, Math.max(0, authkey.length - 1));
    const hash = `ASC ${this.pKey}:${timestamp}:${authkey}`;

    return hash;
  }

  async getPortalInfo(portalDomain) {
    if (!portalDomain) {
      throw new Error("Portal domain is required to get portal info");
    }
    
    const response = await this.apiContext.get(`https://${portalDomain}/api/2.0/portal`);
    if (!response.ok()) {
      const error = await response.json();
      throw new Error(`Failed to get portal info: ${error.message || "Unknown error"}`);
    }
    const portalInfo = await response.json();
    
    const tenantId = portalInfo.response?.tenantId;
    if (!tenantId) {
      throw new Error("TenantId not found in portal info response");
    }
    
    return portalInfo.response;
  }

  async makePortalPayment(tenantId, quantity = 10) {
    const token = this.createToken();
    const portalId = `docspace.io${tenantId}`;
    
    const headers = {
      'Authorization': token,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    const data = {
      portalId: portalId,
      customerEmail: config.DOCSPACE_ADMIN_EMAIL,
      quantity: quantity,
    };
    
    const response = await this.apiContext.post(
      "https://payments.teamlab.info/api/license/setdspsaaspaid",
      {
        headers: headers,
        data: data,
      }
    );

    if (!response.ok()) {
      const error = await response.json();
      throw new Error(`Payment failed: ${error.message || "Unknown error"}`);
    }

    return response.json();
  }

  async refreshPaymentInfo(portalDomain) {
    if (!this.portalSetupApi?.token) {
      throw new Error("Portal authentication token is not set. Please authenticate first.");
    }
    
    const headers = {
      'Authorization': `Bearer ${this.portalSetupApi.token}`,
      'Accept': 'application/json'
    };
    
    const tariffResponse = await this.apiContext.get(
      `https://${portalDomain}/api/2.0/portal/tariff`,
      {
        headers: headers,
        params: { refresh: true }
      }
    );
    
    if (!tariffResponse.ok()) {
      const error = await tariffResponse.json();
      throw new Error(`Failed to refresh tariff info: ${error.message || "Unknown error"}`);
    }

    const quotaResponse = await this.apiContext.get(
      `https://${portalDomain}/api/2.0/portal/payment/quota`,
      {
        headers: headers,
        params: { refresh: true }
      }
    );
    
    if (!quotaResponse.ok()) {
      const error = await quotaResponse.json();
      throw new Error(`Failed to refresh quota info: ${error.message || "Unknown error"}`);
    }

    return {
      tariff: await tariffResponse.json(),
      quota: await quotaResponse.json()
    };
  }

  async setupPayment(portalDomain, quantity = 10) {
    try {
      const portalInfo = await this.getPortalInfo(portalDomain);
      const paymentResult = await this.makePortalPayment(portalInfo.tenantId, quantity);
      
      const refreshResult = await this.refreshPaymentInfo(portalDomain);
      
      return {
        payment: paymentResult,
        refresh: refreshResult
      };
    } catch (error) {
      throw error;
    }
  }
}