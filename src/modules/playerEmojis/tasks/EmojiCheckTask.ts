import Task from "../../../common/models/Task";
import { checkForNewEmojis } from "../utils/PlayerEmojis";

export default class EmojiCheckTask extends Task {
  constructor() {
    // Run every 15th day of the month at midnight
    super("EmojiCheckTask", "0 0 0 15 * *");
  }

  protected async execute(): Promise<void> {
    await checkForNewEmojis();
  }
}
