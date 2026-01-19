import { FetchMessageObject, ImapFlow, MessageEnvelopeObject } from "imapflow";

interface MailCheckerConfig {
  url: string;
  user: string;
  pass: string;
  checkedFolder?: string;
}

interface CheckEmailBySubjectOptions {
  subject: string;
  timeoutSeconds?: number;
  moveOut?: boolean;
}

interface CheckEmailBySenderAndSubjectOptions {
  subject: string;
  sender: string;
  timeoutSeconds?: number;
  moveOut?: boolean;
}

interface FindEmailBySubjectWithPortalLinkOptions {
  subject: string;
  portalName: string;
  timeoutSeconds?: number;
  moveOut?: boolean;
}

interface ExtractPortalLinkOptions {
  subject: string;
  portalName: string;
  timeoutSeconds?: number;
  moveOut?: boolean;
}

type EmailResult = {
  uid: string | number;
  subject: string;
  sender?: string;
  body?: string;
};

class MailChecker {
  private checkedFolder: string;
  private imapClient: ImapFlow;

  /**
   * @param {Object} config
   * @param {string} config.url
   * @param {string} config.user
   * @param {string} config.pass
   * @param {string} [config.checkedFolder]
   */
  constructor(config: MailCheckerConfig) {
    this.checkedFolder = config.checkedFolder || "checked";
    this.imapClient = new ImapFlow({
      host: config.url,
      secure: true,
      auth: {
        user: config.user,
        pass: config.pass,
      },
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

  async ensureFolderExists(mailbox: string): Promise<void> {
    const mailboxes = await this.imapClient.list();
    if (!mailboxes.some((mbox) => mbox.path === mailbox)) {
      await this.imapClient.mailboxCreate(mailbox);
    }
  }

  /**
   * Searches for an email with the specified subject in the INBOX for the given timeout duration.
   * If the email is found, it either moves the email to the "checked" folder (if moveOut=true)
   * or marks it as read.
   *
   * @param {Object} options
   * @param {string} options.subject The subject to search for (partial match, case-insensitive)
   * @param {number} [options.timeoutSeconds=300] Timeout in seconds to wait for the email
   * @param {boolean} [options.moveOut=false] If true, move the email to the "checked" folder; otherwise, mark as read
   * @returns {Object|null} An object containing email data or null if no email was found
   */
  async checkEmailBySubject({
    subject,
    timeoutSeconds = 300,
    moveOut = false,
  }: CheckEmailBySubjectOptions): Promise<EmailResult | null> {
    await this.connect();
    const lock = await this.imapClient.getMailboxLock("INBOX");
    try {
      if (moveOut) {
        await this.ensureFolderExists(this.checkedFolder);
      }
      const startTime = Date.now();
      let foundEmail: EmailResult | null = null;
      while ((Date.now() - startTime) / 1000 < timeoutSeconds) {
        // Get all emails (including read and unread)
        const searchResult = await this.imapClient.search({ all: true });
        const uids: (string | number)[] = Array.isArray(searchResult)
          ? searchResult
          : [];

        if (uids.length > 0) {
          // Get only the last 5 emails
          const lastEmails = uids.slice(-5);

          // Get emails with dates for sorting
          const emailsWithDates: {
            uid: string | number;
            date: Date;
            message: FetchMessageObject;
          }[] = [];
          for (const uid of lastEmails) {
            const message = await this.imapClient.fetchOne(String(uid), {
              envelope: true,
            });
            if (!message) continue;
            const envelope: MessageEnvelopeObject | undefined =
              message?.envelope;
            if (!envelope) continue;
            if (!envelope || !envelope.date) continue;
            emailsWithDates.push({
              uid,
              date: new Date(envelope.date),
              message,
            });
          }

          // Sort by date (newest first)
          emailsWithDates.sort((a, b) => a.date.getTime() - b.date.getTime());

          // Find email with the required subject
          for (const { uid, message } of emailsWithDates) {
            if (!message) continue;
            const envelope: MessageEnvelopeObject | undefined =
              message?.envelope;
            if (!envelope) continue;
            const emailSubject = envelope.subject || "";
            if (emailSubject.toUpperCase().includes(subject.toUpperCase())) {
              foundEmail = { uid, subject: emailSubject };
              if (moveOut) {
                await this.imapClient.messageMove(
                  String(uid),
                  this.checkedFolder,
                );
              } else {
                await this.imapClient.messageFlagsAdd(String(uid), ["\\Seen"]);
              }
              break;
            }
          }
        }

        if (foundEmail) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      return foundEmail;
    } finally {
      lock.release();
      await this.disconnect();
    }
  }

  /**
   * Searches for an email with the specified subject and sender name in the INBOX.
   * If the email is found, it either moves the email to the "checked" folder (if moveOut=true)
   * or marks it as read.
   *
   * @param {Object} options
   * @param {string} options.subject The subject to search for (partial match, case-insensitive)
   * @param {string} options.sender The sender name to search for (partial match, case-insensitive)
   * @param {number} [options.timeoutSeconds=300] Timeout in seconds to wait for the email
   * @param {boolean} [options.moveOut=false] If true, move the email to the "checked" folder; otherwise, mark as read
   * @returns {Object|null} An object containing email data or null if no email was found
   */
  async checkEmailBySenderAndSubject({
    subject,
    sender,
    timeoutSeconds = 600,
    moveOut = false,
  }: CheckEmailBySenderAndSubjectOptions): Promise<EmailResult | null> {
    try {
      await this.connect();
      const lock = await this.imapClient.getMailboxLock("INBOX");
      try {
        if (moveOut) {
          await this.ensureFolderExists(this.checkedFolder);
        }
        const startTime = Date.now();
        let foundEmail: EmailResult | null = null;
        while ((Date.now() - startTime) / 1000 < timeoutSeconds) {
          // Get all emails (including read and unread)
          const searchResult = await this.imapClient.search({ all: true });
          const uids: (string | number)[] = Array.isArray(searchResult)
            ? searchResult
            : [];

          if (uids.length > 0) {
            // Get only the last 5 emails
            const lastEmails = uids.slice(-5);

            // Get emails with dates for sorting
            const emailsWithDates: {
              uid: string | number;
              date: Date;
              message: FetchMessageObject;
            }[] = [];
            for (const uid of lastEmails) {
              const message = await this.imapClient.fetchOne(String(uid), {
                envelope: true,
              });
              if (!message) continue;
              const envelope = message?.envelope;
              if (!envelope || !envelope.date) continue;
              emailsWithDates.push({
                uid,
                date: new Date(envelope.date),
                message,
              });
            }

            // Sort by date (newest first)
            emailsWithDates.sort((a, b) => a.date.getTime() - b.date.getTime());

            // Find email with the required subject and sender
            for (const { uid, message } of emailsWithDates) {
              if (!message) continue;
              const envelope: MessageEnvelopeObject | undefined =
                message?.envelope;
              if (!envelope) continue;
              const emailSubject = envelope?.subject || "";
              const fromName = (envelope?.from && envelope.from[0]?.name) || "";

              if (
                emailSubject.toUpperCase().includes(subject.toUpperCase()) &&
                fromName.toUpperCase().includes(sender.toUpperCase())
              ) {
                foundEmail = {
                  uid,
                  subject: emailSubject,
                  sender: fromName,
                };

                if (moveOut) {
                  await this.imapClient.messageMove(
                    String(uid),
                    this.checkedFolder,
                  );
                } else {
                  await this.imapClient.messageFlagsAdd(String(uid), [
                    "\\Seen",
                  ]);
                }
                break;
              }
            }
          }

          if (foundEmail) break;
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        return foundEmail;
      } finally {
        lock.release();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`Error checking email: ${error.message}`);
      }
      return null;
    } finally {
      await this.disconnect();
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
   * 5. If the expected URL is found, the email is either marked as read or moved to the "checked" folder.
   * 6. Returns the email details if found; otherwise, keeps searching until the timeout is reached.
   *
   * @param {Object} options - Search criteria.
   * @param {string} options.subject - The subject of the email to search for (case-insensitive match).
   * @param {string} options.portalName - The portal name that should appear in the email body (part of the URL).
   * @param {number} [options.timeoutSeconds=300] - Time in seconds to wait for the email to arrive.
   * @param {boolean} [options.moveOut=false] - If true, moves the email to the "checked" folder; otherwise, marks it as read.
   * @returns {Object|null} - Returns an object containing email details if found, otherwise null.
   */

  async findEmailbySubjectWithPortalLink({
    subject,
    portalName,
    timeoutSeconds = 300,
    moveOut = false,
  }: FindEmailBySubjectWithPortalLinkOptions): Promise<EmailResult | null> {
    await this.connect();
    const lock = await this.imapClient.getMailboxLock("INBOX");
    try {
      if (moveOut) {
        await this.ensureFolderExists(this.checkedFolder);
      }

      const startTime = Date.now();
      let foundEmail: EmailResult | null = null;

      while ((Date.now() - startTime) / 1000 < timeoutSeconds) {
        const searchResult = await this.imapClient.search({ all: true });
        const uids: (string | number)[] = Array.isArray(searchResult)
          ? searchResult
          : [];
        const lastEmails = uids.slice(-5);

        for (const uid of lastEmails) {
          const message = await this.imapClient.fetchOne(String(uid), {
            envelope: true,
            source: true,
          });
          if (!message) continue;

          const envelope: MessageEnvelopeObject | undefined = message?.envelope;
          if (!envelope) continue;
          const emailSubject = envelope.subject || "";
          const emailBody = message?.source?.toString() || "";

          if (emailSubject.toUpperCase().includes(subject.toUpperCase())) {
            const portalUrlMatch = emailBody.match(
              /https:\/\/([\w-]+\.onlyoffice\.io)/,
            );
            if (portalUrlMatch) {
              const extractedPortalUrl = portalUrlMatch[1].toLowerCase();
              const expectedPortalName = portalName.toLowerCase();

              if (extractedPortalUrl.includes(expectedPortalName)) {
                if (moveOut) {
                  await this.imapClient.messageMove(
                    String(uid),
                    this.checkedFolder,
                  );
                } else {
                  await this.imapClient.messageFlagsAdd(String(uid), [
                    "\\Seen",
                  ]);
                }

                foundEmail = { uid, subject: emailSubject, body: emailBody };
                break;
              }
            }
          }
        }

        if (foundEmail) break;
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      return foundEmail;
    } finally {
      lock.release();
      await this.disconnect();
    }
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
   * @param {boolean} [options.moveOut=true] - If true, moves the email to the "checked" folder; otherwise, marks it as read.
   * @returns {Promise<string|null>} - Returns the extracted portal link if found, otherwise null.
   */
  async extractPortalLink({
    subject,
    portalName,
    timeoutSeconds = 300,
    moveOut = false,
  }: ExtractPortalLinkOptions): Promise<string | null> {
    const email = await this.findEmailbySubjectWithPortalLink({
      subject,
      portalName,
      timeoutSeconds,
      moveOut,
    });
    if (!email) return null;
    const decodedBody = this.decodeQuotedPrintable(email.body ?? "");
    const linkMatch = decodedBody.match(/https:\/\/[^\s/]+\/s\/[\w-]+/);
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
