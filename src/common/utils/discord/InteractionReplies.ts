import { CommandInteraction } from "discord.js";
import Stumper from "stumper";

class InteractionReplies {
  private interaction: CommandInteraction;
  private ephemeral: boolean;
  readonly source: string;

  constructor(interaction: CommandInteraction, source: string, ephemeral: boolean = false) {
    this.interaction = interaction;
    this.ephemeral = ephemeral;
    this.source = source;
  }

  async deferReply(): Promise<void> {
    if (!this.interaction.deferred) {
      if (this.ephemeral) {
        await this.interaction.deferReply({ ephemeral: true });
      } else {
        await this.interaction.deferReply();
      }
    } else {
      Stumper.error(`Interaction ${this.interaction.id} is already deferred!`, this.source);
    }
  }

  async reply(content: string, makeEphemeral: boolean = false): Promise<void> {
    if (!this.interaction.deferred) {
      Stumper.error(`Interaction ${this.interaction.id} is not deferred!`, this.source);
      return;
    }

    if (this.interaction.replied) {
      Stumper.error(`Interaction ${this.interaction.id} has already replied!`, this.source);
      return;
    }

    const addEphemeral = this.ephemeral || makeEphemeral;

    if (addEphemeral) {
      await this.interaction.followUp({ content: content, ephemeral: true });
      return;
    }

    await this.interaction.editReply({ content: content });
  }

  isDeferred(): boolean {
    return this.interaction.replied;
  }

  isReplied(): boolean {
    return this.interaction.replied;
  }
}

export async function createReplies(interaction: CommandInteraction, source: string, ephemeral: boolean = false): Promise<InteractionReplies> {
  const replies = new InteractionReplies(interaction, source, ephemeral);
  await replies.deferReply();
  return replies;
}
