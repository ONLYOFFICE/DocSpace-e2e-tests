import { test, APIRequestContext } from "@playwright/test";
import { FAKER } from "@/src/utils/helpers/faker";

type UserType = "DocSpaceAdmin" | "RoomAdmin" | "User";

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
    this.faker = new FAKER();
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

  public getRoomAdminEmail(): string {
    return this.roomAdminEmail;
  }

  public getRoomAdminPassword(): string {
    return this.roomAdminPassword;
  }

  public setAuthTokenRoomAdmin(token: string) {
    this.authTokenRoomAdmin = token;
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

  private getToken(role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user") {
    const tokens = {
      owner: this.authTokenOwner,
      docSpaceAdmin: this.authTokenDocSpaceAdmin,
      roomAdmin: this.authTokenRoomAdmin,
      user: this.authTokenUser,
    };
    return tokens[role];
  }

  async addMember(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    type: UserType,
  ) {
    return test.step("Create User", async () => {
      const fakeUser = this.faker.generateUser();

      const userData = {
        ...fakeUser,
        type,
      };

      if (type === "DocSpaceAdmin") {
        this.docSpaceAdminEmail = userData.email;
        this.docSpaceAdminPassword = userData.password;
      } else if (type === "RoomAdmin") {
        this.roomAdminEmail = userData.email;
        this.roomAdminPassword = userData.password;
      } else {
        this.userEmail = userData.email;
        this.userPassword = userData.password;
      }

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

  async addingAUserWithoutAuthorization() {
    return test.step("Adding a user without authorization", async () => {
      const response = await this.request.post(
        `https://${this.portalDomain}/api/2.0/people`,
      );
      return response;
    });
  }

  async returnAllUsersList(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
  ) {
    return test.step("Return all users list", async () => {
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

  async inviteUser(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    data: { type: string; email: string },
  ) {
    return test.step("Owner invite user", async () => {
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
          headers: { Authorization: `Bearer ${this.authTokenOwner}` },
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
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    data: {
      userIds: string[];
      resendAll: boolean;
    },
  ) {
    return test.step("Owner resend activation emails", async () => {
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

  async deleteUser(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    data: { userIds: string[] },
  ) {
    return test.step("Owner delete user", async () => {
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

  async returnUserDetailedInformation(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    userId: string,
  ) {
    return test.step("Owner returns the detailed information of the user", async () => {
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
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    userId: string,
    data: {
      firstName: string;
      lastName: string;
    },
  ) {
    return test.step("Owner update himself", async () => {
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

  async returnHimselfInformation(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
  ) {
    return test.step("Owner return himself information", async () => {
      const response = await this.request.get(
        `https://${this.portalDomain}/api/2.0/people/@self`,
        {
          headers: { Authorization: `Bearer ${this.getToken(role)}` },
        },
      );
      return response;
    });
  }

  async returnsUserInfoViaEmail(
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    data: { email: string[] },
  ) {
    return test.step("Owner returns user information via email", async () => {
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
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    data: {
      userId: string;
      email: string;
    },
  ) {
    return test.step("Owner send instructions to change email", async () => {
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
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    data: { userIds: string[]; resendAll: boolean },
  ) {
    return test.step("Owner delete users", async () => {
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
    role: "owner" | "docSpaceAdmin" | "roomAdmin" | "user",
    data: { cultureName: string; userId: string },
  ) {
    return test.step("Owner update culture code", async () => {
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
