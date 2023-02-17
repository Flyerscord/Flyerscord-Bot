import { EmbedBuilder } from "discord.js";
import Config from "../../config/Config";

export function getVistorRoleReactEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder();

  const visitorEmoji = Config.getConfig().vistorReactRole.visitorEmoji;

  embed.setTitle("Visitor Role Selection");
  embed.setDescription(`${visitorEmoji} Get the Visitor Role (Everyone else will get the member role)`);
  embed.setColor("NotQuiteBlack");

  return embed;
}
