// Copyright 2025 Abobadance
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { APIRequestContext } from "@playwright/test";

class File {
  apiContext: APIRequestContext;

  portalDomain: string = "";

  authToken: string = "";

  constructor(apiContext: APIRequestContext) {
    this.apiContext = apiContext;
  }

  setAuthToken(authToken: string) {
    this.authToken = authToken;
  }

  setPortalDomain(portalDomain: string) {
    this.portalDomain = portalDomain;
  }

  //   async activateAdminUser() {
  //     const response = await this.apiContext.put(
  //       `https://${this.portalDomain}/api/2.0/people/activationstatus/Activated`,
  //       {
  //         headers: { Authorization: `Bearer ${this.authToken}` },
  //         data: { userIds: [this.adminUserId] },
  //       },
  //     );

  //     const body = await response.json();
  //     if (!response.ok()) {
  //       throw new Error(
  //         `Failed to activate admin user: ${response.status()} - ${body.error || body.message}`,
  //       );
  //     }

  //     return body;
  //   }
}

export default File;
