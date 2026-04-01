import { FetchMessageObject, ImapFlow, MessageEnvelopeObject } from "imapflow";

const IMAP_TIMEOUT_MS = 5 * 60 * 1000;

interface MailCheckerConfig {
  url: string;
  user: string;
  pass: string;
  mailbox?: string;
  recipient?: string;
  maxEmailsToScan?: number;
}

interface CheckEmailBySubjectOptions {
  subject: string;
  timeoutSeconds?: number;
}

interface CheckEmailBySenderAndSubjectOptions {
  subject: string;
  sender: string;
  timeoutSeconds?: number;
}

interface FindEmailBySubjectWithPortalLinkOptions {
  subject: string;
  portalName: string;
  timeoutSeconds?: number;
}

interface ExtractPortalLinkOptions {
  subject: string;
  portalName: string;
  timeoutSeconds?: number;
}

type EmailResult = {
  uid: string | number;
  subject: string;
  sender?: string;
  body?: string;
};

class MailChecker {
  private mailbox: string;
  private recipient?: string;
  private maxEmailsToScan: number;
  private imapClient: ImapFlow;

  /**
   * @param {Object} config
   * @param {string} config.url
   * @param {string} config.user
   * @param {string} config.pass
   */
  constructor(config: MailCheckerConfig) {
    this.mailbox = config.mailbox || "INBOX";
    this.recipient = config.recipient?.toLowerCase();
    this.maxEmailsToScan = config.maxEmailsToScan ?? 100;
    this.imapClient = new ImapFlow({
      host: config.url,
      secure: true,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: IMAP_TIMEOUT_MS,
      greetingTimeout: IMAP_TIMEOUT_MS,
      socketTimeout: IMAP_TIMEOUT_MS,
      logger: false,
      port: 993,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.imapClient.connect();
    } catch (error) {
      console.log("Connection error:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      // Check if the client exists and the connection is active
      if (this.imapClient && this.imapClient.usable) {
        await this.imapClient.logout();
      }
    } catch (error: unknown) {
      // Ignore errors during disconnection
      if (error instanceof Error) {
        console.log("Disconnection error (ignored):", error.message);
      }
    }
  }

  private async waitForNextPoll(delayMs = 1000): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  private getRecipientLookupTerms(): string[] {
    if (!this.recipient) {
      return [];
    }

    const [localPart = ""] = this.recipient.split("@");
    const aliasPart = localPart.includes("+")
      ? (localPart.split("+").pop() ?? "")
      : "";

    return [...new Set([this.recipient, localPart, aliasPart].filter(Boolean))];
  }

  private async resolveMailbox(): Promise<string> {
    if (this.mailbox !== "INBOX") {
      return this.mailbox;
    }

    const lookupTerms = this.getRecipientLookupTerms();
    if (lookupTerms.length === 0) {
      return this.mailbox;
    }

    const mailboxes = await this.imapClient.list();
    const mailboxPaths = mailboxes.map((mailbox) => mailbox.path);

    for (const term of lookupTerms) {
      const exactMatch = mailboxPaths.find(
        (path) => path.toLowerCase() === term.toLowerCase(),
      );
      if (exactMatch) {
        return exactMatch;
      }
    }

    for (const term of lookupTerms) {
      const partialMatch = mailboxPaths.find((path) =>
        path.toLowerCase().includes(term.toLowerCase()),
      );
      if (partialMatch) {
        return partialMatch;
      }
    }

    return this.mailbox;
  }

  private matchesRecipient(envelope?: MessageEnvelopeObject): boolean {
    if (!this.recipient) {
      return true;
    }

    const recipients = envelope?.to ?? [];
    return recipients.some(
      (recipient) => recipient.address?.toLowerCase() === this.recipient,
    );
  }

  private async getMailboxLock() {
    const mailbox = await this.resolveMailbox();
    return this.imapClient.getMailboxLock(mailbox);
  }

  private async withMailboxLock<T>(callback: () => Promise<T>): Promise<T> {
    await this.connect();
    const lock = await this.getMailboxLock();
    try {
      return await callback();
    } finally {
      lock.release();
      await this.disconnect();
    }
  }

  private async getRecentMessages(options?: { withSource?: boolean }) {
    const searchResult = await this.imapClient.search({ all: true });
    const uids: (string | number)[] = Array.isArray(searchResult)
      ? searchResult
      : [];
    const recentUids = uids.slice(-this.maxEmailsToScan);
    const messages: {
      uid: string | number;
      date: Date;
      message: FetchMessageObject;
    }[] = [];

    for (const uid of recentUids) {
      const message = await this.imapClient.fetchOne(String(uid), {
        envelope: true,
        source: options?.withSource ?? false,
      });

      if (!message || !message.envelope?.date) continue;
      if (!this.matchesRecipient(message.envelope)) continue;

      messages.push({
        uid,
        date: new Date(message.envelope.date),
        message,
      });
    }

    messages.sort((a, b) => b.date.getTime() - a.date.getTime());
    return messages;
  }

  private async markAsRead(uid: string | number): Promise<void> {
    await this.imapClient.messageFlagsAdd(String(uid), ["\\Seen"]);
  }

  private async findMatchingEmail(
    timeoutSeconds: number,
    matcher: (email: {
      uid: string | number;
      message: FetchMessageObject;
    }) => EmailResult | null,
    options?: {
      pollDelayMs?: number;
      withSource?: boolean;
    },
  ): Promise<EmailResult | null> {
    const deadline = Date.now() + timeoutSeconds * 1000;

    while (Date.now() < deadline) {
      const messages = await this.getRecentMessages({
        withSource: options?.withSource,
      });

      for (const { uid, message } of messages) {
        const matchedEmail = matcher({ uid, message });
        if (!matchedEmail) {
          continue;
        }

        await this.markAsRead(uid);
        return matchedEmail;
      }

      await this.waitForNextPoll(options?.pollDelayMs);
    }

    return null;
  }

  async deleteAllMatchingEmails(scanLimit = 500): Promise<number> {
    await this.connect();
    const mailbox = await this.resolveMailbox();
    const lock = await this.imapClient.getMailboxLock(mailbox);
    try {
      const deleteQuery =
        mailbox !== "INBOX"
          ? { all: true }
          : this.recipient
            ? { to: this.recipient }
            : { all: true };

      const searchResult = await this.imapClient.search(deleteQuery);
      const matches = Array.isArray(searchResult)
        ? searchResult.slice(-scanLimit)
        : [];

      if (matches.length === 0) {
        return 0;
      }

      await this.imapClient.messageDelete(matches);
      return matches.length;
    } finally {
      lock.release();
      await this.disconnect();
    }
  }

  /**
   * Searches for an email with the specified subject in the INBOX for the given timeout duration.
   * If the email is found, it is marked as read.
   *
   * @param {Object} options
   * @param {string} options.subject The subject to search for (partial match, case-insensitive)
   * @param {number} [options.timeoutSeconds=300] Timeout in seconds to wait for the email
   * @returns {Object|null} An object containing email data or null if no email was found
   */
  async checkEmailBySubject({
    subject,
    timeoutSeconds = 300,
  }: CheckEmailBySubjectOptions): Promise<EmailResult | null> {
    return this.withMailboxLock(async () => {
      return this.findMatchingEmail(timeoutSeconds, ({ uid, message }) => {
        const emailSubject = message.envelope?.subject || "";
        if (!emailSubject.toUpperCase().includes(subject.toUpperCase())) {
          return null;
        }

        return {
          uid,
          subject: emailSubject,
        };
      });
    });
  }

  /**
   * Searches for an email with the specified subject and sender name in the INBOX.
   * If the email is found, it is marked as read.
   *
   * @param {Object} options
   * @param {string} options.subject The subject to search for (partial match, case-insensitive)
   * @param {string} options.sender The sender name to search for (partial match, case-insensitive)
   * @param {number} [options.timeoutSeconds=300] Timeout in seconds to wait for the email
   * @returns {Object|null} An object containing email data or null if no email was found
   */
  async checkEmailBySenderAndSubject({
    subject,
    sender,
    timeoutSeconds = 600,
  }: CheckEmailBySenderAndSubjectOptions): Promise<EmailResult | null> {
    try {
      return this.withMailboxLock(async () => {
        return this.findMatchingEmail(timeoutSeconds, ({ uid, message }) => {
          const envelope: MessageEnvelopeObject | undefined = message.envelope;
          if (!envelope) return null;

          const emailSubject = envelope.subject || "";
          const fromName = envelope.from?.[0]?.name || "";

          if (
            !emailSubject.toUpperCase().includes(subject.toUpperCase()) ||
            !fromName.toUpperCase().includes(sender.toUpperCase())
          ) {
            return null;
          }

          return {
            uid,
            subject: emailSubject,
            sender: fromName,
          };
        });
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`Error checking email: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Searches for an email with a specific subject and verifies that the email body contains
   * the expected URL.
   *
   * This method follows these steps:
   * 1. Connects to the email server and locks the INBOX.
   * 2. Searches the last 5 emails (ignoring read/unread status).
   * 3. Checks if an email with the given subject exists.
   * 4. Extracts the email body and looks for the portal URL.
   * 5. If the expected URL is found, the email is marked as read.
   * 6. Returns the email details if found; otherwise, keeps searching until the timeout is reached.
   *
   * @param {Object} options - Search criteria.
   * @param {string} options.subject - The subject of the email to search for (case-insensitive match).
   * @param {string} options.portalName - The portal name that should appear in the email body (part of the URL).
   * @param {number} [options.timeoutSeconds=300] - Time in seconds to wait for the email to arrive.
   * @returns {Object|null} - Returns an object containing email details if found, otherwise null.
   */

  private async findEmailBySubjectWithPortalLink({
    subject,
    portalName,
    timeoutSeconds = 300,
  }: FindEmailBySubjectWithPortalLinkOptions): Promise<EmailResult | null> {
    return this.withMailboxLock(async () => {
      return this.findMatchingEmail(
        timeoutSeconds,
        ({ uid, message }) => {
          const envelope: MessageEnvelopeObject | undefined = message.envelope;
          if (!envelope) return null;

          const emailSubject = envelope.subject || "";
          if (!emailSubject.toUpperCase().includes(subject.toUpperCase())) {
            return null;
          }

          const emailBody = message.source?.toString() || "";
          const portalUrlMatch = emailBody.match(
            /https:\/\/([\w-]+\.onlyoffice\.io)/,
          );

          if (!portalUrlMatch) {
            return null;
          }

          const extractedPortalUrl = portalUrlMatch[1].toLowerCase();
          const expectedPortalName = portalName.toLowerCase();

          if (!extractedPortalUrl.includes(expectedPortalName)) {
            return null;
          }

          return {
            uid,
            subject: emailSubject,
            body: emailBody,
          };
        },
        { withSource: true, pollDelayMs: 5000 },
      );
    });
  }

  /**
   * Extracts the portal link from an email matching the given subject.
   *
   * This method searches for an email with the specified subject and portal name,
   * then extracts the first occurrence of a valid HTTPS link from the email body.
   *
   * @param {Object} options - The options for email search.
   * @param {string} options.subject - The subject of the email to search for (case-insensitive match).
   * @param {string} options.portalName - The portal name that should appear in the email body.
   * @param {number} [options.timeoutSeconds=300] - Maximum time in seconds to wait for the email to arrive.
   * @returns {Promise<string|null>} - Returns the extracted portal link if found, otherwise null.
   */
  async extractPortalLink({
    subject,
    portalName,
    timeoutSeconds = 300,
  }: ExtractPortalLinkOptions): Promise<string | null> {
    const email = await this.findEmailBySubjectWithPortalLink({
      subject,
      portalName,
      timeoutSeconds,
    });
    if (!email) return null;
    const decodedBody = this.decodeQuotedPrintable(email.body ?? "");
    const escapedPortalName = portalName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const linkMatch = decodedBody.match(
      new RegExp(`https://${escapedPortalName}/s/[\\w-]+`),
    );
    return linkMatch ? linkMatch[0] : null;
  }

  decodeQuotedPrintable(encodedText: string): string {
    return encodedText
      .replace(/=\r\n/g, "")
      .replace(/=([A-Fa-f0-9]{2})/g, (_match: string, p1: string) => {
        return String.fromCharCode(parseInt(p1, 16));
      });
  }
}

export default MailChecker;
