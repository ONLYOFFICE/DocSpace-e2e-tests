export const ROOM_CREATE_TITLES = {
  PUBLIC: "Public room",
  FORM_FILLING: "Form filling room",
  COLLABORATION: "Collaboration room",
  VIRTUAL_DATA: "Virtual data room",
  CUSTOM: "Custom room",
  FROM_TEMPLATE: "From template",
} as const;

export type TRoomCreateTitles =
  (typeof ROOM_CREATE_TITLES)[keyof typeof ROOM_CREATE_TITLES];
