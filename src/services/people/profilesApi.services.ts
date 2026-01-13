import { test, APIRequestContext } from '@playwright/test';
import { FAKER } from '@/src/utils/helpers/faker';

export class ProfilesApi {
    private request: APIRequestContext;
    private faker: FAKER;
    private authTokenOwner: string = '';
    private authTokenDocSpaceAdmin: string = '';
    private portalDomain: string = '';
    private docSpaceAdminEmail: string = '';
    private docSpaceAdminPassword: string = '';

    constructor(request: APIRequestContext, authToken: string, authTokenDocSpaceAdmin: string, portalDomain: string) {
    this.request = request;
    this.faker = new FAKER(request);
    this.authTokenOwner = authToken;
    this.authTokenDocSpaceAdmin = authTokenDocSpaceAdmin;
    this.portalDomain = portalDomain;
  }

  async addMemberUser() {
    return test.step('Create User', async () => {
    const userData = {
        password: this.faker.user.password,
        email: this.faker.user.email,
        firstName: this.faker.user.firstName,
        lastName: this.faker.user.lastName,
        type: "User"
      };

    const response = await this.request.post(`https://${this.portalDomain}/api/2.0/people`, {
        headers: { Authorization: `Bearer ${this.authTokenOwner}` },
        data: userData
    });
    return response;
    });
  }

  async addMemberRoomAdmin() {
    return test.step('Create room admin', async () => {
    const userData = {
        password: this.faker.roomAdmin.password,
        email: this.faker.roomAdmin.email,
        firstName: this.faker.roomAdmin.firstName,
        lastName: this.faker.roomAdmin.lastName,
        type: "RoomAdmin"
      };

    const response = await this.request.post(`https://${this.portalDomain}/api/2.0/people`, {
        headers: { Authorization: `Bearer ${this.authTokenOwner}` },
        data: userData
    });
    return response;
    });
  }

  public getDocSpaceAdminEmail(): string {
    return this.docSpaceAdminEmail;
  }

  public getDocSpaceAdminPassword(): string {
    return this.docSpaceAdminPassword;
  }

  public setAuthTokenDocSpaceAdmin(token: string) {
    this.authTokenDocSpaceAdmin = token;
  }

  async addMemberDocSpaceAdmin() {
    return test.step('Create docSpace admin', async () => {
    const userData = {
        password: this.faker.docspaceAdmin.password,
        email: this.faker.docspaceAdmin.email,
        firstName: this.faker.docspaceAdmin.firstName,
        lastName: this.faker.docspaceAdmin.lastName,
        type: "DocSpaceAdmin"
      };

      this.docSpaceAdminEmail = userData.email;
      this.docSpaceAdminPassword = userData.password;

    const response = await this.request.post(`https://${this.portalDomain}/api/2.0/people`, {
        headers: { Authorization: `Bearer ${this.authTokenOwner}` },
        data: userData
    });
    return response;
    });
  }

  async addUserForLongFirstAndLastName(data: { password: string; email: string; firstName: string; lastName: string; type: string }) {
    return test.step('Create User for long first and last name', async () => {
    const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type
      };

    const response = await this.request.post(`https://${this.portalDomain}/api/2.0/people`, {
        headers: { Authorization: `Bearer ${this.authTokenOwner}` },
        data: userData
    });
    return response;
    });
  }

  async addUserForLongEmail(data: { password: string; email: string; firstName: string; lastName: string; type: string }) {
    return test.step('Create User for long email', async () => {
    const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type
      };

    const response = await this.request.post(`https://${this.portalDomain}/api/2.0/people`, {
        headers: { Authorization: `Bearer ${this.authTokenOwner}` },
        data: userData
    });
    return response;
    });
  }

  async docSpaceAdminAddsDocSpaceAdmin(data: { password: string; email: string; firstName: string; lastName: string; type: string }) {
    return test.step('DocSpace admin adds DocSpace admin', async () => {
     const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type
      };

   const response = await this.request.post(`https://${this.portalDomain}/api/2.0/people`, {
        headers: { Authorization: `Bearer ${this.authTokenDocSpaceAdmin}` },
        data: userData
    });
    return response;
    });
  }


}