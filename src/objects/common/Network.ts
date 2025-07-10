import { Page, Request } from "@playwright/test";

type NetworkOptions = {
  debug?: boolean;
};

export default class Network {
  private page: Page;
  activeRequests: Set<string> = new Set();
  options: NetworkOptions = {};
  requestSequence: number = 0;

  // Static storage for Network instances by page
  private static instances = new Map<Page, Network>();

  // Private constructor to prevent direct instantiation
  private constructor(page: Page, options?: NetworkOptions) {
    this.page = page;
    this.options = options || {};
  }

  // Static method to get or create an instance
  static getInstance(page: Page, options?: NetworkOptions): Network {
    if (!this.instances.has(page)) {
      const instance = new Network(page, options);
      this.instances.set(page, instance);
      // Automatically subscribe to events
      instance.subscribe();
    } else if (options) {
      // Update options if provided
      const instance = this.instances.get(page)!;
      instance.options = { ...instance.options, ...options };
    }

    return this.instances.get(page)!;
  }

  // Method to clean up an instance
  static clearInstance(page: Page): void {
    const instance = this.instances.get(page);
    if (instance) {
      instance.unsubscribe();
      this.instances.delete(page);
    }
  }

  log = (...args: unknown[]) => {
    if (this.options?.debug) console.log("[Network]", ...args);
  };

  subscribe() {
    this.page.on("request", this.handleRequest);
    this.page.on("requestfinished", this.handleRequestFinished);
    this.page.on("requestfailed", this.handleRequestFailed);
  }

  unsubscribe() {
    this.page.removeListener("request", this.handleRequest);
    this.page.removeListener("requestfinished", this.handleRequestFinished);
    this.page.removeListener("requestfailed", this.handleRequestFailed);
    this.activeRequests.clear();
    this.log("Network tracking cleaned up");
  }

  handleRequest = (request: Request) => {
    // Ignore certain resource types that don't indicate meaningful activity
    // const resourceType = request.resourceType();
    // if (["favicon", "ping", "beacon"].includes(resourceType)) {
    //   return;
    // }

    const url = request.url();
    const urlObj = new URL(url);
    if (!urlObj.hostname.endsWith(".onlyoffice.io")) return;

    const id = `${this.requestSequence++}:${url}`;
    this.activeRequests.add(id);
    this.log(`New request: ${id}. Total active: ${this.activeRequests.size}`);
  };

  handleRequestFinished = (request: Request) => {
    const url = request.url();
    this.removeRequest(url);
  };

  handleRequestFailed = (request: Request) => {
    const url = request.url();
    this.removeRequest(url);
  };

  removeRequest = (url: string) => {
    let removed = false;
    for (const id of this.activeRequests) {
      const i = id.indexOf(":");
      const cleanedUrl = id.slice(i + 1);

      if (cleanedUrl === url) {
        this.activeRequests.delete(id);
        removed = true;
        break;
      }
    }

    if (removed) {
      this.log(
        `Request completed: ${url}. Remaining active: ${this.activeRequests.size}`,
      );
    }
  };

  /**
   * Waits for all active network requests to complete
   * @param options Wait options
   * @returns Promise that resolves when the network is considered idle
   */
  async waitForNetworkIdle(options?: {
    timeout?: number;
    idleTime?: number;
    maxInflightRequests?: number;
  }): Promise<void> {
    const timeout = options?.timeout ?? 30000;
    const idleTime = options?.idleTime ?? 500;
    const maxInflightRequests = options?.maxInflightRequests ?? 0;

    // eslint-disable-next-line
    let idleTimeout: NodeJS.Timeout | null = null;
    let isIdle = false;

    return new Promise<void>((resolve, reject) => {
      // Master timeout - will resolve the promise after this time regardless
      const masterTimeout = setTimeout(() => {
        console.log(
          `Master timeout reached after ${timeout}ms. Active requests: ${this.activeRequests.size}`,
        );
        clearInterval(checkInterval);
        if (idleTimeout) clearTimeout(idleTimeout);
        reject(
          new Error(
            `Master timeout reached, pending requests: ${this.activeRequests.size} ${Array.from(this.activeRequests.values())}`,
          ),
        );
      }, timeout);

      // Function to check network idle state
      const checkIfIdle = () => {
        if (this.activeRequests.size <= maxInflightRequests) {
          if (!isIdle) {
            this.log(
              `Network quiet detected (${this.activeRequests.size} <= ${maxInflightRequests} requests). Starting idle timer.`,
            );
            isIdle = true;

            // Clear existing idle timeout
            if (idleTimeout) clearTimeout(idleTimeout);

            // Set new idle timeout
            idleTimeout = setTimeout(() => {
              this.log(`Network has been idle for ${idleTime}ms. Resolving.`);
              clearInterval(checkInterval);
              clearTimeout(masterTimeout);
              resolve();
            }, idleTime);
          }
        } else if (isIdle) {
          // We were idle, but now there are too many requests
          this.log(
            `Network activity resumed (${this.activeRequests.size} > ${maxInflightRequests} requests). Canceling idle timer.`,
          );
          isIdle = false;
          if (idleTimeout) {
            clearTimeout(idleTimeout);
            idleTimeout = null;
          }
        }
      };

      // Set up interval for periodic checking
      const checkInterval = setInterval(() => {
        checkIfIdle();
      }, 100);

      // Check immediately in case there are no requests
      checkIfIdle();
    });
  }
}
