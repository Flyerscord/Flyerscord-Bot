import { ButtonInteraction } from "discord.js";
import Stumper from "stumper";
import Command from "./Command";

/**
 * Base class for handling persistent button interactions, mirroring `ModalMenu`. The button's
 * customId is expected to follow the `"name-data"` convention, so it can be looked up by `name`
 * after a bot restart and any trailing data can be recovered with `getDataFromId`.
 */
export default abstract class ButtonHandler extends Command {
  constructor(name: string, ephemeral: boolean = true) {
    super(name, ephemeral, true);
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
