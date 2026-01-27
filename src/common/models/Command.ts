import discord from "@common/utils/discord/discord";
import type { InteractionReplies } from "@common/utils/discord/InteractionReplies";
import { CommandInteraction, ModalSubmitInteraction } from "discord.js";

export default abstract class Command {
  readonly name: string;
  protected readonly ephemeral: boolean;
  protected readonly deferReply: boolean;

  replies: InteractionReplies;

  constructor(name: string, ephemeral: boolean, deferReply: boolean) {
    this.name = name;
    this.ephemeral = ephemeral;
    this.deferReply = deferReply;

    this.replies = discord.interactions.createReplies(this.name, this.ephemeral);
  }

  protected async setupReplies(interaction: CommandInteraction | ModalSubmitInteraction): Promise<void> {
    this.replies.setInteraction(interaction);
    if (this.deferReply) {
      await this.replies.deferReply();
    }
  }
}

export interface ICommandConfig {
  ephemeral?: boolean;
  deferReply?: boolean;
}
