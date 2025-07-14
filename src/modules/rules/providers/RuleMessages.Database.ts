import ConfigManager from "@common/config/ConfigManager";
import Database from "@common/providers/Database";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";

type Messages = string[];

export default class RuleMessagesDB extends Database {
  private readonly messsagesKey = "messages";
  private readonly countKey = "messagesCount";
  private readonly channelId: string;

  constructor() {
    super({ name: "ruleMessages" });

    this.channelId = ConfigManager.getInstance().getConfig("Rules").channelId;

    this.ensure(this.messsagesKey, []);
    this.ensure(this.countKey, 0);
  }

  async ensureNumberOfMessages(numberOfMessages: number, purgeFirst: boolean = false): Promise<boolean> {
    this.resetMessageCount();
    if (purgeFirst) {
      await this.removeAllMessages();
    }

    const messageCountDiff = numberOfMessages - this.getCurrentNumberOfSentMessages();
    if (messageCountDiff === 0) {
      return true;
    } else if (messageCountDiff < 0) {
      // Need to remove messages
      const messagesToRemove = Math.abs(messageCountDiff);

      let res = true;
      for (let i = 0; i < messagesToRemove; i++) {
        res = res && (await this.popMessage());
      }
      return res && this.getCurrentNumberOfSentMessages() === numberOfMessages;
    } else {
      // Need to add messages
      // When adding messages, we need to do a complete redraw (if messages are too far apart they get their own message icon)
      const messagesToAdd = Math.abs(messageCountDiff);

      for (let i = 0; i < messagesToAdd; i++) {
        this.incrementMessageCount();
      }

      const res = await this.redrawMessages();
      return res && this.getCurrentNumberOfSentMessages() === numberOfMessages;
    }
  }

  getMessages(): Messages {
    return this.db.get(this.messsagesKey);
  }

  private async addMessage(): Promise<boolean> {
    const message = await discord.messages.sendMessageToChannel(this.channelId, "*Placeholder... Please wait*");
    if (!message) {
      Stumper.error(`Failed to send message to channel ${this.channelId}`, "rules:RuleMessagesDB:addMessage");
      return false;
    }
    this.db.push(this.messsagesKey, message.id);
    return true;
  }

  private async removeMessage(messageId: string): Promise<boolean> {
    const res = await discord.messages.deleteMessage(this.channelId, messageId);
    if (res) {
      this.db.remove(this.messsagesKey, messageId);
      return true;
    }
    return false;
  }

  private async popMessage(): Promise<boolean> {
    const messages: Messages = this.db.get(this.messsagesKey);
    const lastMessage = messages[messages.length - 1];

    return await this.removeMessage(lastMessage);
  }

  async removeAllMessages(): Promise<boolean> {
    let res = true;
    const messages: Messages = this.db.get(this.messsagesKey);
    for (const message of messages) {
      res = res && (await this.removeMessage(message));
    }
    return res;
  }

  private async redrawMessages(): Promise<boolean> {
    let res = await this.removeAllMessages();

    for (let i = 0; i < this.getCurrentNumberOfMessages(); i++) {
      res = res && (await this.addMessage());
    }
    return res;
  }

  private getCurrentNumberOfSentMessages(): number {
    return this.db.get(this.messsagesKey).length;
  }

  private getCurrentNumberOfMessages(): number {
    return this.db.get(this.countKey);
  }

  private incrementMessageCount(): void {
    this.db.inc(this.countKey);
  }

  private decrementMessageCount(): void {
    this.db.dec(this.countKey);
  }

  private resetMessageCount(): void {
    this.db.set(this.countKey, this.getCurrentNumberOfSentMessages());
  }
}
