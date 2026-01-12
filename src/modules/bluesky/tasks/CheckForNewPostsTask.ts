import Stumper from "stumper";
import Task from "@common/models/Task";
import BlueSky from "../utils/BlueSky";
import { IPost } from "../interfaces/IPost";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";
import BlueSkyDB from "../db/BlueSkyDB";

export default class CheckForNewPostsTask extends Task {
  constructor() {
    // Run every minute
    super("CheckForNewBlueSkyPosts", "0 * * * * *");
  }

  protected async execute(): Promise<void> {
    const bk = BlueSky.getInstance();

    const posts = await bk.checkForNewPosts();
    await this.sendPostsToDiscord(posts);

    Stumper.debug(`Found ${posts.length} new posts!`, "blueSky:CheckForNewPostsTask:execute");
  }

  private async sendPostsToDiscord(posts: IPost[]): Promise<void> {
    const db = new BlueSkyDB();

    for (const post of posts) {
      void db.createAuditLog({
        action: "BlueSkyPostCreated",
        details: {
          account: post.account,
          postId: post.postId,
        },
      });

      const message = `[Post Link](${post.url})`;
      await discord.messages.sendMessageToChannel(ConfigManager.getInstance().getConfig("BlueSky").channelId, message);
    }
  }
}
