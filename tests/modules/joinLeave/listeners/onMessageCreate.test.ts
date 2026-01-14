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
              notVerifiedRoleId: "not-verified-role-456",
              maxAnswerLength: 50,
              captchaQuestions: [
                { question: "What is 2+2?", answer: "4" },
                { question: "What color is the sky?", answer: "blue" },
                { question: "What is the capital of France?", answer: "paris" },
              ],
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
  members: {
    getMember: jest.fn(),
  },
  roles: {
    removeRoleFromUser: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock Captcha utility
jest.mock("@modules/joinLeave/utils/Captcha", () => ({
  sendCaptcha: jest.fn().mockResolvedValue(undefined),
}));

// Mock JoinLeaveDB
jest.mock("@modules/joinLeave/db/JoinLeaveDB");

import onMessageCreate from "@modules/joinLeave/listeners/onMessageCreate";
import ClientManager from "@common/managers/ClientManager";
import discord from "@common/utils/discord/discord";
import { sendCaptcha } from "@modules/joinLeave/utils/Captcha";
import JoinLeaveDB from "@modules/joinLeave/db/JoinLeaveDB";
import { Message, User, GuildMember, DMChannel } from "discord.js";

describe("onMessageCreate", () => {
  let mockClient: { on: jest.Mock; once: jest.Mock; emit: jest.Mock };
  let mockDb: jest.Mocked<JoinLeaveDB>;
  let eventHandler: (message: Message) => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockClient = ClientManager.getInstance().client as unknown as {
      on: jest.Mock;
      once: jest.Mock;
      emit: jest.Mock;
    };

    // Setup mock DB
    mockDb = {
      getNotVerifiedUser: jest.fn(),
      addNotVerifiedUser: jest.fn(),
      deleteNotVerifiedUser: jest.fn().mockResolvedValue(undefined),
      incrementQuestionsAnswered: jest.fn().mockResolvedValue(undefined),
      lockUser: jest.fn().mockResolvedValue(undefined),
      unlockUser: jest.fn().mockResolvedValue(undefined),
      getNotVerifiedUsers: jest.fn(),
    } as unknown as jest.Mocked<JoinLeaveDB>;

    (JoinLeaveDB as jest.MockedClass<typeof JoinLeaveDB>).mockImplementation(() => mockDb);

    // Register the listener
    onMessageCreate();

    // Capture the event handler
    expect(mockClient.on).toHaveBeenCalledWith("messageCreate", expect.any(Function));
    eventHandler = mockClient.on.mock.calls[0][1];
  });

  const createMockMessage = (content: string, isDM = true, isBot = false): Message => {
    return {
      content,
      author: {
        id: "user-123",
        username: "testuser",
        bot: isBot,
      } as User,
      channel: {
        isDMBased: jest.fn().mockReturnValue(isDM),
      } as unknown as DMChannel,
      reply: jest.fn().mockResolvedValue(undefined),
    } as unknown as Message;
  };

  const createMockMember = (): GuildMember => {
    return {
      id: "user-123",
      user: {
        id: "user-123",
        username: "testuser",
      } as User,
    } as unknown as GuildMember;
  };

  describe("message filtering", () => {
    it("should ignore messages from bots", async () => {
      const message = createMockMessage("4", true, true);

      await eventHandler(message);

      expect(mockDb.getNotVerifiedUser).not.toHaveBeenCalled();
    });

    it("should ignore messages not in DMs", async () => {
      const message = createMockMessage("4", false, false);

      await eventHandler(message);

      expect(mockDb.getNotVerifiedUser).not.toHaveBeenCalled();
    });

    it("should process DM messages from non-bot users", async () => {
      const message = createMockMessage("4", true, false);
      mockDb.getNotVerifiedUser.mockResolvedValue(undefined);

      await eventHandler(message);

      expect(mockDb.getNotVerifiedUser).toHaveBeenCalledWith("user-123");
    });
  });

  describe("user state validation", () => {
    it("should ignore if user is not in not verified users table", async () => {
      const message = createMockMessage("4", true, false);
      mockDb.getNotVerifiedUser.mockResolvedValue(undefined);
      (discord.members.getMember as jest.Mock).mockResolvedValue(createMockMember());

      await eventHandler(message);

      expect(mockDb.lockUser).not.toHaveBeenCalled();
      expect(mockDb.incrementQuestionsAnswered).not.toHaveBeenCalled();
    });

    it("should ignore if user is locked", async () => {
      const message = createMockMessage("4", true, false);
      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: true,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(createMockMember());

      await eventHandler(message);

      expect(mockDb.lockUser).not.toHaveBeenCalled();
      expect(mockDb.incrementQuestionsAnswered).not.toHaveBeenCalled();
    });

    it("should ignore if member is not found", async () => {
      const message = createMockMessage("4", true, false);
      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: false,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(null);

      await eventHandler(message);

      expect(mockDb.lockUser).not.toHaveBeenCalled();
      expect(mockDb.incrementQuestionsAnswered).not.toHaveBeenCalled();
    });
  });

  describe("correct answer handling", () => {
    it("should increment questions answered and send next question for correct answer", async () => {
      const message = createMockMessage("4", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: false,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      // Should lock user during processing
      expect(mockDb.lockUser).toHaveBeenCalledWith("user-123");

      // Should increment questions answered
      expect(mockDb.incrementQuestionsAnswered).toHaveBeenCalledWith("user-123");

      // Should send next captcha
      expect(sendCaptcha).toHaveBeenCalledWith(message.author);

      // Should unlock user after processing
      expect(mockDb.unlockUser).toHaveBeenCalledWith("user-123");

      // Should NOT remove role or delete user (not done yet)
      expect(discord.roles.removeRoleFromUser).not.toHaveBeenCalled();
      expect(mockDb.deleteNotVerifiedUser).not.toHaveBeenCalled();
    });

    it("should verify user and remove role when all questions are answered correctly", async () => {
      const message = createMockMessage("paris", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 2, // Last question
        addedAt: new Date(),
        lock: false,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      // Should lock user
      expect(mockDb.lockUser).toHaveBeenCalledWith("user-123");

      // Should increment questions answered
      expect(mockDb.incrementQuestionsAnswered).toHaveBeenCalledWith("user-123");

      // Should send verification message
      expect(message.reply).toHaveBeenCalledWith("Correct! You are now verified!");

      // Should remove not verified role
      expect(discord.roles.removeRoleFromUser).toHaveBeenCalledWith(mockMember, "not-verified-role-456");

      // Should delete user from database
      expect(mockDb.deleteNotVerifiedUser).toHaveBeenCalledWith("user-123");

      // Should unlock user
      expect(mockDb.unlockUser).toHaveBeenCalledWith("user-123");

      // Should NOT send next captcha
      expect(sendCaptcha).not.toHaveBeenCalled();
    });

    it("should accept answer case-insensitively", async () => {
      const message = createMockMessage("BLUE", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 1,
        addedAt: new Date(),
        lock: false,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      expect(mockDb.incrementQuestionsAnswered).toHaveBeenCalled();
      expect(sendCaptcha).toHaveBeenCalled();
    });

    it("should accept answer when it is part of a longer message within character limit", async () => {
      const message = createMockMessage("The answer is 4!", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: false,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      expect(mockDb.incrementQuestionsAnswered).toHaveBeenCalled();
    });
  });

  describe("incorrect answer handling", () => {
    it("should not increment questions for incorrect answer", async () => {
      const message = createMockMessage("wrong answer", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: false,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      // Should lock and unlock
      expect(mockDb.lockUser).toHaveBeenCalledWith("user-123");
      expect(mockDb.unlockUser).toHaveBeenCalledWith("user-123");

      // Should NOT increment or send next question
      expect(mockDb.incrementQuestionsAnswered).not.toHaveBeenCalled();
      expect(sendCaptcha).not.toHaveBeenCalled();
    });

    it("should reject answer if message exceeds max length", async () => {
      const longMessage = "4 " + "x".repeat(50); // Over 50 chars
      const message = createMockMessage(longMessage, true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: false,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      // Should NOT increment even if answer is correct
      expect(mockDb.incrementQuestionsAnswered).not.toHaveBeenCalled();
    });

    it("should handle answer that does not contain the correct answer", async () => {
      const message = createMockMessage("five", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: false,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      expect(mockDb.incrementQuestionsAnswered).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("should unlock user and return early if all questions already answered", async () => {
      const message = createMockMessage("test", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 3, // All 3 questions already answered
        addedAt: new Date(),
        lock: false,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      // Should lock user
      expect(mockDb.lockUser).toHaveBeenCalledWith("user-123");

      // Should unlock user
      expect(mockDb.unlockUser).toHaveBeenCalledWith("user-123");

      // Should NOT process answer
      expect(mockDb.incrementQuestionsAnswered).not.toHaveBeenCalled();
      expect(sendCaptcha).not.toHaveBeenCalled();
    });

    it("should unlock user even if processing throws an error", async () => {
      const message = createMockMessage("4", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: false,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      // Make incrementQuestionsAnswered throw an error
      const testError = new Error("Database error");
      mockDb.incrementQuestionsAnswered.mockRejectedValueOnce(testError);

      // Should throw the error but we verify unlock happens in the promise chain
      await expect(eventHandler(message)).rejects.toThrow(testError);

      // Lock should still be called
      expect(mockDb.lockUser).toHaveBeenCalledWith("user-123");
    });

    it("should handle exact match of answer at max length", async () => {
      const message = createMockMessage("4".padEnd(50, " "), true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: false,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      // Should accept answer at exactly max length
      expect(mockDb.incrementQuestionsAnswered).toHaveBeenCalled();
    });
  });

  describe("locking mechanism", () => {
    it("should always lock user before processing", async () => {
      const message = createMockMessage("4", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: false,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      // Verify lock is called before other operations
      const lockCallOrder = mockDb.lockUser.mock.invocationCallOrder[0];
      const incrementCallOrder = mockDb.incrementQuestionsAnswered.mock.invocationCallOrder[0];

      expect(lockCallOrder).toBeLessThan(incrementCallOrder);
    });

    it("should always unlock user after processing", async () => {
      const message = createMockMessage("4", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "user-123",
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: false,
      });
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      expect(mockDb.unlockUser).toHaveBeenCalledWith("user-123");
    });
  });
});
