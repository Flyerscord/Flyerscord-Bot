import { ForumThreadChannel, GuildForumTag } from "discord.js";
import { getForumChannel, getForumPostChannel } from "./channels.js";

export async function createPost(
  forumChannelId: string,
  postName: string,
  postContent: string,
  tags: GuildForumTag[],
): Promise<ForumThreadChannel | undefined> {
  const forumChannel = getForumChannel(forumChannelId);
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

export function getAvailableTags(forumChannelId: string): Array<GuildForumTag> {
  const forumChannel = getForumChannel(forumChannelId);
  if (forumChannel) {
    forumChannel.availableTags;
  }
  return [];
}

export function setLockPost(forumChannelId: string, postChannelId: string, locked: boolean): void {
  const postChannel = getForumPostChannel(forumChannelId, postChannelId);
  if (postChannel) {
    postChannel.setLocked(locked);
  }
}

export function setClosedPost(forumChannelId: string, postChannelId: string, closed: boolean): void {
  const postChannel = getForumPostChannel(forumChannelId, postChannelId);
  if (postChannel) {
    postChannel.setArchived(closed);
  }
}

export function isClosed(forumChannelId: string, postChannelId: string): boolean {
  const postChannel = getForumPostChannel(forumChannelId, postChannelId);
  if (postChannel) {
    return postChannel.archived || false;
  }
  return false;
}

export function isLocked(forumChannelId: string, postChannelId: string): boolean {
  const postChannel = getForumPostChannel(forumChannelId, postChannelId);
  if (postChannel) {
    return postChannel.locked || false;
  }
  return false;
}
