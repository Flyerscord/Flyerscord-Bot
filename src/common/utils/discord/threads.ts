import Stumper from "stumper";
import { getChannel, getTextChannel } from "./channels";
import { ChannelType, MessageResolvable, PrivateThreadChannel, PublicThreadChannel, ThreadChannel } from "discord.js";

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
    Stumper.error(`Channel ${parentChannelId} not found!`, "common:channels:createPublicThread");
    return undefined;
  }

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
    Stumper.error(`Thread ${name} not created!`, "common:channels:createPublicThread");
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
    Stumper.error(`Channel ${parentChannelId} not found!`, "common:channels:createPrivateThread");
    return undefined;
  }

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
    Stumper.error(`Thread ${name} not created!`, "common:channels:createPrivateThread");
    return undefined;
  }

  return thread;
}

export async function getThread(threadId: string): Promise<ThreadChannel | undefined> {
  const channel = await getChannel(threadId);
  if (!channel) {
    Stumper.error(`Channel ${threadId} not found!`, "common:channels:getThread");
    return undefined;
  }

  if (channel instanceof ThreadChannel) {
    return channel;
  }
  Stumper.error(`Channel ${threadId} is not a thread!`, "common:channels:getThread");
  return undefined;
}

export async function archiveThread(threadId: string, reason?: string): Promise<void> {
  const thread = await getThread(threadId);
  if (!thread) {
    Stumper.error(`Thread ${threadId} not found!`, "common:channels:archiveThread");
    return;
  }

  await thread.setArchived(true, reason);
  Stumper.info(`Thread ${threadId} archived!`, "common:channels:archiveThread");
}

export async function unarchiveThread(threadId: string, reason?: string): Promise<void> {
  const thread = await getThread(threadId);
  if (!thread) {
    Stumper.error(`Thread ${threadId} not found!`, "common:channels:unarchiveThread");
    return;
  }

  await thread.setArchived(false, reason);
  Stumper.info(`Thread ${threadId} unarchived!`, "common:channels:unarchiveThread");
}

export async function lockThread(threadId: string, reason?: string): Promise<void> {
  const thread = await getThread(threadId);
  if (!thread) {
    Stumper.error(`Thread ${threadId} not found!`, "common:channels:lockThread");
    return;
  }

  await thread.setLocked(true, reason);
  Stumper.info(`Thread ${threadId} locked!`, "common:channels:lockThread");
}

export async function unlockThread(threadId: string, reason?: string): Promise<void> {
  const thread = await getThread(threadId);
  if (!thread) {
    Stumper.error(`Thread ${threadId} not found!`, "common:channels:unlockThread");
    return;
  }

  await thread.setLocked(false, reason);
  Stumper.info(`Thread ${threadId} unlocked!`, "common:channels:unlockThread");
}

export async function deleteThread(threadId: string, reason?: string): Promise<void> {
  const thread = await getThread(threadId);
  if (!thread) {
    Stumper.error(`Thread ${threadId} not found!`, "common:channels:deleteThread");
    return;
  }

  await thread.delete(reason);
  Stumper.info(`Thread ${threadId} deleted!`, "common:channels:deleteThread");
}
