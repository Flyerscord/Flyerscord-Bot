import Task from "../../../common/models/Task";
import { checkForGameDay, closeAndLockOldPosts } from "../utils/GameChecker";

export default class CreateGameDayPostTask extends Task {
  constructor() {
    super("CreateGameDayPostTask", "0 0 0 * * *");
  }

  protected async execute(): Promise<void> {
    await checkForGameDay();
    await closeAndLockOldPosts();
  }
}
