import { ImapFlow } from "imapflow";
import log from "../utils/logger";

class MailChecker {
  /**
   * @param {Object} config
   * @param {string} config.url
   * @param {string} config.user
   * @param {string} config.pass
   * @param {string} [config.checkedFolder]
   */
  constructor(config) {
    this.checkedFolder = config.checkedFolder || "checked";
    this.imapClient = new ImapFlow({
      host: config.url,
      secure: true,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async connect() {
    await this.imapClient.connect();
  }

  async disconnect() {
    await this.imapClient.logout();
  }

  async ensureFolderExists(mailbox) {
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
  }) {
    await this.connect();
    const lock = await this.imapClient.getMailboxLock("INBOX");
    try {
      if (moveOut) {
        await this.ensureFolderExists(this.checkedFolder);
      }
      const startTime = Date.now();
      let foundEmail = null;
      while ((Date.now() - startTime) / 1000 < timeoutSeconds) {
        const uids = await this.imapClient.search({ seen: false });
        if (uids.length > 0) {
          for (const uid of uids) {
            const message = await this.imapClient.fetchOne(uid, {
              envelope: true,
            });
            const emailSubject = message.envelope.subject || "";
            if (emailSubject.toUpperCase().includes(subject.toUpperCase())) {
              foundEmail = { uid, subject: emailSubject };
              if (moveOut) {
                await this.imapClient.messageMove(uid, this.checkedFolder);
              } else {
                await this.imapClient.messageFlagsAdd(uid, ["\\Seen"]);
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
  }) {
    await this.connect();
    log.debug("Connected to mail server.");

    const lock = await this.imapClient.getMailboxLock("INBOX");
    try {
      if (moveOut) {
        await this.ensureFolderExists(this.checkedFolder);
      }

      const startTime = Date.now();
      let foundEmail = null;

      while ((Date.now() - startTime) / 1000 < timeoutSeconds) {
        const uids = await this.imapClient.search({ all: true });
        const lastEmails = uids.slice(-5);

        for (const uid of lastEmails) {
          const message = await this.imapClient.fetchOne(uid, {
            envelope: true,
            source: true,
          });

          const emailSubject = message.envelope.subject || "";
          const emailBody = message.source.toString();

          log.debug(`Checking email - Subject: "${emailSubject}"`);

          if (emailSubject.toUpperCase().includes(subject.toUpperCase())) {
            const portalUrlMatch = emailBody.match(
              /https:\/\/([\w-]+\.onlyoffice\.io)/,
            );
            if (portalUrlMatch) {
              const extractedPortalUrl = portalUrlMatch[1].toLowerCase();
              const expectedPortalName = portalName.toLowerCase();

              if (extractedPortalUrl.includes(expectedPortalName)) {
                log.debug(`Found email with portal URL: ${extractedPortalUrl}`);

                if (moveOut) {
                  await this.imapClient.messageMove(uid, this.checkedFolder);
                } else {
                  await this.imapClient.messageFlagsAdd(uid, ["\\Seen"]);
                }

                foundEmail = { uid, subject: emailSubject, body: emailBody };
                break;
              }
            }
          }
        }

        if (foundEmail) break;
        log.debug("Email not found yet, retrying...");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      return foundEmail;
    } finally {
      lock.release();
      await this.disconnect();
      log.debug("Disconnected from mail server.");
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
  }) {
    const email = await this.findEmailbySubjectWithPortalLink({
      subject,
      portalName,
      timeoutSeconds,
      moveOut,
    });
    if (!email) return null;
    const linkMatch = email.body.match(/https:\/\/test-portal[\w.-]+/);
    return linkMatch ? linkMatch[0] : null;
  }
}

export default MailChecker;
