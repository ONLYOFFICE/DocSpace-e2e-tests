import { test, APIRequestContext  } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export class AUTH {
    private request: APIRequestContext;
    constructor(request: APIRequestContext) {
    this.request = request;
  }

  async ownerAuth() {
    return test.step('Owner Auth', async () => {
     const response = await this.request.post('/api/2.0/authentication', {
        data: {
        userName: 'desptest90@gmail.com',
        password: '12345678',
        }
    });
    const headers = response.headers();
    const cookie = headers['set-cookie'];
    const cookieValue = cookie.split(';')[0];
    this.saveToken('owner', cookieValue);
    return response;
    });
  }

  async userAuth() {
    return test.step('User Auth', async () => {
     const response = await this.request.post('/api/2.0/authentication', {
        data: {
        userName: 'Sydney_Roberts41@hotmail.com',
        password: 'vfmf2vO1Kp1',
        }
    });
    const headers = response.headers();
    const cookie = headers['set-cookie'];
    const cookieValue = cookie.split(';')[0];
    this.saveToken('user', cookieValue);
    return response;
    });
  }

  //toDo add other auth user type

  private saveToken(role: string, token: string) {
    const tokensPath = path.resolve('tokens.json');
    let tokenData: Record<string, string> = {};
    
    try {
      const existingData = fs.readFileSync(tokensPath, 'utf8');
      tokenData = JSON.parse(existingData);
    } catch {
      console.log('Creating new tokens file');
    }

    tokenData[role] = token;
    
    fs.writeFileSync(tokensPath, JSON.stringify(tokenData, null, 2));
    console.log(`${role} token saved to tokens.json`);
  }

 
}