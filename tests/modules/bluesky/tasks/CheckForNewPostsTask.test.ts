// Mock the database BEFORE any imports
jest.mock("@common/db/db", () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        getDb: jest.fn(),
      })),
    },
  };
});

// Mock ConfigManager BEFORE imports
jest.mock("@common/managers/ConfigManager", () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        getConfig: jest.fn(() => ({
          username: "testuser.bsky.social",
          password: "testpassword",
          channelId: "123456789",
          listId: "testlistid",
        })),
      })),
    },
  };
});

// Mock Stumper logger
jest.mock("stumper", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    caughtError: jest.fn(),
  },
}));

// Mock discord utilities
jest.mock("@common/utils/discord/discord", () => ({
  messages: {
    sendEmbedToChannel: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock BlueSky
jest.mock("@modules/bluesky/utils/BlueSky");

// Mock BlueSkyDB
jest.mock("@modules/bluesky/db/BlueSkyDB");

// Mock createBlueSkyPostEmbed
jest.mock("@modules/bluesky/utils/Embeds", () => ({
  createBlueSkyPostEmbed: jest.fn().mockReturnValue({ data: { description: "test embed" } }),
}));

// Mock node-schedule
jest.mock("node-schedule", () => ({
  scheduleJob: jest.fn(),
}));

import CheckForNewPostsTask from "@modules/bluesky/tasks/CheckForNewPostsTask";
import BlueSky from "@modules/bluesky/utils/BlueSky";
import BlueSkyDB from "@modules/bluesky/db/BlueSkyDB";
import discord from "@common/utils/discord/discord";
import { createBlueSkyPostEmbed } from "@modules/bluesky/utils/Embeds";
import Stumper from "stumper";
import { IPost } from "@modules/bluesky/interfaces/IPost";
import { Singleton } from "@common/models/Singleton";

describe("CheckForNewPostsTask", () => {
  let task: CheckForNewPostsTask;
  let mockBlueSky: jest.Mocked<BlueSky>;
  let mockDb: jest.Mocked<BlueSkyDB>;

  const createMockPost = (overrides: Partial<IPost> = {}): IPost => ({
    account: "testuser.bsky.social",
    postId: "abc123",
    url: "https://bsky.app/profile/testuser.bsky.social/post/abc123",
    author: {
      handle: "testuser.bsky.social",
      displayName: "Test User",
      avatar: "https://example.com/avatar.jpg",
    },
    text: "This is a test post!",
    createdAt: new Date("2024-01-15T12:00:00Z"),
    images: [],
    likeCount: 10,
    repostCount: 5,
    replyCount: 3,
    quoteCount: 2,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instances
    // @ts-expect-error - accessing private static property for testing
    Singleton.instances = new Map();

    // Setup mock BlueSky instance
    mockBlueSky = {
      checkForNewPosts: jest.fn(),
    } as unknown as jest.Mocked<BlueSky>;

    (BlueSky.getInstance as jest.Mock).mockReturnValue(mockBlueSky);

    // Setup mock DB instance
    mockDb = {
      createAuditLog: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<BlueSkyDB>;

    (BlueSkyDB as jest.MockedClass<typeof BlueSkyDB>).mockImplementation(() => mockDb);

    // Get task instance
    task = CheckForNewPostsTask.getInstance();
  });

  describe("constructor", () => {
    it("should create task with correct name", () => {
      expect(task.getName()).toBe("CheckForNewBlueSkyPosts");
    });

    it("should create task with correct interval (every minute)", () => {
      expect(task.getInterval()).toBe("0 * * * * *");
    });
  });

  describe("execute", () => {
    it("should check for new posts and send them to Discord", async () => {
      const mockPosts = [createMockPost({ postId: "post1" }), createMockPost({ postId: "post2" })];

      mockBlueSky.checkForNewPosts.mockResolvedValue(mockPosts);

      // Call execute via protected access
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (task as any).execute();

      expect(mockBlueSky.checkForNewPosts).toHaveBeenCalled();
      expect(discord.messages.sendEmbedToChannel).toHaveBeenCalledTimes(2);
      expect(Stumper.debug).toHaveBeenCalledWith("Found 2 new posts!", "blueSky:CheckForNewPostsTask:execute");
    });

    it("should not send any messages when no new posts", async () => {
      mockBlueSky.checkForNewPosts.mockResolvedValue([]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (task as any).execute();

      expect(mockBlueSky.checkForNewPosts).toHaveBeenCalled();
      expect(discord.messages.sendEmbedToChannel).not.toHaveBeenCalled();
      expect(Stumper.debug).toHaveBeenCalledWith("Found 0 new posts!", "blueSky:CheckForNewPostsTask:execute");
    });

    it("should create audit log for each post", async () => {
      const mockPosts = [
        createMockPost({ account: "user1.bsky.social", postId: "post1" }),
        createMockPost({ account: "user2.bsky.social", postId: "post2" }),
      ];

      mockBlueSky.checkForNewPosts.mockResolvedValue(mockPosts);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (task as any).execute();

      // Audit log is called with void, so we just check it was called
      expect(mockDb.createAuditLog).toHaveBeenCalledTimes(2);
      expect(mockDb.createAuditLog).toHaveBeenCalledWith({
        action: "BlueSkyPostCreated",
        details: {
          account: "user1.bsky.social",
          postId: "post1",
        },
      });
      expect(mockDb.createAuditLog).toHaveBeenCalledWith({
        action: "BlueSkyPostCreated",
        details: {
          account: "user2.bsky.social",
          postId: "post2",
        },
      });
    });

    it("should create embed for each post", async () => {
      const mockPost = createMockPost();
      mockBlueSky.checkForNewPosts.mockResolvedValue([mockPost]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (task as any).execute();

      expect(createBlueSkyPostEmbed).toHaveBeenCalledWith(mockPost);
    });

    it("should send embed to configured channel", async () => {
      const mockPost = createMockPost();
      mockBlueSky.checkForNewPosts.mockResolvedValue([mockPost]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (task as any).execute();

      expect(discord.messages.sendEmbedToChannel).toHaveBeenCalledWith("123456789", expect.anything());
    });
  });

  describe("sendPostsToDiscord", () => {
    it("should process multiple posts in order", async () => {
      const posts = [createMockPost({ postId: "first" }), createMockPost({ postId: "second" }), createMockPost({ postId: "third" })];

      mockBlueSky.checkForNewPosts.mockResolvedValue(posts);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (task as any).execute();

      expect(discord.messages.sendEmbedToChannel).toHaveBeenCalledTimes(3);
    });

    it("should handle empty posts array", async () => {
      mockBlueSky.checkForNewPosts.mockResolvedValue([]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (task as any).execute();

      expect(discord.messages.sendEmbedToChannel).not.toHaveBeenCalled();
      expect(mockDb.createAuditLog).not.toHaveBeenCalled();
    });
  });
});
