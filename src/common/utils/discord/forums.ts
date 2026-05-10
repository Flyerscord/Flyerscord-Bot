import { ForumThreadChannel, GuildForumTag, GuildForumThreadMessageCreateOptions, MessagePayload } from "discord.js";
import { getForumChannel, getForumPostChannel } from "./channels";

export async function createPost(
  forumChannelId: string,
  postName: string,
  postContent: GuildForumThreadMessageCreateOptions | MessagePayload,
  tags: GuildForumTag[],
  reason: string = "",
): Promise<ForumThreadChannel | undefined> {
  const forumChannel = await getForumChannel(forumChannelId);
  if (forumChannel) {
    return await forumChannel.threads.create({
      name: postName,
      message: postContent,
      reason: reason,
      appliedTags: tags.map((tag) => tag.id),
    });
  }
  return undefined;
}

export async function getAvailableTags(forumChannelId: string): Promise<GuildForumTag[]> {
  const forumChannel = await getForumChannel(forumChannelId);
  if (forumChannel) {
    return forumChannel.availableTags;
  }
  return [];
}

export async function setLockPost(forumChannelId: string, postChannelId: string, locked: boolean): Promise<boolean> {
  const postChannel = await getForumPostChannel(forumChannelId, postChannelId);
  if (postChannel) {
    await postChannel.setLocked(locked);
    return true;
  }
  return false;
}

export async function setClosedPost(forumChannelId: string, postChannelId: string, closed: boolean): Promise<boolean> {
  const postChannel = await getForumPostChannel(forumChannelId, postChannelId);
  if (postChannel) {
    await postChannel.setArchived(closed);
    return true;
  }
  return false;
}

export async function isClosed(forumChannelId: string, postChannelId: string): Promise<boolean> {
  const postChannel = await getForumPostChannel(forumChannelId, postChannelId);
  if (postChannel) {
    return postChannel.archived || false;
  }
  return false;
}

export async function isLocked(forumChannelId: string, postChannelId: string): Promise<boolean> {
  const postChannel = await getForumPostChannel(forumChannelId, postChannelId);
  if (postChannel) {
    return postChannel.locked || false;
  }
  return false;
}

export async function pinPost(forumChannelId: string, postChannelId: string): Promise<boolean> {
  const postChannel = await getForumPostChannel(forumChannelId, postChannelId);
  if (postChannel) {
    await postChannel.pin();
    return true;
  }
  return false;
}
