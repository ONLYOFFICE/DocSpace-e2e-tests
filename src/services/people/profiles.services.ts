import { test, APIRequestContext } from "@playwright/test";
import { FAKER } from "@/src/utils/helpers/faker";
import { TokenStore, Role } from "../token-store";

type UserType = "DocSpaceAdmin" | "RoomAdmin" | "User";

const USER_TYPE_TO_ROLE: Record<UserType, Role> = {
  DocSpaceAdmin: "docSpaceAdmin",
  RoomAdmin: "roomAdmin",
  User: "user",
};

export class ProfilesApi {
  private request: APIRequestContext;
  private faker: FAKER;
  private tokenStore: TokenStore;

  constructor(request: APIRequestContext, tokenStore: TokenStore) {
    this.request = request;
    this.faker = new FAKER();
    this.tokenStore = tokenStore;
  }

  private getToken(role: Role) {
    return this.tokenStore.getToken(role);
  }

  private get portalDomain() {
    return this.tokenStore.portalDomain;
  }

  async addMember(role: Role, type: UserType) {
    return test.step(`${role} create User`, async () => {
      const fakeUser = this.faker.generateUser();

      const userData = {
        ...fakeUser,
        type,
      };

      const credentialRole = USER_TYPE_TO_ROLE[type];
      this.tokenStore.setCredentials(
        credentialRole,
        userData.email,
        userData.password,
      );

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: userData,
        },
      );
      return { response, userData };
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
          headers: { Authorization: `Bearer ${this.getToken("owner")}` },
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
          headers: { Authorization: `Bearer ${this.getToken("owner")}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async addingAUserWithoutAuthorization() {
    return test.step("Adding a user without authorization", async () => {
      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
      );
      return response;
    });
  }

  async returnAllUsersList(role: Role) {
    return test.step(`${role} Return all users list`, async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );
      return response;
    });
  }

  async returnAllUsersListWithoutAuthorization() {
    return test.step("Return all users list without authorization", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people`,
      );
      return response;
    });
  }

  async inviteUser(role: Role, data: { type: string; email: string }) {
    return test.step(`${role} invite user`, async () => {
      const userData = {
        invitations: [
          {
            type: data.type,
            email: data.email,
          },
        ],
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async inviteUserForLongEmail(data: { type: string; email: string }) {
    return test.step("Invite User for long email", async () => {
      const userData = {
        invitations: [
          {
            type: data.type,
            email: data.email,
          },
        ],
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.getToken("owner")}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async invitingAUserWithoutAuthorization() {
    return test.step("Inviting a user without authorization", async () => {
      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/invite`,
      );
      return response;
    });
  }

  async resendActavationEmails(
    role: Role,
    data: {
      userIds: string[];
      resendAll: boolean;
    },
  ) {
    return test.step(`${role} resend activation emails`, async () => {
      const userData = {
        userIds: data.userIds,
        resendAll: data.resendAll,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/invite`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async resendingActivationEmailByUnauthorizedUser() {
    return test.step("Resending activation email by unauthorized user", async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/invite`,
      );
      return response;
    });
  }

  async deleteUser(role: Role, data: { userIds: string[] }) {
    return test.step(`${role} delete user`, async () => {
      const userData = {
        userIds: data.userIds,
      };

      const response = await this.request.delete(
        `https://${this.portalDomain}/api/2.0/people/${data.userIds}`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async deletingAUserWithoutAuthorization(data: { userIds: string[] }) {
    return test.step("Room admin delete user", async () => {
      const userData = {
        userIds: data.userIds,
      };

      const response = await this.request.delete(
        `https://${this.portalDomain}/api/2.0/people/${data.userIds}`,
        {
          data: userData,
        },
      );
      return response;
    });
  }

  async returnUserDetailedInformation(role: Role, userId: string) {
    return test.step(`${role} returns the detailed information of the user`, async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/${userId}`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );
      return response;
    });
  }

  async returnUserDetailedInformationAboutAUsetWithoutAuthorization(
    userId: string,
  ) {
    return test.step("Returns the detailed information of the user", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/${userId}`,
      );
      return response;
    });
  }

  async updatesData(
    role: Role,
    userId: string,
    data: {
      firstName: string;
      lastName: string;
    },
  ) {
    return test.step(`${role} update himself`, async () => {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/${userId}`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async updateUserDataWithoutAuthorization(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
    },
  ) {
    return test.step("Update a user without authorization", async () => {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/${userId}`,
        {
          data: userData,
        },
      );
      return response;
    });
  }

  async returnHimselfInformation(role: Role) {
    return test.step(`${role} return himself information`, async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/@self`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );
      return response;
    });
  }

  async returnsUserInfoViaEmail(role: Role, data: { email: string[] }) {
    return test.step(`${role} returns user information via email`, async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/email?email=${data.email}`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );
      return response;
    });
  }

  async returnsUserInfoViaEmailWithoutAuthorization(data: { email: string[] }) {
    return test.step("Returns user information via email without authorization", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/email?email=${data.email}`,
      );
      return response;
    });
  }

  async sendInstructionToChangeEmail(
    role: Role,
    data: {
      userId: string;
      email: string;
    },
  ) {
    return test.step(`${role} send instructions to change email`, async () => {
      const userData = {
        userId: data.userId,
        email: data.email,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/email`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: userData,
        },
      );
      return response;
    });
  }

  async sendInstructionToChangeEmailWithoutAuthorization(data: {
    userId: string;
    email: string;
  }) {
    return test.step("Room admin send instructions to change email", async () => {
      const userData = {
        userId: data.userId,
        email: data.email,
      };

      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people/email`,
        {
          data: userData,
        },
      );
      return response;
    });
  }

  async deleteUsers(
    role: Role,
    data: { userIds: string[]; resendAll: boolean },
  ) {
    return test.step(`${role} delete users`, async () => {
      const userData = {
        userIds: data.userIds,
        resendAll: data.resendAll,
      };

      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/delete`,
        {
          headers: {
            Authorization: `Bearer ${this.getToken(role)}`,
          },
          data: userData,
        },
      );
      return response;
    });
  }

  async updateCultureCode(
    role: Role,
    data: { cultureName: string; userId: string },
  ) {
    return test.step(`${role} update culture code`, async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/${data.userId}/culture`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
          data: {
            cultureName: data.cultureName,
          },
        },
      );
      return response;
    });
  }

  async updateCultureCodeWithoutAuthorization(data: {
    cultureName: string;
    userId: string;
  }) {
    return test.step("User update culture code", async () => {
      const response = await this.request.put(
        `https://${this.portalDomain}/api/2.0/people/${data.userId}/culture`,
        {
          data: {
            cultureName: data.cultureName,
          },
        },
      );
      return response;
    });
  }
}
