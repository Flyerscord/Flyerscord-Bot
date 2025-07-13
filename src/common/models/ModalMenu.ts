import { InteractionReplies } from "@common/utils/discord/InteractionReplies";
import { ModalBuilder, ModalSubmitInteraction } from "discord.js";
import Stumper from "stumper";
import discord from "@common/utils/discord/discord";

export default abstract class ModalMenu {
  readonly data: ModalBuilder;

  readonly id: string;
  readonly title: string;

  replies: InteractionReplies;

  constructor(id: string, title: string) {
    this.id = id;
    this.title = title;

    this.replies = discord.interactions.createReplies(this.id, true);

    this.data = new ModalBuilder().setCustomId(this.id).setTitle(this.title);
  }

  async run(interaction: ModalSubmitInteraction): Promise<void> {
    Stumper.info(`Running modal submit for ${this.id}`, "common:ModalMenu:run");
    this.replies.setInteraction(interaction);
    await this.replies.deferReply();
    await this.execute(interaction);
  }

  protected abstract execute(interaction: ModalSubmitInteraction): Promise<void>;

  getModal(): ModalBuilder {
    return this.data;
  }

  protected getTextInputValue(interaction: ModalSubmitInteraction, customId: string): string {
    return interaction.fields.getTextInputValue(customId);
  }
}
