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

// Mock ConfigManager
jest.mock("@common/managers/ConfigManager", () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        getConfig: jest.fn((moduleName: string) => {
          if (moduleName === "Admin") {
            return {
              "ub3rBot.userId": "ub3r-bot-123",
              "ub3rBot.alertChannelId": "alert-channel-456",
            };
          }
          return {};
        }),
      })),
    },
  };
});

// Mock ClientManager
jest.mock("@common/managers/ClientManager", () => {
  const mockClient = {
    on: jest.fn(),
    once: jest.fn(),
    emit: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        client: mockClient,
      })),
    },
  };
});

// Mock discord utilities
jest.mock("@common/utils/discord/discord", () => ({
  messages: {
    sendMessageToChannel: jest.fn().mockResolvedValue(undefined),
  },
  members: {
    getMember: jest.fn(),
  },
}));

// Mock Stumper logger
jest.mock("stumper", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    caughtError: jest.fn(),
  },
}));

import onMessageCreate from "@modules/admin/listeners/onMessageCreate";
import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import { Message, User, GuildMember } from "discord.js";

describe("onMessageCreate - Admin listener", () => {
  let mockClient: { on: jest.Mock; once: jest.Mock; emit: jest.Mock };
  let eventHandler: (message: Message) => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = ClientManager.getInstance().client as unknown as {
      on: jest.Mock;
      once: jest.Mock;
      emit: jest.Mock;
    };

    // Register the listener
    onMessageCreate();

    // Capture the event handler
    expect(mockClient.on).toHaveBeenCalledWith("messageCreate", expect.any(Function));
    eventHandler = mockClient.on.mock.calls[0][1];
  });

  describe("quote creation detection", () => {
    it("should detect quote creation message and send alert", async () => {
      const mockCreator = {
        displayName: "TestUser",
        user: { username: "testuser" },
      } as unknown as GuildMember;

      (discord.members.getMember as jest.Mock).mockResolvedValue(mockCreator);

      const mockMessage = {
        author: {
          id: "ub3r-bot-123",
          bot: true,
        } as User,
        content: "New quote added by user-creator-789 as #42 (https://discordapp.com/channels/123/456/789)",
        url: "https://discord.com/channels/123/456/999",
      } as unknown as Message;

      await eventHandler(mockMessage);

      // Should look up the creator
      expect(discord.members.getMember).toHaveBeenCalledWith("user-creator-789");

      // Should log the detection
      expect(Stumper.info).toHaveBeenCalledWith("Quote creation detected!", "Admin:onMessageCreate:checkForQuoteCreation");

      // Should send alert to channel
      expect(discord.messages.sendMessageToChannel).toHaveBeenCalledWith(
        "alert-channel-456",
        expect.stringContaining("New quote #42 added by TestUser"),
      );
      expect(discord.messages.sendMessageToChannel).toHaveBeenCalledWith("alert-channel-456", expect.stringContaining("user-creator-789"));
      expect(discord.messages.sendMessageToChannel).toHaveBeenCalledWith(
        "alert-channel-456",
        expect.stringContaining("https://discordapp.com/channels/123/456/789"),
      );
    });

    it("should use 'Unknown' when creator cannot be found", async () => {
      (discord.members.getMember as jest.Mock).mockResolvedValue(null);

      const mockMessage = {
        author: {
          id: "ub3r-bot-123",
          bot: true,
        } as User,
        content: "New quote added by unknown-user as #99 (https://discordapp.com/channels/111/222/333)",
        url: "https://discord.com/channels/111/222/444",
      } as unknown as Message;

      await eventHandler(mockMessage);

      // Should log error for not finding user
      expect(Stumper.error).toHaveBeenCalledWith("Could not find user with id unknown-user", "Admin:onMessageCreate:checkForQuoteCreation");

      // Should still send alert with "Unknown" creator
      expect(discord.messages.sendMessageToChannel).toHaveBeenCalledWith("alert-channel-456", expect.stringContaining("Unknown"));
    });

    it("should use username when displayName is not available", async () => {
      const mockCreator = {
        displayName: null,
        user: { username: "fallbackUsername" },
      } as unknown as GuildMember;

      (discord.members.getMember as jest.Mock).mockResolvedValue(mockCreator);

      const mockMessage = {
        author: {
          id: "ub3r-bot-123",
          bot: true,
        } as User,
        content: "New quote added by creator-id as #1 (https://discordapp.com/channels/1/2/3)",
        url: "https://discord.com/channels/1/2/4",
      } as unknown as Message;

      await eventHandler(mockMessage);

      expect(discord.messages.sendMessageToChannel).toHaveBeenCalledWith("alert-channel-456", expect.stringContaining("fallbackUsername"));
    });
  });

  describe("message filtering", () => {
    it("should ignore messages from non-bot users", async () => {
      const mockMessage = {
        author: {
          id: "some-user-123",
          bot: false,
        } as User,
        content: "New quote added by creator as #1 (https://discordapp.com/channels/1/2/3)",
      } as unknown as Message;

      await eventHandler(mockMessage);

      expect(discord.members.getMember).not.toHaveBeenCalled();
      expect(discord.messages.sendMessageToChannel).not.toHaveBeenCalled();
    });

    it("should ignore messages from bots that are not ub3rBot", async () => {
      const mockMessage = {
        author: {
          id: "other-bot-456",
          bot: true,
        } as User,
        content: "New quote added by creator as #1 (https://discordapp.com/channels/1/2/3)",
      } as unknown as Message;

      await eventHandler(mockMessage);

      expect(discord.members.getMember).not.toHaveBeenCalled();
      expect(discord.messages.sendMessageToChannel).not.toHaveBeenCalled();
    });

    it("should ignore ub3rBot messages that don't match the quote pattern", async () => {
      const mockMessage = {
        author: {
          id: "ub3r-bot-123",
          bot: true,
        } as User,
        content: "Some other message that is not a quote creation",
      } as unknown as Message;

      await eventHandler(mockMessage);

      expect(discord.members.getMember).not.toHaveBeenCalled();
      expect(discord.messages.sendMessageToChannel).not.toHaveBeenCalled();
    });

    it("should ignore messages with partial quote format", async () => {
      const mockMessage = {
        author: {
          id: "ub3r-bot-123",
          bot: true,
        } as User,
        content: "New quote added by creator as #1",
      } as unknown as Message;

      await eventHandler(mockMessage);

      expect(discord.members.getMember).not.toHaveBeenCalled();
      expect(discord.messages.sendMessageToChannel).not.toHaveBeenCalled();
    });
  });

  describe("alert message format", () => {
    it("should include all required information in alert message", async () => {
      const mockCreator = {
        displayName: "QuoteCreator",
        user: { username: "quotecreator" },
      } as unknown as GuildMember;

      (discord.members.getMember as jest.Mock).mockResolvedValue(mockCreator);

      const mockMessage = {
        author: {
          id: "ub3r-bot-123",
          bot: true,
        } as User,
        content: "New quote added by user-abc as #123 (https://discordapp.com/channels/guild/channel/quoted)",
        url: "https://discord.com/channels/guild/channel/quote-msg",
      } as unknown as Message;

      await eventHandler(mockMessage);

      const sentMessage = (discord.messages.sendMessageToChannel as jest.Mock).mock.calls[0][1];

      expect(sentMessage).toContain("New quote #123");
      expect(sentMessage).toContain("QuoteCreator");
      expect(sentMessage).toContain("user-abc");
      expect(sentMessage).toContain("https://discordapp.com/channels/guild/channel/quoted");
      expect(sentMessage).toContain("https://discord.com/channels/guild/channel/quote-msg");
    });
  });
});
