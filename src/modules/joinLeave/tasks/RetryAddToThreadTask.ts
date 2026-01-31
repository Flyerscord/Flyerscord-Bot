import Task from "@common/models/Task";
import JoinLeaveDB from "../db/JoinLeaveDB";
import Stumper from "stumper";
import discord from "@common/utils/discord/discord";
import ConfigManager from "@common/managers/ConfigManager";

export default class RetryAddToThreadTask extends Task {
  constructor() {
    // Every 10 minutes
    super("RetryAddToThreadTask", "0 */10 * * * *");
  }

  protected async execute(): Promise<void> {
    const db = new JoinLeaveDB();

    const notAddedToThread = await db.getAllNotAddedToThread();

    if (notAddedToThread.length === 0) {
      return;
    }

    Stumper.info(`Retrying to add ${notAddedToThread.length} users to threads...`, "joinLeave:RetryAddToThreadTask");

    await Promise.all(
      notAddedToThread.map(async (user) => {
        if (!user.threadId) {
          Stumper.error(`User ${user.userId} does not have a thread associated with them!`, "joinLeave:RetryAddToThreadTask");
          const adminNotificationChannelId = ConfigManager.getInstance().getConfig("JoinLeave").joinLeaveAdminNotificationChannelId;
          await discord.messages.sendMessageToChannel(
            adminNotificationChannelId,
            `User ${user.userId} does not have a thread associated with them! This need to be investigated!`,
          );
          return;
        }

        const result = await discord.threads.addThreadMember(user.threadId, user.userId);

        if (result) {
          await db.setAddedToThread(user.userId, true);
          Stumper.success(`User ${user.userId} added to thread ${user.threadId}!`, "joinLeave:RetryAddToThreadTask");
        } else {
          Stumper.error(`Failed to add user ${user.userId} to thread ${user.threadId}. Will retry later...`, "joinLeave:RetryAddToThreadTask");
        }
      }),
    );

    const failedUsers = await db.getAllNotAddedToThread();
    if (failedUsers.length > 0) {
      Stumper.error(
        `Failed to add ${failedUsers.length}/${notAddedToThread.length} users to threads. Will retry later...`,
        "joinLeave:RetryAddToThreadTask",
      );
    }
  }
}
