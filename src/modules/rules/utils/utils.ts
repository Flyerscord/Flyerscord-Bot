import ConfigManager from "@common/config/ConfigManager";
import discord from "@common/utils/discord/discord";
import RulesDB from "../providers/Rules.Database";
import Stumper from "stumper";

export async function createRuleSections(useDefaults: boolean = true): Promise<void> {
  const config = ConfigManager.getInstance().getConfig("Rules");

  const sections = config.sections;
  const channelId = config.channelId;

  for (const section of sections) {
    const sectionId = getSectionId(section);

    if (useDefaults) {
      const headerContent = `${section} header placeholder`;
      const headerMessage = await discord.messages.sendMessageToChannel(channelId, headerContent);
      if (!headerMessage) {
        Stumper.error(`Failed to send placeholder header message to channel ${channelId}`, "rules:createRuleSections");
        return;
      }

      const contentContent = `${section} content placeholder`;
      const contentMessage = await discord.messages.sendMessageToChannel(channelId, contentContent);
      if (!contentMessage) {
        Stumper.error(`Failed to send placeholder content message to channel ${channelId}`, "rules:createRuleSections");
        return;
      }

      const db = RulesDB.getInstance();
      db.addSection(sectionId, headerMessage.id, contentMessage.id, headerContent, contentContent);
    } else {
      const db = RulesDB.getInstance();
      const sectionInfo = db.getSection(sectionId);
      if (!sectionInfo) {
        Stumper.error(`Section ${sectionId} not found!`, "rules:createRuleSections");
        return;
      }

      const headerMessage = await discord.messages.sendMessageToChannel(channelId, sectionInfo.header);
      if (!headerMessage) {
        Stumper.error(`Failed to send header message to channel ${channelId}`, "rules:createRuleSections");
        return;
      }
      db.setSectionHeaderId(sectionId, headerMessage.id);

      const contentMessage = await discord.messages.sendMessageToChannel(channelId, sectionInfo.content);
      if (!contentMessage) {
        Stumper.error(`Failed to send content message to channel ${channelId}`, "rules:createRuleSections");
        return;
      }
      db.setSectionContentId(sectionId, contentMessage.id);
    }
  }
}

export function getSectionId(name: string): string {
  return name.toLowerCase().replaceAll(" ", "_");
}
