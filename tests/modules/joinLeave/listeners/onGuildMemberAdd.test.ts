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
          if (moduleName === "JoinLeave") {
            return {
              channelId: "welcome-channel-123",
              notVerifiedRoleId: "not-verified-role-456",
              captchaQuestions: [{ question: "What is 2+2?", answer: "4" }],
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
    sendMessageAndImageBufferToChannel: jest.fn().mockResolvedValue(undefined),
  },
  members: {
    getMemberJoinPosition: jest.fn().mockResolvedValue(42),
    getNumberOfMembers: jest.fn().mockResolvedValue(42),
  },
  roles: {
    addRoleToUser: jest.fn().mockResolvedValue(true),
    userHasRole: jest.fn().mockReturnValue(false),
  },
}));

// Mock Stumper logger
jest.mock("stumper", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    warning: jest.fn(),
    caughtError: jest.fn(),
  },
}));

// Mock JoinImageGenerator
jest.mock("@modules/joinLeave/utils/JoinImageGenerator", () => {
  return jest.fn().mockImplementation(() => ({
    getImage: jest.fn().mockResolvedValue(Buffer.from("fake-image-data")),
  }));
});

// Mock Captcha utility
jest.mock("@modules/joinLeave/utils/Captcha", () => ({
  sendCaptcha: jest.fn().mockResolvedValue(undefined),
}));

// Mock JoinLeaveDB
jest.mock("@modules/joinLeave/db/JoinLeaveDB");

// Mock MyAuditLog
jest.mock("@common/utils/MyAuditLog", () => ({
  __esModule: true,
  default: {
    createAuditLog: jest.fn().mockResolvedValue(undefined),
  },
}));

import onGuildMemberAdd from "@modules/joinLeave/listeners/onGuildMemberAdd";
import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import JoinImageGenerator from "@modules/joinLeave/utils/JoinImageGenerator";
import { sendCaptcha } from "@modules/joinLeave/utils/Captcha";
import JoinLeaveDB from "@modules/joinLeave/db/JoinLeaveDB";
import { GuildMember, User } from "discord.js";

