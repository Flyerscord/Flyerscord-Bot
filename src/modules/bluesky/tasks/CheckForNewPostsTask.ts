import Stumper from "stumper";
import Task from "../../../common/models/Task";
import BlueSky from "../utils/BlueSky";

export default class CheckForNewPostsTask extends Task {
  constructor() {
    // Run every minute
    super("CheckForNewBlueSkyPosts", "0 * * * * *");
  }

  protected async execute(): Promise<void> {
    const bk = BlueSky.getInstance();

    const posts = await bk.checkForNewPosts();

    Stumper.debug(`Found ${posts.length} new posts!`, "blueSky:CheckForNewPostsTask:execute");
  }
}
