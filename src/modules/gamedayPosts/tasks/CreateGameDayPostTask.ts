import Task from "../../../common/models/Task.js";
import { checkForGameDay, closeAndLockOldPosts } from "../utils/GameChecker.js";

export default class CreateGameDayPostTask extends Task {
  constructor() {
    super("CreateGameDayPostTask", "0 0 0 * * *");
  }

  protected async execute(): Promise<void> {
    await checkForGameDay();
    await closeAndLockOldPosts();
  }
}
