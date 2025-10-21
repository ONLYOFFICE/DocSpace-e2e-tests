import { test, APIRequestContext  } from '@playwright/test';
import fs from 'fs';

export class ProfilesApi {
    private request: APIRequestContext;
    constructor(request: APIRequestContext) {
    this.request = request;
  }

  async addMemberUser() {
    return test.step('Create User', async () => {
    const tokenData = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));
    const ownerToken = tokenData.owner;
    let cookieValue = ownerToken;
    if (typeof ownerToken === 'string' && ownerToken.includes(';')) {
            cookieValue = ownerToken.split(';')[0];
        }
    const response = await this.request.post('/api/2.0/people', {
        headers: { 'Cookie': ownerToken },
        data: {
        password: "vfmf2vO1Kp1",
        email: "Sydney_Roberts41@hotmail.com",
        firstName: "WinfieldQ",
        lastName: "WymanQ",
        type: "User"
        }
    });
    return response;
    });
  }
}