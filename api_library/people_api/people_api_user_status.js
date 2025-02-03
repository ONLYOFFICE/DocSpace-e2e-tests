export class PeopleApi {
    constructor(request) {
      this.request = request;
      this.baseUrl = "https://onlyoffice.io/apisystem/portal/people";
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
  
    async changeUserActivationStatus(portalDomain, userId, activationStatus) {
      const url = `https://${portalDomain}/api/2.0/people/activationstatus/${activationStatus}`;
      const payload = {
        userIds: [userId],
      };
    
      console.log("PUT Request to change activation status:");
      console.log("URL:", url);
      console.log("Headers:", this.headers);
      console.log("Payload:", payload);
    
      const response = await this.request.put(url, {
        headers: this.headers,
        data: payload,
      });
    
      console.log("Response Status:", response.status());
      const responseBody = await response.text();
      console.log("Response Body:", responseBody);
    
      if (response.status() !== 200) {
        throw new Error(`Activation failed: ${response.status()} - ${responseBody}`);
      }
    
      return JSON.parse(responseBody);
    }
    
    
  }
  