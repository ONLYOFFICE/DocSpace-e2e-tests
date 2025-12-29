import { test, APIRequestContext } from '@playwright/test';
import { FAKER } from '@/src/utils/helpers/faker';
import fs from 'fs';
import path from 'path';


export class ProfilesApi {
    private request: APIRequestContext;
    private faker: FAKER;
    constructor(request: APIRequestContext) {
    this.request = request;
    this.faker = new FAKER(request);
  }

  async addMemberUser() {
    return test.step('Create User', async () => {
    const tokenData = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));
    const ownerToken = tokenData.owner;
    let cookieValue = ownerToken;
    if (typeof ownerToken === 'string' && ownerToken.includes(';')) {
            cookieValue = ownerToken.split(';')[0];
        }

    const userData = {
        password: this.faker.user.password,
        email: this.faker.user.email,
        firstName: this.faker.user.firstName,
        lastName: this.faker.user.lastName,
        type: "User"
      };

    const response = await this.request.post('/api/2.0/people', {
        headers: { 'Cookie': ownerToken },
        data: userData
    });
    this.saveUserData('user', userData);
    return response;
    });
  }

   async addMemberRoomAdmin() {
    return test.step('Create room admin', async () => {
    const tokenData = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));
    const ownerToken = tokenData.owner;
    let cookieValue = ownerToken;
    if (typeof ownerToken === 'string' && ownerToken.includes(';')) {
            cookieValue = ownerToken.split(';')[0];
        }

    const userData = {
        password: this.faker.roomAdmin.password,
        email: this.faker.roomAdmin.email,
        firstName: this.faker.roomAdmin.firstName,
        lastName: this.faker.roomAdmin.lastName,
        type: "RoomAdmin"
      };

    const response = await this.request.post('/api/2.0/people', {
        headers: { 'Cookie': ownerToken },
        data: userData
    });
    this.saveUserData('roomAdmin', userData);
    return response;
    });
  }

  async addMemberDocSpaceAdmin() {
    return test.step('Create docSpace admin', async () => {
    const tokenData = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));
    const ownerToken = tokenData.owner;
    let cookieValue = ownerToken;
    if (typeof ownerToken === 'string' && ownerToken.includes(';')) {
            cookieValue = ownerToken.split(';')[0];
        }

    const userData = {
        password: this.faker.docspaceAdmin.password,
        email: this.faker.docspaceAdmin.email,
        firstName: this.faker.docspaceAdmin.firstName,
        lastName: this.faker.docspaceAdmin.lastName,
        type: "DocSpaceAdmin"
      };

    const response = await this.request.post('/api/2.0/people', {
        headers: { 'Cookie': ownerToken },
        data: userData
    });
    this.saveUserData('docSpaceAdmin', userData);
    return response;
    });
  }

  private saveUserData(userType: string, userData: any) {
    const usersPath = path.resolve('users.json');
    let usersData: Record<string, any> = {};
    
    try {
      const existingData = fs.readFileSync(usersPath, 'utf8');
      usersData = JSON.parse(existingData);
    } catch {}
    
    usersData[userType] = userData;
    
    fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
    console.log(`${userType} data saved to users.json`);
  }
}