import Stumper from "stumper";
import discord from "@common/utils/discord/discord";
import StatsVoiceChannel from "../models/StatsVoiceChannel";

export default class TotalNitroBoostersStatChannel extends StatsVoiceChannel {
  constructor() {
    super("Nitro Boosters", "Nitro Boosters");
  }

  protected override async getNewValue(): Promise<string | null> {
    const guild = discord.guilds.getGuild();

    if (!guild) {
      Stumper.error("Error finding guild", "statsVoiceChannel:TotalMembersStatChannel:update");
      return null;
    }

    const nitroBoosters = await discord.members.getNitroBoosters();

    return `${nitroBoosters.length}`;
  }
}
