import Task from "../../../common/models/Task";
import { closeAndLockOldPosts } from "../utils/GameChecker";

export default class CloseAndLockPostsTask extends Task {
  constructor() {
    // Run every day at 4:30 AM
    super("CloseAndLockPostsTask", "0 30 4 * * *");
  }

  protected async execute(): Promise<void> {
    await closeAndLockOldPosts();
  }
}
