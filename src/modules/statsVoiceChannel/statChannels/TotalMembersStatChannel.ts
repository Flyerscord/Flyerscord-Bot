import discord from "../../../common/utils/discord/discord";
import StatsVoiceChannel from "../models/StatsVoiceChannel";
import Stumper from "stumper";

export default class TotalMembersStatChannel extends StatsVoiceChannel {
  constructor() {
    super("Total Members", "Total Members");
  }

  protected override async getNewValue(): Promise<string | null> {
    const guild = await discord.guilds.getGuild();

    if (!guild) {
      Stumper.error("Error finding guild", "statsVoiceChannel:TotalMembersStatChannel:update");
      return null;
    }

    const totalMembers = guild.memberCount;

    return `${this.getShortedNumber(totalMembers)}`;
  }

  private getShortedNumber(num: number): string {
    if (num < 1000) {
      return num.toString();
    } else if (num < 1000000) {
      const wholeNumber = Math.floor(num / 1000);
      const remainder = num % 1000;
      return `${wholeNumber}.${remainder.toString().slice(0, 2)}K`;
    } else {
      const wholeNumber = Math.floor(num / 1000000);
      const remainder = num % 1000000;
      return `${wholeNumber}.${remainder.toString().slice(0, 2)}M`;
    }
  }
}
