import { test } from "@/src/fixtures";

test.describe("FormFilling room access levels discovery", () => {
  let roomId: number;
  let userId: string;

  test.beforeEach(async ({ apiSdk }) => {
    // Create FormFilling room
    const roomResponse = await apiSdk.rooms.createRoom("owner", {
      title: "AccessLevelsTestRoom",
      roomType: "FillingFormsRoom",
    });
    const roomBody = await roomResponse.json();
    roomId = roomBody.response.id;

    // Create a test user to assign access rights
    const { response: userResponse } = await apiSdk.profiles.addMember(
      "owner",
      "User",
    );
    const userBody = await userResponse.json();
    userId = userBody.response.id;
  });

  test("Test RoomAdmin access level", async ({ apiSdk }) => {
    const response = await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "RoomAdmin" }],
      notify: false,
    });

    console.log("RoomAdmin response status:", response.status());
    console.log("RoomAdmin response body:", await response.json());
  });

  test("Test Editing access level", async ({ apiSdk }) => {
    const response = await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "Editing" }],
      notify: false,
    });

    console.log("Editing response status:", response.status());
    console.log("Editing response body:", await response.json());
  });

  test("Test FormFilling access level", async ({ apiSdk }) => {
    const response = await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "FormFilling" }],
      notify: false,
    });

    console.log("FormFilling response status:", response.status());
    console.log("FormFilling response body:", await response.json());
  });

  test("Test FillingForms access level (alternative)", async ({ apiSdk }) => {
    const response = await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "FillingForms" }],
      notify: false,
    });

    console.log("FillingForms response status:", response.status());
    console.log("FillingForms response body:", await response.json());

    // This might fail, but we want to see the error
  });

  test("Test Viewing access level", async ({ apiSdk }) => {
    const response = await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "Viewing" }],
      notify: false,
    });

    console.log("Viewing response status:", response.status());
    console.log("Viewing response body:", await response.json());
  });

  test("Test Read access level (alternative)", async ({ apiSdk }) => {
    const response = await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "Read" }],
      notify: false,
    });

    console.log("Read response status:", response.status());
    console.log("Read response body:", await response.json());

    // This might fail, but we want to see the error
  });

  test("Get room access rights to see actual values", async ({ apiSdk }) => {
    // Set Editing access first
    await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
      invitations: [{ id: userId, access: "Editing" }],
      notify: false,
    });

    // Get access rights to see the actual response format
    const response = await apiSdk.rooms.getRoomAccessRights("owner", roomId);
    const body = await response.json();

    console.log("getRoomAccessRights response:", JSON.stringify(body, null, 2));

    // Find our user in the response
    const userAccess = body.response.find(
      (item: { sharedTo?: { id: string } }) => item.sharedTo?.id === userId,
    );

    if (userAccess) {
      console.log("User access object:", JSON.stringify(userAccess, null, 2));
      console.log("Access level value:", userAccess.access);
    }
  });

  test("Test all possible numeric access values", async ({ apiSdk }) => {
    // Sometimes APIs use numeric values instead of strings
    const numericValues = [0, 1, 2, 3, 4, 5, 6];

    for (const accessValue of numericValues) {
      const response = await apiSdk.rooms.setRoomAccessRights("owner", roomId, {
        invitations: [{ id: userId, access: String(accessValue) }],
        notify: false,
      });

      console.log(
        `Numeric value ${accessValue} response status:`,
        response.status(),
      );
      if (response.ok()) {
        console.log(`Numeric value ${accessValue} WORKS!`);
        const body = await response.json();
        console.log("Response body:", JSON.stringify(body, null, 2));
      }
    }
  });
});
