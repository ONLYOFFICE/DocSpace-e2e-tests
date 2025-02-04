import log from "../../utils/logger.js";

export class PeopleApiUserStatus {
  constructor(request, portalDomain) {
    this.request = request;
    this.portalDomain = portalDomain;
    this.baseUrl = `https://${portalDomain}/api/2.0/people`;
    this.headers = { "Content-Type": "application/json" };
  }

  async getMyProfile() {
    const url = `${this.baseUrl}/@self`;
    const response = await this.request.get(url, { headers: this.headers });
    if (response.status() !== 200) {
      throw new Error(`Failed to get profile: ${response.status()}`);
    }
    return await response.json();
  }

  async changeUserActivationStatus(userId, activationStatus) {
    const url = `${this.baseUrl}/activationstatus/${activationStatus}`;
    const payload = {
      userIds: [userId],
    };

    log.debug("PUT Request to change activation status:");
    log.debug("URL:", url);

    const response = await this.request.put(url, {
      headers: this.headers,
      data: payload,
    });

    log.debug("Response Status:", response.status());
    const responseBody = await response.text();
    log.debug("Response Body:", responseBody);

    if (response.status() !== 200) {
      throw new Error(
        `Activation failed: ${response.status()} - ${responseBody}`,
      );
    }

    return JSON.parse(responseBody);
  }
}
