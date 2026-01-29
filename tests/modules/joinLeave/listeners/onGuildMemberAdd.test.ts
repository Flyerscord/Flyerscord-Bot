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
              joinLeaveAdminNotificationChannelId: "admin-channel-789",
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
  roles: {
    addRoleToUser: jest.fn().mockResolvedValue(true),
  },
  messages: {
    sendMessageToChannel: jest.fn().mockResolvedValue(undefined),
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
    it("should log info message when a member joins", async () => {
      const mockMember = {
        id: "user-123",
        displayName: "TestUser",
        user: {
          id: "user-123",
          username: "testuser",
          bot: false,
        } as User,
      } as unknown as GuildMember;

      await eventHandler(mockMember);

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
      } as unknown as GuildMember;

      await eventHandler(mockMember);

      // Should log with fallback username
      expect(Stumper.info).toHaveBeenCalledWith(expect.stringContaining("fallbackuser"), "joinLeave:onGuildMemberAdd");
    });
  });

  describe("captcha verification flow", () => {
    it("should add not verified role and add user to database", async () => {
      const mockMember = {
        id: "user-123",
        displayName: "TestUser",
        user: {
          id: "user-123",
          username: "testuser",
          bot: false,
        } as User,
      } as unknown as GuildMember;

      await eventHandler(mockMember);

      // Should add not verified role
      expect(discord.roles.addRoleToUser).toHaveBeenCalledWith(mockMember, "not-verified-role-456");

      // Should add user to database
      expect(mockDb.addNotVerifiedUser).toHaveBeenCalledWith("user-123");
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
      } as unknown as GuildMember;

      const testError = new Error("Database error");
      mockDb.addNotVerifiedUser.mockRejectedValueOnce(testError);

      await eventHandler(mockMember);

      // Should log error via caughtError
      expect(Stumper.caughtError).toHaveBeenCalledWith(testError, "joinLeave:onGuildMemberAdd");
    });
  });

  describe("left user handling", () => {
    it("should retrieve left user data when user rejoins", async () => {
      const mockMember = {
        id: "user-123",
        displayName: "TestUser",
        user: {
          id: "user-123",
          username: "testuser",
          bot: false,
        } as User,
      } as unknown as GuildMember;

      mockDb.getLeftUser.mockResolvedValue({
        userId: "user-123",
        roles: ["role-1", "role-2"],
        leftAt: new Date(),
      });

      await eventHandler(mockMember);

      // Should check for left user
      expect(mockDb.getLeftUser).toHaveBeenCalledWith("user-123");
    });
  });
});
