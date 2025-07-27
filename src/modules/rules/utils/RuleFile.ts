import { AttachmentBuilder, Attachment } from "discord.js";
import RulesDB from "../providers/Rules.Database";
import RuleMessagesDB from "../providers/RuleMessages.Database";
import ConfigManager from "@common/config/ConfigManager";
import Stumper from "stumper";
import discord from "@common/utils/discord/discord";
import { IRuleSectionPage } from "../interfaces/IRuleSection";
import https from "node:https";

export default class RuleFile {
  static getRulesFile(): AttachmentBuilder {
    const db = RulesDB.getInstance();

    const text = db.getFullFile();

    const buffer = Buffer.from(text, "utf-8");
    return new AttachmentBuilder(buffer, { name: "rules.txt" });
  }

  static getDefaultRulesFile(): AttachmentBuilder {
    const sections = ConfigManager.getInstance().getConfig("Rules").sections;

    let contentString = "";
    for (const section of sections) {
      const sectionHeader = this.createSectionHeader(section);
      contentString += sectionHeader + "\n";
      contentString += `### ${section} content placeholder\n`;
    }
    const buffer = Buffer.from(contentString, "utf-8");
    return new AttachmentBuilder(buffer, { name: "rules.txt" });
  }

  static async setRulesFile(attachment: Attachment): Promise<boolean> {
    const MAX_MESSAGE_LENGTH = 2000;

    const rulesDb = RulesDB.getInstance();
    const messagesDb = RuleMessagesDB.getInstance();

    const config = ConfigManager.getInstance().getConfig("Rules");
    const sections = config.sections;
    const channelId = config.channelId;

    const response = await fetch(attachment.url);
    const text = await response.text();

    const fullContent = new Map<string, string>();

    // Get the full content of each section
    for (const section of sections) {
      const headerPattern = new RegExp(`///${section}///\\s*([\\s\\S]*?)(?=\\s*///\\w+///|$)`, "g");
      const match = headerPattern.exec(text);
      const sectionContent = match ? match[1].trim() : null;
      if (!sectionContent) {
        Stumper.error(
          `Failed to find section content for section ${section}. Make sure that there is atleast a placeholder in the section!`,
          "rules:RuleFile:setRulesFile",
        );
        return false;
      }
      fullContent.set(section, sectionContent);
    }

    // Figure out how many messages we need to create
    let numberOfMessages = 0;
    const contentChunks = new Map<string, string[]>();
    for (const [section, sectionContent] of fullContent) {
      // Increment for the header message
      numberOfMessages++;

      const sectionContentChunks = this.splitByLine(sectionContent, MAX_MESSAGE_LENGTH);
      contentChunks.set(section, sectionContentChunks);
      numberOfMessages += sectionContentChunks.length;
    }

    const res = await messagesDb.ensureNumberOfMessages(numberOfMessages);
    if (!res) {
      Stumper.error(`Failed to ensure number of messages!`, "rules:RuleFile:setRulesFile");
      return false;
    }

    const messages = messagesDb.getMessages();
    let currentMessageIndex = 0;
    for (const [section, chunks] of contentChunks) {
      const headerContent = rulesDb.getSectionHeader(section);
      if (headerContent.startsWith("http")) {
        const attachment = await this.getImageAttachmentFromUrl(headerContent, section + ".png");
        await discord.messages.updateMessageReplaceTextWithImage(channelId, messages[currentMessageIndex], attachment);
      } else {
        await discord.messages.updateMessageWithText(channelId, messages[currentMessageIndex], headerContent, true);
      }
      rulesDb.setHeaderMessageId(section, messages[currentMessageIndex]);
      currentMessageIndex++;

      const contentPages: IRuleSectionPage[] = [];
      for (const chunk of chunks) {
        await discord.messages.updateMessageWithText(channelId, messages[currentMessageIndex], chunk, true);
        const contentPage: IRuleSectionPage = { messageId: messages[currentMessageIndex], content: chunk };
        contentPages.push(contentPage);
        currentMessageIndex++;
      }
      rulesDb.setContentPages(section, contentPages);
    }

    rulesDb.setFullFile(text);
    return true;
  }

  private static createSectionHeader(sectionName: string): string {
    return `///${sectionName}///`;
  }

  private static splitByLine(text: string, maxLength: number): string[] {
    const lines = text.split("\n");
    const chunks: string[] = [];
    let currentChunk = "";

    for (const line of lines) {
      const trimmedLine = line.trim();

      // If the line is exactly ---BREAK---, force a split
      if (trimmedLine === "---BREAK---") {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = "";
        }
        continue; // Don't include the ---BREAK--- line itself
      }

      const newLine = (currentChunk ? "\n" : "") + line;

      if ((currentChunk + newLine).length > maxLength) {
        chunks.push(currentChunk);
        currentChunk = line;
      } else {
        currentChunk += newLine;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  static async getImageAttachmentFromUrl(url: string, filename: string): Promise<AttachmentBuilder> {
    const buffer = await this.downloadImageBuffer(url);
    return new AttachmentBuilder(buffer, { name: filename });
  }

  private static downloadImageBuffer(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          const chunks: Uint8Array[] = [];

          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
          res.on("error", reject);
        })
        .on("error", reject);
    });
  }
}
