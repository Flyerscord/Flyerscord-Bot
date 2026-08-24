import { ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js";
import Stumper from "stumper";
import Command from "./Command";

/**
 * Base class for handling persistent button interactions, mirroring `ModalMenu`. Each handler owns
 * its own `ButtonBuilder`, built from the same customId/label/style it's constructed with, so a
 * button's appearance and its click behavior live in one place instead of being split between a
 * handler class and a separate embed-building function.
 *
 * The customId is used as-is for lookup after a bot restart. It may still follow the `"name-data"`
 * convention if a handler backs several visually distinct buttons that share one customId prefix; use
 * `getDataFromId` to recover the trailing data in that case.
 */
export default abstract class ButtonHandler extends Command {
  readonly button: ButtonBuilder;

  constructor(customId: string, label: string, style: ButtonStyle, ephemeral: boolean = true) {
    super(customId, ephemeral, true);
    this.button = new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
  }

  /**
   * Sets up replies for the interaction and defers the reply before handing off to `execute`.
   */
  async run(interaction: ButtonInteraction): Promise<void> {
    Stumper.info(`Running button click for ${this.getIdWithoutData(interaction.customId)}`, "common:ButtonHandler:run");
    this.replies.setInteraction(interaction);
    await this.replies.deferReply();
    await this.execute(interaction);
  }

  protected abstract execute(interaction: ButtonInteraction): Promise<void>;

  /**
   * Extracts the handler name portion of a `"name-data"` customId, used to look up the handler.
   */
  getIdWithoutData(id: string): string {
    return id.split("-")[0];
  }

  /**
   * Extracts the data portion of a `"name-data"` customId.
   * @returns the data segment, or undefined if the customId has no data segment
   */
  getDataFromId(id: string): string | undefined {
    const idSplit = id.split("-");
    if (idSplit.length > 1) {
      return idSplit[1];
    }
    return undefined;
  }
}
