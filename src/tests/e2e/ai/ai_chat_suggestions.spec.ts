import { test } from "@/src/fixtures";
import { AiAgents } from "@/src/objects/ai/AiAgents";
import AiSettings from "@/src/objects/ai/AiSettings";
import Files from "@/src/objects/files/Files";
import { PaymentApi } from "@/src/api/payment";
import { aiChatSuggestions } from "@/src/utils/constants/ai";
import {
  apps,
  filesSubItems,
  formsSubItems,
  roomsSubItems,
  TApp,
} from "@/src/utils/constants/navigation";

type TSection = {
  title: string;
  subItem?: string;
  suggestions: readonly string[];
};

const FILES_SECTIONS: TSection[] = [
  { title: "Files", suggestions: aiChatSuggestions.files.root },
  {
    title: "Files > Shared with me",
    subItem: filesSubItems.sharedWithMe,
    suggestions: aiChatSuggestions.files.sharedWithMe,
  },
  {
    title: "Files > Recent files",
    subItem: filesSubItems.recent,
    suggestions: aiChatSuggestions.files.recent,
  },
  {
    title: "Files > Favorite files",
    subItem: filesSubItems.favorites,
    suggestions: aiChatSuggestions.files.favorites,
  },
  {
    title: "Files > Trash",
    subItem: filesSubItems.trash,
    suggestions: aiChatSuggestions.files.trash,
  },
];

const ROOMS_SECTIONS: TSection[] = [
  { title: "Rooms", suggestions: aiChatSuggestions.rooms.root },
  {
    title: "Rooms > Recent files",
    subItem: roomsSubItems.recent,
    suggestions: aiChatSuggestions.rooms.recent,
  },
  {
    title: "Rooms > Favorite files",
    subItem: roomsSubItems.favorites,
    suggestions: aiChatSuggestions.rooms.favorites,
  },
  {
    title: "Rooms > Templates",
    subItem: roomsSubItems.templates,
    suggestions: aiChatSuggestions.rooms.templates,
  },
  {
    title: "Rooms > Archive",
    subItem: roomsSubItems.archive,
    suggestions: aiChatSuggestions.rooms.archive,
  },
  {
    title: "Rooms > Trash",
    subItem: roomsSubItems.trash,
    suggestions: aiChatSuggestions.rooms.trash,
  },
];

const FORMS_SECTIONS: TSection[] = [
  { title: "Forms", suggestions: aiChatSuggestions.forms.root },
  {
    title: "Forms > Recent files",
    subItem: formsSubItems.recent,
    suggestions: aiChatSuggestions.forms.recent,
  },
  {
    title: "Forms > Favorite files",
    subItem: formsSubItems.favorites,
    suggestions: aiChatSuggestions.forms.favorites,
  },
  {
    title: "Forms > Templates",
    subItem: formsSubItems.templates,
    suggestions: aiChatSuggestions.forms.templates,
  },
  {
    title: "Forms > Trash",
    subItem: formsSubItems.trash,
    suggestions: aiChatSuggestions.forms.trash,
  },
];

test.describe("AI Chat: suggestions per section", () => {
  let aiAgents: AiAgents;
  let aiSettings: AiSettings;
  let files: Files;
  let paymentApi: PaymentApi;

  test.beforeEach(async ({ page, api, login }) => {
    paymentApi = new PaymentApi(api.apiRequestContext, api.apisystem);
    aiAgents = new AiAgents(page, api.portalDomain);
    aiSettings = new AiSettings(page, api.portalDomain);
    files = new Files(page, api.portalDomain);
    await login.loginToPortal();

    await test.step("Precondition: top up wallet and activate AI features", async () => {
      await paymentApi.setupPayment();
      await paymentApi.makeWalletTopUp();
      await aiSettings.open();
      await aiSettings.activate();
    });

    // Activation leaves the settings page, whose sidebar has no app sections.
    await files.open();
  });

  // Each section shows its own chips; picking one fills the composer and
  // picking another replaces the text.
  async function checkSections(app: TApp, sections: TSection[]) {
    for (const { title, subItem, suggestions } of sections) {
      await test.step(`${title}: shows its own suggestions`, async () => {
        await aiAgents.openSectionWithChat(app, subItem);
        await aiAgents.expectChatSuggestions(suggestions);
      });

      await test.step(`${title}: picking a suggestion fills the composer, another one replaces it`, async () => {
        await aiAgents.expectSuggestionsFillComposer(
          suggestions[0],
          suggestions[1],
        );
      });
    }
  }

  test("Every section shows its own suggestions that fill the composer, AI agents shows none", async () => {
    await checkSections(apps.files, FILES_SECTIONS);
    await checkSections(apps.rooms, ROOMS_SECTIONS);
    await checkSections(apps.forms, FORMS_SECTIONS);

    await test.step("AI agents: no suggestions are shown", async () => {
      await aiAgents.open();
      await aiAgents.expectNoChatSuggestions();
    });
  });
});
