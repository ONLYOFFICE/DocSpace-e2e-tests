import { test, APIRequestContext } from "@playwright/test";
import { FAKER } from "@/src/utils/helpers/faker";

export class ProfilesApi {
  private request: APIRequestContext;
  private faker: FAKER;
  private authTokenOwner: string = "";
  private authTokenDocSpaceAdmin: string = "";
  private authTokenRoomAdmin: string = "";
  private authTokenUser: string = "";
  private portalDomain: string = "";
  private docSpaceAdminEmail: string = "";
  private docSpaceAdminPassword: string = "";
  private roomAdminEmail: string = "";
  private roomAdminPassword: string = "";
  private userEmail: string = "";
  private userPassword: string = "";

  constructor(
    request: APIRequestContext,
    authToken: string,
    authTokenDocSpaceAdmin: string,
    portalDomain: string,
  ) {
    this.request = request;
    this.faker = new FAKER(request);
    this.authTokenOwner = authToken;
    this.authTokenDocSpaceAdmin = authTokenDocSpaceAdmin;

    this.portalDomain = portalDomain;
  }

  public getUserEmail(): string {
    return this.userEmail;
  }

  public getUserPassword(): string {
    return this.userPassword;
  }

  public setAuthTokenUser(token: string) {
    this.authTokenUser = token;
  }

  async addMemberUser() {
    return test.step("Create User", async () => {
      const userData = {
        password: this.faker.user.password,
        email: this.faker.user.email,
        firstName: this.faker.user.firstName,
        lastName: this.faker.user.lastName,
        type: "User",
      };

      this.userEmail = userData.email;
      this.userPassword = userData.password;

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return {response, userData};
    });
  }

  public getRoomAdminEmail(): string {
    return this.roomAdminEmail;
  }

  public getRoomAdminPassword(): string {
    return this.roomAdminPassword;
  }

  public setAuthTokenRoomAdmin(token: string) {
    this.authTokenRoomAdmin = token;
  }

  async addMemberRoomAdmin() {
    return test.step("Create room admin", async () => {
      const userData = {
        password: this.faker.roomAdmin.password,
        email: this.faker.roomAdmin.email,
        firstName: this.faker.roomAdmin.firstName,
        lastName: this.faker.roomAdmin.lastName,
        type: "RoomAdmin",
      };

      this.roomAdminEmail = userData.email;
      this.roomAdminPassword = userData.password;

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return {response, userData};
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
    return test.step("Create docSpace admin", async () => {
      const userData = {
        password: this.faker.docspaceAdmin.password,
        email: this.faker.docspaceAdmin.email,
        firstName: this.faker.docspaceAdmin.firstName,
        lastName: this.faker.docspaceAdmin.lastName,
        type: "DocSpaceAdmin",
      };

      this.docSpaceAdminEmail = userData.email;
      this.docSpaceAdminPassword = userData.password;

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return {response, userData};
    });
  }

  async addUserForLongFirstAndLastName(data: {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  }) {
    return test.step("Create User for long first and last name", async () => {
      const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async addUserForLongEmail(data: {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  }) {
    return test.step("Create User for long email", async () => {
      const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async docSpaceAdminAddsUsers(data: {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  }) {
    return test.step("DocSpace admin adds DocSpace admin", async () => {
      const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenDocSpaceAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async roomAdminAddsDocSpaceUser(data: {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  }) {
    return test.step("Room admin adds DocSpace User", async () => {
      const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenRoomAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async userAddsUser(data: {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  }) {
    return test.step("User adds User", async () => {
      const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenUser}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async roomAdminAddsUser(data: {
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    type: string;
  }) {
    return test.step("Room admin add User", async () => {
      const userData = {
        password: data.password,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        type: data.type,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenRoomAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async ownerReturnAllUsersList() {
    return test.step("Return all users list", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
        },
      );
      return response;
    });
  }

  async docSpaceAdminReturnAllUsersList() {
    return test.step("Return all users list", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenDocSpaceAdmin}` },
        },
      );
      return response;
    });
  }

  async roomAdminReturnAllUsersList() {
    return test.step("Return all users list", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenRoomAdmin}` },
        },
      );
      return response;
    });
  }

  async userReturnAllUsersList() {
    return test.step("Return all users list", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.authTokenUser}` },
        },
      );
      return response;
    });
  }

  async ownerInviteUser(data: {
    type: string;
    email: string;
  }) {
    return test.step("Owner invite user", async () => {
      const userData = {
      invitations:[
        {
        type: data.type,
        email: data.email,
      }
      ]};

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async docSpaceAdminInviteUser(data: {
    type: string;
    email: string;
  }) {
    return test.step("DocSpace admin invite user", async () => {
      const userData = {
      invitations:[
        {
        type: data.type,
        email: data.email,
      }
      ]};

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenDocSpaceAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async roomAdminInviteUser(data: {
    type: string;
    email: string;
  }) {
    return test.step("Room admin invite user", async () => {
      const userData = {
      invitations:[
        {
        type: data.type,
        email: data.email,
      }
      ]};

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenRoomAdmin}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async userInviteUser(data: {
    type: string;
    email: string;
  }) {
    return test.step("User invite user", async () => {
      const userData = {
      invitations:[
        {
        type: data.type,
        email: data.email,
      }
      ]};

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenUser}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async inviteUserForLongEmail(data: {
    type: string;
    email: string;
  }) {
    return test.step("Invite User for long email", async () => {
      const userData = {
      invitations:[
        {
        type: data.type,
        email: data.email,
      }
      ]};

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async resendActavationEmails(data: {
    userIds: string[];
    resendAll: boolean;
  }) {
    return test.step("Resend activation emails", async () => {
      const userData = {
        userIds: data.userIds,
        resendAll: data.resendAll,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
          data: userData,
        },
      );
      return response;
    });
  }


}
