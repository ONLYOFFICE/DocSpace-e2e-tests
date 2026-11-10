import { Page } from "@playwright/test";

const SOCKET_URL = /socket\.io/;
// Socket.io event packets ("42[...]") carry the real-time events. Engine.io
// ping/pong and connect packets still pass, so the connection stays alive.
const SOCKET_EVENT_PACKET_PREFIX = "42";

// Keeps the page connected to the socket but drops every server event, so
// the page goes stale like after missed events (sleep, network blip). Must be
// called before the page opens the socket, i.e. before login/navigation.
export async function muteSocketEvents(page: Page) {
  await page.routeWebSocket(SOCKET_URL, (ws) => {
    const server = ws.connectToServer();
    server.onMessage((message) => {
      if (
        typeof message === "string" &&
        message.startsWith(SOCKET_EVENT_PACKET_PREFIX)
      ) {
        return;
      }
      ws.send(message);
    });
    ws.onMessage((message) => server.send(message));
  });
}
