import { EmbedBuilder } from "discord.js";
import { createBlueSkyPostEmbed } from "@modules/bluesky/utils/Embeds";
import { IPost } from "@modules/bluesky/interfaces/IPost";

describe("Embeds", () => {
  describe("createBlueSkyPostEmbed", () => {
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

    it("should create an embed with author information including display name", () => {
      const post = createMockPost();
      const embed = createBlueSkyPostEmbed(post);

      expect(embed).toBeInstanceOf(EmbedBuilder);
      const embedData = embed.data;

      expect(embedData.author?.name).toBe("Test User (@testuser.bsky.social)");
      expect(embedData.author?.icon_url).toBe("https://example.com/avatar.jpg");
      expect(embedData.author?.url).toBe("https://bsky.app/profile/testuser.bsky.social");
    });

    it("should create an embed with author handle only when no display name", () => {
      const post = createMockPost({
        author: {
          handle: "testuser.bsky.social",
          displayName: undefined,
          avatar: undefined,
        },
      });
      const embed = createBlueSkyPostEmbed(post);

      expect(embed.data.author?.name).toBe("@testuser.bsky.social");
      expect(embed.data.author?.icon_url).toBeUndefined();
    });

    it("should include post text and View on BlueSky link in description", () => {
      const post = createMockPost({ text: "Hello BlueSky!" });
      const embed = createBlueSkyPostEmbed(post);

      expect(embed.data.description).toContain("Hello BlueSky!");
      expect(embed.data.description).toContain("[View on BlueSky](https://bsky.app/profile/testuser.bsky.social/post/abc123)");
    });

    it("should show only the View on BlueSky link when post has no text", () => {
      const post = createMockPost({ text: "" });
      const embed = createBlueSkyPostEmbed(post);

      expect(embed.data.description).toBe("[View on BlueSky](https://bsky.app/profile/testuser.bsky.social/post/abc123)");
    });

    it("should truncate long text to fit within Discord embed limits", () => {
      const longText = "a".repeat(5000);
      const post = createMockPost({ text: longText });
      const embed = createBlueSkyPostEmbed(post);

      expect(embed.data.description).toBeDefined();
      expect(embed.data.description!.length).toBeLessThanOrEqual(4096);
      expect(embed.data.description).toContain("...");
      expect(embed.data.description).toContain("[View on BlueSky]");
    });

    it("should set the post creation timestamp", () => {
      const createdAt = new Date("2024-01-15T12:00:00Z");
      const post = createMockPost({ createdAt });
      const embed = createBlueSkyPostEmbed(post);

      expect(embed.data.timestamp).toBe(createdAt.toISOString());
    });

    it("should set BlueSky brand color", () => {
      const post = createMockPost();
      const embed = createBlueSkyPostEmbed(post);

      // BlueSky brand color is 0x1185fe
      expect(embed.data.color).toBe(0x1185fe);
    });

    it("should include engagement stats with emojis", () => {
      const post = createMockPost({
        likeCount: 100,
        repostCount: 50,
        replyCount: 25,
        quoteCount: 10,
      });
      const embed = createBlueSkyPostEmbed(post);

      const statsField = embed.data.fields?.find((f) => f.value.includes("❤️"));
      expect(statsField).toBeDefined();
      expect(statsField?.value).toBe("❤️ 100 · 🔁 50 · 💬 25 · 💭 10");
      expect(statsField?.inline).toBe(false);
    });

    it("should include zero engagement stats correctly", () => {
      const post = createMockPost({
        likeCount: 0,
        repostCount: 0,
        replyCount: 0,
        quoteCount: 0,
      });
      const embed = createBlueSkyPostEmbed(post);

      const statsField = embed.data.fields?.find((f) => f.value.includes("❤️"));
      expect(statsField?.value).toBe("❤️ 0 · 🔁 0 · 💬 0 · 💭 0");
    });

    describe("image handling", () => {
      it("should set image when post has one image", () => {
        const post = createMockPost({
          images: [
            {
              thumb: "https://example.com/thumb1.jpg",
              fullsize: "https://example.com/full1.jpg",
              alt: "Test image",
            },
          ],
        });
        const embed = createBlueSkyPostEmbed(post);

        expect(embed.data.image?.url).toBe("https://example.com/full1.jpg");
        expect(embed.data.footer).toBeUndefined();
      });

      it("should set image and footer when post has two images", () => {
        const post = createMockPost({
          images: [
            {
              thumb: "https://example.com/thumb1.jpg",
              fullsize: "https://example.com/full1.jpg",
              alt: "Image 1",
            },
            {
              thumb: "https://example.com/thumb2.jpg",
              fullsize: "https://example.com/full2.jpg",
              alt: "Image 2",
            },
          ],
        });
        const embed = createBlueSkyPostEmbed(post);

        expect(embed.data.image?.url).toBe("https://example.com/full1.jpg");
        expect(embed.data.footer?.text).toBe("+1 more image on BlueSky");
      });

      it("should show plural 'images' when post has more than two images", () => {
        const post = createMockPost({
          images: [
            { thumb: "https://example.com/t1.jpg", fullsize: "https://example.com/f1.jpg", alt: "" },
            { thumb: "https://example.com/t2.jpg", fullsize: "https://example.com/f2.jpg", alt: "" },
            { thumb: "https://example.com/t3.jpg", fullsize: "https://example.com/f3.jpg", alt: "" },
          ],
        });
        const embed = createBlueSkyPostEmbed(post);

        expect(embed.data.footer?.text).toBe("+2 more images on BlueSky");
      });

      it("should show correct count for four images", () => {
        const post = createMockPost({
          images: [
            { thumb: "https://example.com/t1.jpg", fullsize: "https://example.com/f1.jpg", alt: "" },
            { thumb: "https://example.com/t2.jpg", fullsize: "https://example.com/f2.jpg", alt: "" },
            { thumb: "https://example.com/t3.jpg", fullsize: "https://example.com/f3.jpg", alt: "" },
            { thumb: "https://example.com/t4.jpg", fullsize: "https://example.com/f4.jpg", alt: "" },
          ],
        });
        const embed = createBlueSkyPostEmbed(post);

        expect(embed.data.footer?.text).toBe("+3 more images on BlueSky");
      });

      it("should not set image or footer when post has no images", () => {
        const post = createMockPost({ images: [] });
        const embed = createBlueSkyPostEmbed(post);

        expect(embed.data.image).toBeUndefined();
        expect(embed.data.footer).toBeUndefined();
      });
    });
  });
});
