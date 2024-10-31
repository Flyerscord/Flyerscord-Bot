import { ModalBuilder, ModalSubmitInteraction } from "discord.js";

export default abstract class ModalMenu {
  readonly data: ModalBuilder;

  readonly id: string;
  readonly title: string;

  constructor(id: string, title: string) {
    this.id = id;
    this.title = title;

    this.data = new ModalBuilder().setCustomId(this.id).setTitle(this.title);
  }

  abstract execute(interaction: ModalSubmitInteraction): Promise<void>;

  getModal(): ModalBuilder {
    return this.data;
  }

  protected getTextInputValue(interaction: ModalSubmitInteraction, customId: string): string {
    return interaction.fields.getTextInputValue(customId);
  }
}
