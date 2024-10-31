import Task from "../../../common/models/Task";
import { checkForNewEmojis } from "../utils/PlayerEmojis";

export default class EmojiCheckTask extends Task {
  constructor() {
    // Run every 15th day of the month at 12:35 AM
    super("EmojiCheckTask", "0 35 0 15 * *");
  }

  protected async execute(): Promise<void> {
    await checkForNewEmojis();
  }
}
