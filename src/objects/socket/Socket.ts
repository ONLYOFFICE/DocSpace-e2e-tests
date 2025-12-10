/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Page, WebSocket } from "@playwright/test";

type WSFrame = {
  opcode: number;
  payload: string | Buffer;
};

class Socket {
  private page: Page;
  private socketIoList: WebSocket[] = [];
  private connectionInitSeen = false;

  constructor(page: Page) {
    this.page = page;

    this.page.on("websocket", (ws) => {
      if (!ws.url().includes("/socket.io/")) return;

      this.socketIoList.push(ws);

      // typings of Playwright don't know about "framereceived",
      // but the event exists at runtime so cast to any.
      (ws as any).on("framereceived", (frame: WSFrame) => {
        const data = frame.payload;
        if (typeof data === "string" && data.includes('"connection-init"')) {
          this.connectionInitSeen = true;
        }
      });
    });
  }

  // Returns any active socket.io connection.
  getActiveSocketIo(): WebSocket | undefined {
    return this.socketIoList.find((ws) => !ws.isClosed());
  }

  // Waits until any socket.io WebSocket appears.
  async waitForSocketIo(timeout = 15000): Promise<WebSocket> {
    const existing = this.getActiveSocketIo();
    if (existing) return existing;

    const ws = await this.page.waitForEvent("websocket", {
      predicate: (socket) => socket.url().includes("/socket.io/"),
      timeout,
    });

    this.socketIoList.push(ws);
    return ws;
  }

  // Waits until a socket.io connection becomes active again
  async waitForAnyActiveSocket(timeout = 15000): Promise<WebSocket> {
    const start = Date.now();

    const existing = this.getActiveSocketIo();
    if (existing) return existing;

    return new Promise<WebSocket>((resolve, reject) => {
      const interval = setInterval(() => {
        const active = this.getActiveSocketIo();
        if (active) {
          clearInterval(interval);
          return resolve(active);
        }

        if (Date.now() - start > timeout) {
          clearInterval(interval);
          return reject(
            new Error("Timed out waiting for an active socket.io connection"),
          );
        }
      }, 200);
    });
  }

  // Waits until the "connection-init" event is received
  async waitForConnectionInit(timeout = 15000): Promise<void> {
    if (this.connectionInitSeen) return;

    const start = Date.now();

    while (Date.now() - start <= timeout) {
      if (this.connectionInitSeen) return;
      await this.page.waitForTimeout(150);
    }

    throw new Error('Timed out waiting for socket.io "connection-init" event');
  }
}

export default Socket;
