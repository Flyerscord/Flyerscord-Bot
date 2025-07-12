import ConfigManager from "@common/config/ConfigManager";
import discord from "@common/utils/discord/discord";
import RulesDB from "../providers/Rules.Database";
import Stumper from "stumper";

export async function createRuleSections(): Promise<void> {
  const config = ConfigManager.getInstance().getConfig("Rules");

  const sections = config.sections;
  const channelId = config.channelId;

  for (const section of sections) {
    const sectionId = getSectionId(section);

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
  }
}

export function getSectionId(name: string): string {
  return name.toLowerCase().replaceAll(" ", "_");
}
