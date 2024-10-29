import { ForumThreadChannel, GuildForumTag } from "discord.js";
import { getForumChannel, getForumPostChannel } from "./channels";

export async function createPost(
  forumChannelId: string,
  postName: string,
  postContent: string,
  tags: GuildForumTag[],
): Promise<ForumThreadChannel | undefined> {
  const forumChannel = await getForumChannel(forumChannelId);
  if (forumChannel) {
    return await forumChannel.threads.create({
      name: postName,
      message: { content: postContent },
      reason: "Auto created post for Flyers Game Day",
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

export async function setLockPost(forumChannelId: string, postChannelId: string, locked: boolean): Promise<void> {
  const postChannel = await getForumPostChannel(forumChannelId, postChannelId);
  if (postChannel) {
    postChannel.setLocked(locked);
  }
}

export async function setClosedPost(forumChannelId: string, postChannelId: string, closed: boolean): Promise<void> {
  const postChannel = await getForumPostChannel(forumChannelId, postChannelId);
  if (postChannel) {
    postChannel.setArchived(closed);
  }
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
