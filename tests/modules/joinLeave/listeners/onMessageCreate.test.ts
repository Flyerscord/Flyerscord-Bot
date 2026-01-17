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
              incorrectAnswersTimeout: 3600, // 1 hour in seconds
              maxIncorrectAnswers: 3,
              maxTimeOuts: 2,
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
    banUser: jest.fn().mockResolvedValue(undefined),
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
      // New methods for timeout and incorrect answer tracking
      getTimeout: jest.fn().mockResolvedValue(undefined),
      startTimeout: jest.fn().mockResolvedValue(undefined),
      removeTimeout: jest.fn().mockResolvedValue(undefined),
      incrementIncorrectAnswers: jest.fn().mockResolvedValue(undefined),
      resetIncorrectAnswers: jest.fn().mockResolvedValue(undefined),
      getIncorrectAnswers: jest.fn().mockResolvedValue(0),
      getTimeOutCount: jest.fn().mockResolvedValue(0),
      incrementTimeOutCount: jest.fn().mockResolvedValue(undefined),
      createAuditLog: jest.fn().mockResolvedValue(undefined),
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

  const createMockNotVerifiedUser = (
    overrides: Partial<{
      userId: string;
      questionsAnswered: number;
      addedAt: Date;
      lock: boolean;
      incorrectAnswers: number;
      timedoutAt: Date | null;
      timeOutCount: number;
    }> = {},
  ): {
    userId: string;
    questionsAnswered: number;
    addedAt: Date;
    lock: boolean;
    incorrectAnswers: number;
    timedoutAt: Date | null;
    timeOutCount: number;
  } => ({
    userId: "user-123",
    questionsAnswered: 0,
    addedAt: new Date(),
    lock: false,
    incorrectAnswers: 0,
    timedoutAt: null,
    timeOutCount: 0,
    ...overrides,
  });

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
      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser({ lock: true }));
      (discord.members.getMember as jest.Mock).mockResolvedValue(createMockMember());

      await eventHandler(message);

      expect(mockDb.lockUser).not.toHaveBeenCalled();
      expect(mockDb.incrementQuestionsAnswered).not.toHaveBeenCalled();
    });

    it("should ignore if member is not found", async () => {
      const message = createMockMessage("4", true, false);
      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
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

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      // Should lock user during processing
      expect(mockDb.lockUser).toHaveBeenCalledWith("user-123");

      // Should increment questions answered
      expect(mockDb.incrementQuestionsAnswered).toHaveBeenCalledWith("user-123");

      // Should reply with "Correct!"
      expect(message.reply).toHaveBeenCalledWith("Correct!");

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

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser({ questionsAnswered: 2 }));
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

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser({ questionsAnswered: 1 }));
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      expect(mockDb.incrementQuestionsAnswered).toHaveBeenCalled();
      expect(sendCaptcha).toHaveBeenCalled();
    });

    it("should accept answer when it is part of a longer message within character limit", async () => {
      const message = createMockMessage("The answer is 4!", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      expect(mockDb.incrementQuestionsAnswered).toHaveBeenCalled();
    });
  });

  describe("incorrect answer handling", () => {
    it("should not increment questions for incorrect answer and track incorrect answers", async () => {
      const message = createMockMessage("wrong answer", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      // Should lock and unlock
      expect(mockDb.lockUser).toHaveBeenCalledWith("user-123");
      expect(mockDb.unlockUser).toHaveBeenCalledWith("user-123");

      // Should NOT increment questions answered
      expect(mockDb.incrementQuestionsAnswered).not.toHaveBeenCalled();
      expect(sendCaptcha).not.toHaveBeenCalled();

      // Should increment incorrect answers
      expect(mockDb.incrementIncorrectAnswers).toHaveBeenCalledWith("user-123");

      // Should reply with incorrect message
      expect(message.reply).toHaveBeenCalledWith("Incorrect! Try again.");
    });

    it("should reject answer if message exceeds max length and track as incorrect", async () => {
      const longMessage = "4 " + "x".repeat(50); // Over 50 chars
      const message = createMockMessage(longMessage, true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      // Should NOT increment even if answer is correct
      expect(mockDb.incrementQuestionsAnswered).not.toHaveBeenCalled();

      // Should track as incorrect
      expect(mockDb.incrementIncorrectAnswers).toHaveBeenCalledWith("user-123");
    });

    it("should handle answer that does not contain the correct answer", async () => {
      const message = createMockMessage("five", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      expect(mockDb.incrementQuestionsAnswered).not.toHaveBeenCalled();
      expect(mockDb.incrementIncorrectAnswers).toHaveBeenCalledWith("user-123");
    });
  });

  describe("edge cases", () => {
    it("should unlock user and return early if all questions already answered", async () => {
      const message = createMockMessage("test", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser({ questionsAnswered: 3 }));
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

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      // Make incrementQuestionsAnswered throw an error
      const testError = new Error("Database error");
      mockDb.incrementQuestionsAnswered.mockRejectedValueOnce(testError);

      // Error is caught inside try-catch, so it won't throw
      await eventHandler(message);

      // Lock should still be called
      expect(mockDb.lockUser).toHaveBeenCalledWith("user-123");

      // Unlock should be called in finally block
      expect(mockDb.unlockUser).toHaveBeenCalledWith("user-123");
    });

    it("should handle exact match of answer at max length", async () => {
      const message = createMockMessage("4".padEnd(50, " "), true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
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

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
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

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      expect(mockDb.unlockUser).toHaveBeenCalledWith("user-123");
    });
  });

  describe("timeout functionality", () => {
    it("should block user from answering while timed out", async () => {
      const message = createMockMessage("4", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      // Set timeout to 30 seconds ago (still within 1 hour timeout)
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
      mockDb.getTimeout.mockResolvedValue(thirtySecondsAgo);

      await eventHandler(message);

      // Should reply with wait message
      expect(message.reply).toHaveBeenCalledWith(expect.stringContaining("You have to wait"));

      // Should NOT process the answer
      expect(mockDb.incrementQuestionsAnswered).not.toHaveBeenCalled();
      expect(mockDb.incrementIncorrectAnswers).not.toHaveBeenCalled();
    });

    it("should allow user to answer after timeout expires and reset incorrect answers", async () => {
      const message = createMockMessage("4", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      // Set timeout to 2 hours ago (past the 1 hour timeout)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      mockDb.getTimeout.mockResolvedValue(twoHoursAgo);

      await eventHandler(message);

      // Should remove timeout and reset incorrect answers
      expect(mockDb.removeTimeout).toHaveBeenCalledWith("user-123");
      expect(mockDb.resetIncorrectAnswers).toHaveBeenCalledWith("user-123");

      // Should process the correct answer
      expect(mockDb.incrementQuestionsAnswered).toHaveBeenCalledWith("user-123");
    });

    it("should start timeout when user reaches max incorrect answers", async () => {
      const message = createMockMessage("wrong answer", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      // User has 2 incorrect answers, this will be the 3rd (reaching max of 3)
      mockDb.getIncorrectAnswers.mockResolvedValue(3);

      await eventHandler(message);

      // Should start timeout
      expect(mockDb.startTimeout).toHaveBeenCalledWith("user-123");
      expect(mockDb.incrementTimeOutCount).toHaveBeenCalledWith("user-123");

      // Should reply with timeout message
      expect(message.reply).toHaveBeenCalledWith(expect.stringContaining("maximum number of incorrect answers"));
    });

    it("should not start timeout if user has not reached max incorrect answers", async () => {
      const message = createMockMessage("wrong answer", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      // User has 1 incorrect answer after this one (below max of 3)
      mockDb.getIncorrectAnswers.mockResolvedValue(1);

      await eventHandler(message);

      // Should NOT start timeout
      expect(mockDb.startTimeout).not.toHaveBeenCalled();

      // Should reply with simple incorrect message
      expect(message.reply).toHaveBeenCalledWith("Incorrect! Try again.");
    });
  });

  describe("ban functionality", () => {
    it("should ban user when max timeouts reached", async () => {
      const message = createMockMessage("wrong answer", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      // User has reached max incorrect answers
      mockDb.getIncorrectAnswers.mockResolvedValue(3);

      // User already has 2 timeouts (max is 2, so this would be the 3rd)
      mockDb.getTimeOutCount.mockResolvedValue(2);

      await eventHandler(message);

      // Should ban the user
      expect(discord.members.banUser).toHaveBeenCalledWith("user-123", {
        reason: "Reached the maximum number of captcha timeouts",
      });

      // Should delete the not verified user
      expect(mockDb.deleteNotVerifiedUser).toHaveBeenCalledWith("user-123");

      // Should reply with ban message
      expect(message.reply).toHaveBeenCalledWith(expect.stringContaining("banned from the server"));

      // Should NOT start a new timeout
      expect(mockDb.startTimeout).not.toHaveBeenCalled();
    });

    it("should start timeout instead of ban when max timeouts not yet reached", async () => {
      const message = createMockMessage("wrong answer", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      // User has reached max incorrect answers
      mockDb.getIncorrectAnswers.mockResolvedValue(3);

      // User has 1 timeout (max is 2, so this will be the 2nd which is allowed)
      mockDb.getTimeOutCount.mockResolvedValue(1);

      await eventHandler(message);

      // Should NOT ban the user
      expect(discord.members.banUser).not.toHaveBeenCalled();

      // Should start timeout
      expect(mockDb.startTimeout).toHaveBeenCalledWith("user-123");
      expect(mockDb.incrementTimeOutCount).toHaveBeenCalledWith("user-123");
    });
  });

  describe("audit logging", () => {
    it("should create audit log for correct answer", async () => {
      const message = createMockMessage("4", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      expect(mockDb.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "captchaCorrect",
          userId: "user-123",
        }),
      );
    });

    it("should create audit log for incorrect answer", async () => {
      const message = createMockMessage("wrong", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      expect(mockDb.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "captchaIncorrect",
          userId: "user-123",
        }),
      );
    });

    it("should create audit log when user is verified", async () => {
      const message = createMockMessage("paris", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser({ questionsAnswered: 2 }));
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);

      await eventHandler(message);

      expect(mockDb.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "userVerified",
          userId: "user-123",
        }),
      );
    });

    it("should create audit log when user is timed out", async () => {
      const message = createMockMessage("wrong", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);
      mockDb.getIncorrectAnswers.mockResolvedValue(3);
      mockDb.getTimeOutCount.mockResolvedValue(0);

      await eventHandler(message);

      expect(mockDb.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "captchaTimeout",
          userId: "user-123",
        }),
      );
    });

    it("should create audit log when user is banned", async () => {
      const message = createMockMessage("wrong", true, false);
      const mockMember = createMockMember();

      mockDb.getNotVerifiedUser.mockResolvedValue(createMockNotVerifiedUser());
      (discord.members.getMember as jest.Mock).mockResolvedValue(mockMember);
      mockDb.getIncorrectAnswers.mockResolvedValue(3);
      mockDb.getTimeOutCount.mockResolvedValue(2);

      await eventHandler(message);

      expect(mockDb.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "captchaBan",
          userId: "user-123",
        }),
      );
    });
  });
});