describe("onGuildMemberAdd", () => {
  let mockClient: { on: jest.Mock; once: jest.Mock; emit: jest.Mock };
  let mockDb: jest.Mocked<JoinLeaveDB>;
  let eventHandler: (member: GuildMember) => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = ClientManager.getInstance().client as unknown as {
      on: jest.Mock;
      once: jest.Mock;
      emit: jest.Mock;
    };

    // Setup mock DB
    mockDb = {
      addNotVerifiedUser: jest.fn().mockResolvedValue(undefined),
      getNotVerifiedUser: jest.fn(),
      deleteNotVerifiedUser: jest.fn(),
      incrementQuestionsAnswered: jest.fn(),
      lockUser: jest.fn(),
      unlockUser: jest.fn(),
      getNotVerifiedUsers: jest.fn(),
      // Left user methods
      getLeftUser: jest.fn().mockResolvedValue(undefined),
      addLeftUser: jest.fn().mockResolvedValue(undefined),
      deleteLeftUser: jest.fn().mockResolvedValue(undefined),
      getLeftUsers: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<JoinLeaveDB>;

    (JoinLeaveDB as jest.MockedClass<typeof JoinLeaveDB>).mockImplementation(() => mockDb);

    // Register the listener
    onGuildMemberAdd();

    // Capture the event handler
    expect(mockClient.on).toHaveBeenCalledWith("guildMemberAdd", expect.any(Function));
    eventHandler = mockClient.on.mock.calls[0][1];
  });

  describe("successful member join", () => {
    it("should send welcome message and image when a member joins", async () => {
      const mockMember = {
        id: "user-123",
        displayName: "TestUser",
        user: {
          id: "user-123",
          username: "testuser",
          bot: false,
        } as User,
        displayAvatarURL: jest.fn().mockReturnValue("https://example.com/avatar.png"),
      } as unknown as GuildMember;

      await eventHandler(mockMember);

      // Should get number of members
      expect(discord.members.getNumberOfMembers).toHaveBeenCalled();

      // Should create join image
      expect(JoinImageGenerator).toHaveBeenCalledWith("TestUser", "https://example.com/avatar.png", 42);

      // Should send welcome message with image
      expect(discord.messages.sendMessageAndImageBufferToChannel).toHaveBeenCalledWith(
        "welcome-channel-123",
        expect.stringContaining("<@user-123>"),
        Buffer.from("fake-image-data"),
      );

      // Should log success
      expect(Stumper.info).toHaveBeenCalledWith(expect.stringContaining("TestUser"), "joinLeave:onGuildMemberAdd");
    });

    it("should use username when displayName is not available", async () => {
      const mockMember = {
        id: "user-123",
        displayName: null,
        user: {
          id: "user-123",
          username: "fallbackuser",
          bot: false,
        } as User,
        displayAvatarURL: jest.fn().mockReturnValue("https://example.com/avatar.png"),
      } as unknown as GuildMember;

      await eventHandler(mockMember);

      expect(JoinImageGenerator).toHaveBeenCalledWith("fallbackuser", "https://example.com/avatar.png", 42);
    });
  });

  describe("captcha verification flow", () => {
    it("should add not verified role, send captcha, and add user to database", async () => {
      const mockMember = {
        id: "user-123",
        displayName: "TestUser",
        user: {
          id: "user-123",
          username: "testuser",
          bot: false,
        } as User,
        displayAvatarURL: jest.fn().mockReturnValue("https://example.com/avatar.png"),
      } as unknown as GuildMember;

      await eventHandler(mockMember);

      // Should add not verified role
      expect(discord.roles.addRoleToUser).toHaveBeenCalledWith(mockMember, "not-verified-role-456");

      // Should send captcha
      expect(sendCaptcha).toHaveBeenCalledWith(mockMember.user);

      // Should add user to database
      expect(mockDb.addNotVerifiedUser).toHaveBeenCalledWith("user-123");
    });

    it("should retry role assignment once on failure", async () => {
      const mockMember = {
        id: "user-123",
        displayName: "TestUser",
        user: {
          id: "user-123",
          username: "testuser",
          bot: false,
        } as User,
        displayAvatarURL: jest.fn().mockReturnValue("https://example.com/avatar.png"),
      } as unknown as GuildMember;

      // First call fails, second call succeeds
      (discord.roles.addRoleToUser as jest.Mock).mockResolvedValueOnce(false).mockResolvedValueOnce(true);

      await eventHandler(mockMember);

      // Should have called addRoleToUser twice (initial + retry)
      expect(discord.roles.addRoleToUser).toHaveBeenCalledTimes(2);

      // Should log warning about retry
      expect(Stumper.warning).toHaveBeenCalledWith(expect.stringContaining("retrying"), "joinLeave:onGuildMemberAdd");

      // Should still send captcha after successful retry
      expect(sendCaptcha).toHaveBeenCalledWith(mockMember.user);
    });

    it("should rollback DB change and not send captcha when role assignment fails after retry", async () => {
      const mockMember = {
        id: "user-123",
        displayName: "TestUser",
        user: {
          id: "user-123",
          username: "testuser",
          bot: false,
        } as User,
        displayAvatarURL: jest.fn().mockReturnValue("https://example.com/avatar.png"),
      } as unknown as GuildMember;

      // Both calls fail
      (discord.roles.addRoleToUser as jest.Mock).mockResolvedValue(false);

      await eventHandler(mockMember);

      // Should have called addRoleToUser twice (initial + retry)
      expect(discord.roles.addRoleToUser).toHaveBeenCalledTimes(2);

      // Should log error
      expect(Stumper.error).toHaveBeenCalledWith(expect.stringContaining("after retry"), "joinLeave:onGuildMemberAdd");

      // Should rollback DB change
      expect(mockDb.deleteNotVerifiedUser).toHaveBeenCalledWith("user-123");

      // Should NOT send captcha
      expect(sendCaptcha).not.toHaveBeenCalled();
    });

    it("should handle errors during captcha sending", async () => {
      const mockMember = {
        id: "user-123",
        displayName: "TestUser",
        user: {
          id: "user-123",
          username: "testuser",
          bot: false,
        } as User,
        displayAvatarURL: jest.fn().mockReturnValue("https://example.com/avatar.png"),
      } as unknown as GuildMember;

      // Ensure role assignment succeeds so flow reaches sendCaptcha
      (discord.roles.addRoleToUser as jest.Mock).mockResolvedValue(true);

      const testError = new Error("Failed to send captcha");
      (sendCaptcha as jest.Mock).mockRejectedValueOnce(testError);

      await eventHandler(mockMember);

      // Should log error via caughtError
      expect(Stumper.caughtError).toHaveBeenCalledWith(testError, "joinLeave:onGuildMemberAdd");
    });

    it("should handle errors during database insertion", async () => {
      const mockMember = {
        id: "user-123",
        displayName: "TestUser",
        user: {
          id: "user-123",
          username: "testuser",
          bot: false,
        } as User,
        displayAvatarURL: jest.fn().mockReturnValue("https://example.com/avatar.png"),
      } as unknown as GuildMember;

      const testError = new Error("Database error");
      mockDb.addNotVerifiedUser.mockRejectedValueOnce(testError);

      await eventHandler(mockMember);

      // Should log error via caughtError
      expect(Stumper.caughtError).toHaveBeenCalledWith(testError, "joinLeave:onGuildMemberAdd");
    });
  });

  describe("image generation errors", () => {
    it("should return early and log error when image generation fails", async () => {
      const mockMember = {
        id: "user-123",
        displayName: "TestUser",
        user: {
          id: "user-123",
          username: "testuser",
          bot: false,
        } as User,
        displayAvatarURL: jest.fn().mockReturnValue("https://example.com/avatar.png"),
      } as unknown as GuildMember;

      const imageError = new Error("Image generation failed");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (JoinImageGenerator as any).mockImplementationOnce(() => ({
        getImage: jest.fn().mockRejectedValue(imageError),
      }));

      await eventHandler(mockMember);

      // Should log the error
      expect(Stumper.caughtError).toHaveBeenCalledWith(imageError, "joinLeave:onGuildMemberAdd");

      // Should NOT send message
      expect(discord.messages.sendMessageAndImageBufferToChannel).not.toHaveBeenCalled();

      // Should NOT proceed with captcha setup
      expect(discord.roles.addRoleToUser).not.toHaveBeenCalled();
      expect(sendCaptcha).not.toHaveBeenCalled();
      expect(mockDb.addNotVerifiedUser).not.toHaveBeenCalled();
    });
  });

  describe("message format", () => {
    it("should include user mention and welcome message", async () => {
      const mockMember = {
        id: "user-789",
        displayName: "CoolUser",
        user: {
          id: "user-789",
          username: "cooluser",
          bot: false,
        } as User,
        displayAvatarURL: jest.fn().mockReturnValue("https://example.com/avatar.png"),
      } as unknown as GuildMember;

      await eventHandler(mockMember);

      expect(discord.messages.sendMessageAndImageBufferToChannel).toHaveBeenCalledWith(
        "welcome-channel-123",
        expect.stringMatching(/<@user-789>/),
        expect.any(Buffer),
      );

      const sentMessage = (discord.messages.sendMessageAndImageBufferToChannel as jest.Mock).mock.calls[0][1];
      expect(sentMessage).toContain("Go Flyers");
    });
  });
});
