import discord from "@common/utils/discord/discord";
import type { InteractionReplies } from "@common/utils/discord/InteractionReplies";
import { ButtonInteraction, CommandInteraction, ModalSubmitInteraction } from "discord.js";

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

  /**
   * Binds `interaction` to `this.replies` for the duration of `callback`, scoped to the current async
   * context, then defers the reply if this command is configured to. Scoping the interaction per call
   * (instead of storing it on a shared field) keeps overlapping invocations of the same singleton
   * handler from clobbering each other's interaction.
   * @param interaction - The interaction to bind
   * @param callback - The work to run with the interaction bound, typically `() => this.execute(interaction)`
   */
  protected async setupReplies<T>(
    interaction: CommandInteraction | ModalSubmitInteraction | ButtonInteraction,
    callback: () => Promise<T>,
  ): Promise<T> {
    return this.replies.run(interaction, async () => {
      if (this.deferReply) {
        await this.replies.deferReply();
      }
      return await callback();
    });
  }
}

export interface ICommandConfig {
  ephemeral?: boolean;
  deferReply?: boolean;
}
