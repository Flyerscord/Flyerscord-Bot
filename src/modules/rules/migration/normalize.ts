import Normalize from "@root/src/common/migration/Normalize";
import { IRuleSection } from "../interfaces/IRuleSection";
import Stumper from "stumper";
import { rulesMessages, rulesSectionMessages, rulesSections, RulesSectionTypeEnum, rulesState } from "../schema/schema";

interface IRuleMessagesRecord {
  id: string;
  data: unknown;
}

interface IRuleSectionsRecord {
  id: string;
  data: IRuleSection;
}

export default class RulesNormalize extends Normalize {
  constructor() {
    super("Rules");
  }

  async normalize(): Promise<void> {
    await this.runMigration("raw_ruleMessages", this.migrateMessages.bind(this));
    await this.runMigration("raw_ruleSections", this.migrateSections.bind(this));
  }

  protected async runValidation(): Promise<boolean> {
    const messages = await this.getRawTableData<IRuleMessagesRecord>("raw_ruleMessages");
    const sections = await this.getRawTableData<IRuleSectionsRecord>("raw_ruleSections");

    let rawSectionCount = 0;
    let rawSectionMessagesCount = 0;
    for (const rawSectionRecord of sections) {
      if (rawSectionRecord.id === "full_file") {
        continue;
      }
      rawSectionCount++;
      for (const _page of rawSectionRecord.data.contentPages) {
        rawSectionMessagesCount++;
      }
    }

    let rawMessageCount = 0;
    for (const rawMessageRecord of messages) {
      if (rawMessageRecord.id === "messagesCount") {
        rawMessageCount = rawMessageRecord.data as number;
      }
    }

    const normalizedMessageCount = await this.getNormalizedTableCount(rulesMessages);
    const normalizedSectionCount = await this.getNormalizedTableCount(rulesSections);
    const normalizedSectionMessageCount = await this.getNormalizedTableCount(rulesSectionMessages);

    if (rawSectionCount !== normalizedSectionCount) {
      Stumper.error(
        `Raw section count ${rawSectionCount} does not match normalized section message count ${normalizedSectionMessageCount}`,
        "Rules:Migration:validate",
      );
      return false;
    }

    if (rawSectionMessagesCount !== normalizedSectionMessageCount) {
      Stumper.error(
        `Raw section message count ${rawSectionMessagesCount} does not match normalized section message count ${normalizedSectionMessageCount}`,
        "Rules:Migration:validate",
      );
      return false;
    }

    if (rawMessageCount !== normalizedMessageCount) {
      Stumper.error(
        `Raw message count ${rawMessageCount} does not match normalized message count ${normalizedMessageCount}`,
        "Rules:Migration:validate",
      );
      return false;
    }

    return true;
  }

  private async migrateMessages(): Promise<number> {
    const messages = await this.getRawTableData<IRuleMessagesRecord>("raw_ruleMessages");

    if (messages.length === 0) {
      Stumper.warning("No messages to migrate", "Rules:Migration:Messages");
      return 0;
    }

    let migratedCount = 0;

    for (const rawMessageRecord of messages) {
      if (rawMessageRecord.id !== "messages") {
        Stumper.debug(`Skipping row: ${rawMessageRecord.id}. This row is not being migrated.`, "Rules:Migration:Messages");
      }

      if (this.isStringArray(rawMessageRecord.data)) {
        Stumper.error(`Message record ${rawMessageRecord.id} is not an array of strings`, "Rules:Migration:Messages");
        return migratedCount;
      }

      const messages = rawMessageRecord.data as string[];
      let index = 0;
      for (const message of messages) {
        try {
          await this.db
            .insert(rulesMessages)
            .values({
              messageId: message,
              index: index,
            })
            .onConflictDoUpdate({
              target: rulesMessages.messageId,
              set: {
                index: index,
              },
            });
          index++;
          migratedCount++;
          Stumper.debug(`Migrated message record: ${rawMessageRecord.id}`, "Rules:Migration:Messages");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          Stumper.error(`Failed to migrate message record ${rawMessageRecord.id}: ${errorMessage}`, "Rules:Migration:Messages");
        }
      }
    }

    return migratedCount;
  }

  private async migrateSections(): Promise<number> {
    const rawSections = await this.getRawTableData<IRuleSectionsRecord>("raw_ruleSections");

    if (rawSections.length === 0) {
      Stumper.warning("No sections to migrate", "Rules:Migration:Sections");
      return 0;
    }

    let migratedCount = 0;

    for (const rawSectionRecord of rawSections) {
      if (rawSectionRecord.id === "full_file") {
        try {
          await this.db
            .insert(rulesState)
            .values({
              key: "full_file",
              value: rawSectionRecord.data as unknown as string,
            })
            .onConflictDoUpdate({
              target: rulesState.key,
              set: {
                value: rawSectionRecord.data as unknown as string,
                updatedAt: new Date(),
              },
            });
          migratedCount++;
          Stumper.debug(`Migrated state record: ${rawSectionRecord.id}`, "Rules:Migration:Sections");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          Stumper.error(`Failed to migrate state record ${rawSectionRecord.id}: ${errorMessage}`, "Rules:Migration:Sections");
        }
      } else {
        let content = "";
        for (const page of rawSectionRecord.data.contentPages) {
          content += page.content;
        }
        try {
          await this.db
            .insert(rulesSections)
            .values({
              name: rawSectionRecord.id,
              friendlyName: rawSectionRecord.data.name,
              content: content,
            })
            .onConflictDoUpdate({
              target: rulesSections.name,
              set: {
                friendlyName: rawSectionRecord.data.name,
                content: content,
              },
            });
          Stumper.debug(`Migrated section record: ${rawSectionRecord.id}`, "Rules:Migration:Sections");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          Stumper.error(`Failed to migrate section record ${rawSectionRecord.id}: ${errorMessage}`, "Rules:Migration:Sections");
        }

        try {
          await this.db
            .insert(rulesSectionMessages)
            .values({
              messageId: rawSectionRecord.data.headerMessageId,
              sectionId: rawSectionRecord.id,
              type: RulesSectionTypeEnum.HEADER,
              url: rawSectionRecord.data.headerUrl,
            })
            .onConflictDoUpdate({
              target: rulesSectionMessages.messageId,
              set: {
                sectionId: rawSectionRecord.id,
                type: RulesSectionTypeEnum.HEADER,
                url: rawSectionRecord.data.headerUrl,
                content: rawSectionRecord.data.headerMessageId,
              },
            });
          Stumper.debug(`Migrated header record: ${rawSectionRecord.id}`, "Rules:Migration:Sections");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          Stumper.error(`Failed to migrate header record ${rawSectionRecord.id}: ${errorMessage}`, "Rules:Migration:Sections");
        }
      }

      for (const page of rawSectionRecord.data.contentPages) {
        try {
          await this.db
            .insert(rulesSectionMessages)
            .values({
              messageId: page.messageId,
              sectionId: rawSectionRecord.id,
              type: RulesSectionTypeEnum.CONTENT,
              content: page.content,
            })
            .onConflictDoUpdate({
              target: rulesSectionMessages.messageId,
              set: {
                sectionId: rawSectionRecord.id,
                type: RulesSectionTypeEnum.CONTENT,
                content: page.content,
              },
            });
          migratedCount++;
          Stumper.debug(`Migrated message record: ${rawSectionRecord.id}`, "Rules:Migration:Sections");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          Stumper.error(`Failed to migrate message record ${rawSectionRecord.id}: ${errorMessage}`, "Rules:Migration:Sections");
        }
      }
    }
    return migratedCount;
  }
}
