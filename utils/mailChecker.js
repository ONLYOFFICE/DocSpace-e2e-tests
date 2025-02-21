import { ImapFlow } from "imapflow";

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
}

export default MailChecker;
