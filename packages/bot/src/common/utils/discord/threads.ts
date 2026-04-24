import Stumper from "stumper";
import { getChannel, getTextChannel } from "./channels";
import { ChannelType, DiscordAPIError, MessageResolvable, PrivateThreadChannel, PublicThreadChannel, ThreadChannel } from "discord.js";

interface ICreateThreadOptions {
  autoArchiveDuration?: 60 | 1440 | 4320 | 10080;
  reason?: string;
  invitable?: boolean;
  startMessage?: MessageResolvable;
  rateLimitPerUser?: number;
}

export async function createPublicThread(
  parentChannelId: string,
  name: string,
  {
    autoArchiveDuration = undefined,
    reason = "Created by Flyerscord Bot",
    invitable = true,
    startMessage = undefined,
    rateLimitPerUser = undefined,
  }: ICreateThreadOptions = {},
): Promise<PublicThreadChannel | undefined> {
  const channel = await getTextChannel(parentChannelId);
  if (!channel) {
    Stumper.error(`Channel ${parentChannelId} not found!`, "common:threads:createPublicThread");
    return undefined;
  }

  Stumper.info(`Creating public thread ${name} in channel ${parentChannelId}`, "common:threads:createPublicThread");
  const thread = (await channel.threads.create({
    name,
    type: ChannelType.PublicThread,
    autoArchiveDuration,
    reason,
    invitable,
    startMessage,
    rateLimitPerUser,
  })) as PublicThreadChannel;

  if (!thread) {
    Stumper.error(`Thread ${name} not created!`, "common:threads:createPublicThread");
    return undefined;
  }

  return thread;
}

export async function createPrivateThread(
  parentChannelId: string,
  name: string,
  {
    autoArchiveDuration = undefined,
    reason = "Created by Flyerscord Bot",
    invitable = false,
    startMessage = undefined,
    rateLimitPerUser = undefined,
  }: ICreateThreadOptions = {},
): Promise<PrivateThreadChannel | undefined> {
  const channel = await getTextChannel(parentChannelId);
  if (!channel) {
    Stumper.error(`Channel ${parentChannelId} not found!`, "common:threads:createPrivateThread");
    return undefined;
  }

  Stumper.info(`Creating private thread ${name} in channel ${parentChannelId}`, "common:threads:createPrivateThread");
  const thread = (await channel.threads.create({
    name,
    type: ChannelType.PrivateThread,
    autoArchiveDuration,
    reason,
    invitable,
    startMessage,
    rateLimitPerUser,
  })) as PrivateThreadChannel;

  if (!thread) {
    Stumper.error(`Thread ${name} not created!`, "common:threads:createPrivateThread");
    return undefined;
  }

  return thread;
}

export async function getThread(threadId: string): Promise<ThreadChannel | undefined> {
  const channel = await getChannel(threadId);
  if (!channel) {
    Stumper.error(`Channel ${threadId} not found!`, "common:threads:getThread");
    return undefined;
  }

  if (channel instanceof ThreadChannel) {
    return channel;
  }
  Stumper.error(`Channel ${threadId} is not a thread!`, "common:threads:getThread");
  return undefined;
}

export async function archiveThread(threadId: string, reason?: string): Promise<void> {
  const thread = await getThread(threadId);
  if (!thread) {
    Stumper.error(`Thread ${threadId} not found!`, "common:threads:archiveThread");
    return;
  }

  await thread.setArchived(true, reason);
  Stumper.info(`Thread ${threadId} archived!`, "common:threads:archiveThread");
}

export async function unarchiveThread(threadId: string, reason?: string): Promise<void> {
  const thread = await getThread(threadId);
  if (!thread) {
    Stumper.error(`Thread ${threadId} not found!`, "common:threads:unarchiveThread");
    return;
  }

  await thread.setArchived(false, reason);
  Stumper.info(`Thread ${threadId} unarchived!`, "common:threads:unarchiveThread");
}

export async function lockThread(threadId: string, reason?: string): Promise<void> {
  const thread = await getThread(threadId);
  if (!thread) {
    Stumper.error(`Thread ${threadId} not found!`, "common:threads:lockThread");
    return;
  }

  await thread.setLocked(true, reason);
  Stumper.info(`Thread ${threadId} locked!`, "common:threads:lockThread");
}

export async function unlockThread(threadId: string, reason?: string): Promise<void> {
  const thread = await getThread(threadId);
  if (!thread) {
    Stumper.error(`Thread ${threadId} not found!`, "common:threads:unlockThread");
    return;
  }

  await thread.setLocked(false, reason);
  Stumper.info(`Thread ${threadId} unlocked!`, "common:threads:unlockThread");
}

export async function deleteThread(threadId: string, reason?: string): Promise<void> {
  const thread = await getThread(threadId);
  if (!thread) {
    Stumper.error(`Thread ${threadId} not found!`, "common:threads:deleteThread");
    return;
  }

  await thread.delete(reason);
  Stumper.info(`Thread ${threadId} deleted!`, "common:threads:deleteThread");
}

export async function addThreadMember(threadId: string, userId: string): Promise<boolean> {
  const thread = await getThread(threadId);
  if (!thread) {
    Stumper.error(`Thread ${threadId} not found!`, "common:threads:addThreadMember");
    return false;
  }
  try {
    await thread.members.add(userId);
    Stumper.info(`Member ${userId} added to thread ${threadId}!`, "common:threads:addThreadMember");
  } catch (error) {
    if (error instanceof DiscordAPIError && error.code == 50001) {
      Stumper.error(`Missing Access! Member ${userId} not added to thread ${threadId}!`, "common:threads:addThreadMember");
    } else {
      Stumper.caughtError(error, "common:threads:addThreadMember");
    }
    return false;
  }
  return true;
}

export async function removeThreadMember(threadId: string, userId: string): Promise<void> {
  const thread = await getThread(threadId);
  if (!thread) {
    Stumper.error(`Thread ${threadId} not found!`, "common:threads:removeThreadMember");
    return;
  }

  await thread.members.remove(userId);
  Stumper.info(`Member ${userId} removed from thread ${threadId}!`, "common:threads:removeThreadMember");
}
