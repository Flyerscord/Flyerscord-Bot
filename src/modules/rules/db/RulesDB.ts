import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { eq, and, desc, asc, gt, sql } from "drizzle-orm";
import { rulesSections, rulesMessages, rulesSectionMessages, rulesState, RulesSectionTypeEnum, RuleSectionDTO, RuleContentPageDTO } from "./schema";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";

export default class RulesDB extends ModuleDatabase {
  constructor() {
    super("Rules");
  }

  // Section Management

  async getSection(sectionName: string): Promise<RuleSectionDTO | null> {
    const normalizedName = this.getSectionId(sectionName);

    // Get section data
    const section = await this.db.select().from(rulesSections).where(eq(rulesSections.name, normalizedName)).limit(1);

    if (section.length === 0) return null;

    // Get header message
    const headerMsg = await this.db
      .select()
      .from(rulesSectionMessages)
      .where(and(eq(rulesSectionMessages.sectionId, normalizedName), eq(rulesSectionMessages.type, RulesSectionTypeEnum.HEADER)))
      .limit(1);

    // Get content messages with their indices for ordering
    const contentMsgs = await this.db
      .select({
        messageId: rulesSectionMessages.messageId,
        content: rulesSectionMessages.content,
        index: rulesMessages.index,
      })
      .from(rulesSectionMessages)
      .innerJoin(rulesMessages, eq(rulesSectionMessages.messageId, rulesMessages.messageId))
      .where(and(eq(rulesSectionMessages.sectionId, normalizedName), eq(rulesSectionMessages.type, RulesSectionTypeEnum.CONTENT)))
      .orderBy(asc(rulesMessages.index));

    // Transform to DTO
    return {
      name: section[0].friendlyName,
      friendlyName: section[0].friendlyName,
      headerUrl: headerMsg[0]?.url || `# ${section[0].friendlyName}`,
      headerMessageId: headerMsg[0]?.messageId || null,
      contentPages: contentMsgs.map((msg) => ({
        messageId: msg.messageId,
        content: msg.content!,
      })),
    };
  }

  async getAllSections(): Promise<RuleSectionDTO[]> {
    const sections = await this.db.select().from(rulesSections);

    const results: RuleSectionDTO[] = [];
    for (const section of sections) {
      const dto = await this.getSection(section.name);
      if (dto) results.push(dto);
    }

    return results;
  }

  async hasSection(sectionName: string): Promise<boolean> {
    const normalizedName = this.getSectionId(sectionName);
    return this.select1(rulesSections, eq(rulesSections.name, normalizedName));
  }

  async getSectionHeader(sectionName: string): Promise<string | null> {
    const normalizedName = this.getSectionId(sectionName);

    const header = await this.db
      .select({ url: rulesSectionMessages.url })
      .from(rulesSectionMessages)
      .where(and(eq(rulesSectionMessages.sectionId, normalizedName), eq(rulesSectionMessages.type, RulesSectionTypeEnum.HEADER)))
      .limit(1);

    return header[0]?.url || null;
  }

  async setHeaderUrl(sectionName: string, headerUrl: string): Promise<boolean> {
    const normalizedName = this.getSectionId(sectionName);

    if (!(await this.hasSection(normalizedName))) {
      Stumper.error(`Section ${sectionName} does not exist!`, "rules:RulesDB:setHeaderUrl");
      return false;
    }

    // Find existing header message if any
    const existing = await this.db
      .select()
      .from(rulesSectionMessages)
      .where(and(eq(rulesSectionMessages.sectionId, normalizedName), eq(rulesSectionMessages.type, RulesSectionTypeEnum.HEADER)))
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      await this.db.update(rulesSectionMessages).set({ url: headerUrl }).where(eq(rulesSectionMessages.messageId, existing[0].messageId));
    }
    // If no header exists yet, it will be created when setHeaderMessageId is called

