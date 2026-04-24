import { ModalBuilder, ModalSubmitInteraction } from "discord.js";
import Stumper from "stumper";
import Command from "./Command";

export default abstract class ModalMenu extends Command {
  readonly data: ModalBuilder;

  readonly title: string;

  constructor(name: string, title: string) {
    super(name, true, true);
    this.title = title;

    this.data = new ModalBuilder().setCustomId(this.name).setTitle(this.title);
  }

  async run(interaction: ModalSubmitInteraction): Promise<void> {
    Stumper.info(`Running modal submit for ${this.name.split("-")[0]}`, "common:ModalMenu:run");
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

  getIdWithoutData(id: string): string {
    return id.split("-")[0];
  }

  getDataFromId(id: string): string | undefined {
    const idSplit = id.split("-");
    if (idSplit.length > 1) {
      return idSplit[1];
    }
    return undefined;
  }
}