    return true;
  }

  async setHeaderMessageId(sectionName: string, messageId: string): Promise<boolean> {
    const normalizedName = this.getSectionId(sectionName);

    if (!(await this.hasSection(normalizedName))) {
      Stumper.error(`Section ${sectionName} does not exist!`, "rules:RulesDB:setHeaderMessageId");
      return false;
    }

    // Get current header URL
    const headerUrl = (await this.getSectionHeader(normalizedName)) || `# ${sectionName}`;

    // Insert or update header message
    await this.db
      .insert(rulesSectionMessages)
      .values({
        messageId,
        sectionId: normalizedName,
        type: RulesSectionTypeEnum.HEADER,
        url: headerUrl,
        content: null,
      })
      .onConflictDoUpdate({
        target: rulesSectionMessages.messageId,
        set: { url: headerUrl },
      });

    return true;
  }

  async setContentPages(sectionName: string, contentPages: RuleContentPageDTO[]): Promise<boolean> {
    const normalizedName = this.getSectionId(sectionName);

    if (!(await this.hasSection(normalizedName))) {
      Stumper.error(`Section ${sectionName} does not exist!`, "rules:RulesDB:setContentPages");
      return false;
    }

    // Delete existing content messages for this section
    await this.db
      .delete(rulesSectionMessages)
      .where(and(eq(rulesSectionMessages.sectionId, normalizedName), eq(rulesSectionMessages.type, RulesSectionTypeEnum.CONTENT)));

    // Insert new content messages
    for (const page of contentPages) {
      await this.db
        .insert(rulesSectionMessages)
        .values({
          messageId: page.messageId,
          sectionId: normalizedName,
          type: RulesSectionTypeEnum.CONTENT,
          url: null,
          content: page.content,
        })
        .onConflictDoUpdate({
          target: rulesSectionMessages.messageId,
          set: { content: page.content },
        });
    }

    // Update concatenated content in rulesSections
    const fullContent = contentPages.map((p) => p.content).join("\n");
    await this.db.update(rulesSections).set({ content: fullContent }).where(eq(rulesSections.name, normalizedName));

    return true;
  }

  async setContentPageMessageId(sectionName: string, index: number, messageId: string): Promise<boolean> {
    const normalizedName = this.getSectionId(sectionName);

    if (!(await this.hasSection(normalizedName))) {
      Stumper.error(`Section ${sectionName} does not exist!`, "rules:RulesDB:setContentPageMessageId");
      return false;
    }

    // Get all content pages for this section
    const section = await this.getSection(normalizedName);
    if (!section || index >= section.contentPages.length) {
      return false;
    }

    // Update the specific page's messageId
    const oldMessageId = section.contentPages[index].messageId;

    // Delete old entry and insert new one (since messageId is PK)
    await this.db.delete(rulesSectionMessages).where(eq(rulesSectionMessages.messageId, oldMessageId));

    await this.db.insert(rulesSectionMessages).values({
      messageId: messageId,
      sectionId: normalizedName,
      type: RulesSectionTypeEnum.CONTENT,
      url: null,
      content: section.contentPages[index].content,
    });

    return true;
  }

  async ensureSectionExists(sectionName: string, friendlyName: string): Promise<void> {
    const normalizedName = this.getSectionId(sectionName);

    await this.db
      .insert(rulesSections)
      .values({
        name: normalizedName,
        friendlyName: friendlyName,
        content: "",
      })
      .onConflictDoNothing();
  }

  getSectionId(name: string): string {
    return name.toLowerCase().replaceAll(" ", "_");
  }

  // Message Management

  async getMessages(): Promise<string[]> {
    const messages = await this.db.select({ messageId: rulesMessages.messageId }).from(rulesMessages).orderBy(asc(rulesMessages.index));

    return messages.map((m) => m.messageId);
  }

  async addMessage(messageId: string): Promise<void> {
    // Get current max index
    const maxIndex = await this.db.select({ index: rulesMessages.index }).from(rulesMessages).orderBy(desc(rulesMessages.index)).limit(1);

    const nextIndex = maxIndex.length > 0 ? maxIndex[0].index + 1 : 0;

    await this.db.insert(rulesMessages).values({ messageId, index: nextIndex });
  }

  async removeMessage(messageId: string): Promise<void> {
    // Get the index of the message being removed
    const msg = await this.db.select({ index: rulesMessages.index }).from(rulesMessages).where(eq(rulesMessages.messageId, messageId)).limit(1);

    if (msg.length === 0) return;

    const removedIndex = msg[0].index;

    // Delete the message and associated section messages
    await this.db.delete(rulesSectionMessages).where(eq(rulesSectionMessages.messageId, messageId));

    await this.db.delete(rulesMessages).where(eq(rulesMessages.messageId, messageId));

    // Decrement indices of all messages after this one
    await this.db
      .update(rulesMessages)
      .set({ index: sql`${rulesMessages.index} - 1` })
      .where(gt(rulesMessages.index, removedIndex));
  }

  async removeAllMessages(): Promise<void> {
    await this.db.delete(rulesSectionMessages);
    await this.db.delete(rulesMessages);
  }

  async getMessagesCount(): Promise<number> {
    return await this.getRowsCount(rulesMessages);
  }

  async ensureNumberOfMessages(numberOfMessages: number, purgeFirst: boolean = false, channelId: string): Promise<boolean> {
    const currentCount = await this.getMessagesCount();

    if (purgeFirst) {
      await this.removeAllMessagesFromDiscord(channelId);
      await this.removeAllMessages();
    }

    const diff = numberOfMessages - (purgeFirst ? 0 : currentCount);

    if (diff === 0) {
      return true;
    } else if (diff < 0) {
      // Remove messages
      return await this.removeExcessMessages(Math.abs(diff), channelId);
    } else {
      // Add messages - requires complete redraw
      return await this.redrawMessages(numberOfMessages, channelId);
    }
  }

  private async removeExcessMessages(count: number, channelId: string): Promise<boolean> {
    const messages = await this.getMessages();
    const toRemove = messages.slice(-count); // Remove from end

    let success = true;
    for (const msgId of toRemove) {
      const discordSuccess = await discord.messages.deleteMessage(channelId, msgId);
      if (discordSuccess) {
        await this.removeMessage(msgId);
      } else {
        success = false;
      }
    }

    return success;
  }

  private async redrawMessages(targetCount: number, channelId: string): Promise<boolean> {
    // Remove all existing messages
    await this.removeAllMessagesFromDiscord(channelId);
    await this.removeAllMessages();

    // Create new placeholder messages
    let success = true;
    for (let i = 0; i < targetCount; i++) {
      const message = await discord.messages.sendMessageToChannel(channelId, "*Placeholder... Please wait*");

      if (message) {
        await this.addMessage(message.id);
      } else {
        success = false;
        break;
      }
    }

    return success;
  }

  private async removeAllMessagesFromDiscord(channelId: string): Promise<void> {
    const messages = await this.getMessages();
    for (const msgId of messages) {
      await discord.messages.deleteMessage(channelId, msgId);
    }
  }

  // State Management

  async getFullFile(): Promise<string> {
    const result = await this.db.select({ value: rulesState.value }).from(rulesState).where(eq(rulesState.key, "full_file")).limit(1);

    return result[0]?.value || "";
  }

  async setFullFile(content: string): Promise<void> {
    await this.db
      .insert(rulesState)
      .values({ key: "full_file", value: content })
      .onConflictDoUpdate({
        target: rulesState.key,
        set: { value: content, updatedAt: new Date() },
      });
  }
}
