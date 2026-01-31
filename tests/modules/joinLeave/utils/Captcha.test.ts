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
          captchaQuestions: [
            { question: "What is 2+2?", answer: "4" },
            { question: "What color is the sky?", answer: "blue" },
            { question: "What is the capital of France?", answer: "paris" },
          ],
        })),
      })),
    },
  };
});

// Mock discord utilities
jest.mock("@common/utils/discord/discord", () => ({
  messages: {
    sendEmbedToThread: jest.fn().mockResolvedValue(undefined),
    sendMessageToThread: jest.fn().mockResolvedValue(undefined),
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

import { sendCaptcha } from "@modules/joinLeave/utils/Captcha";
import JoinLeaveDB from "@modules/joinLeave/db/JoinLeaveDB";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";
import { User } from "discord.js";

// Mock JoinLeaveDB
jest.mock("@modules/joinLeave/db/JoinLeaveDB");

describe("Captcha", () => {
  let mockUser: User;
  let mockDb: jest.Mocked<JoinLeaveDB>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock user
    mockUser = {
      id: "123456789",
      username: "testuser",
      bot: false,
    } as User;

    // Setup mock DB instance
    mockDb = {
      getNotVerifiedUser: jest.fn(),
      addNotVerifiedUser: jest.fn(),
      deleteNotVerifiedUser: jest.fn(),
      incrementQuestionsAnswered: jest.fn(),
      unlockUser: jest.fn().mockResolvedValue(undefined),
      tryLockUser: jest.fn().mockResolvedValue(true),
      isUserLocked: jest.fn().mockResolvedValue(false),
      getNotVerifiedUsers: jest.fn(),
    } as unknown as jest.Mocked<JoinLeaveDB>;

    (JoinLeaveDB as jest.MockedClass<typeof JoinLeaveDB>).mockImplementation(() => mockDb);
  });

  describe("sendCaptcha", () => {
    it("should not send captcha and log warning if user is already locked", async () => {
      mockDb.tryLockUser.mockResolvedValue(false);

      await sendCaptcha(mockUser);

      expect(Stumper.warning).toHaveBeenCalledWith(expect.stringContaining("already locked"), "joinLeave:sendCaptcha");
      expect(discord.messages.sendEmbedToThread).not.toHaveBeenCalled();
    });

    it("should send the first captcha question when user has answered 0 questions", async () => {
      // Setup: user exists and hasn't answered any questions
      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "123456789",
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: false,
        incorrectAnswers: 0,
        timedoutAt: null,
        timeOutCount: 0,
        threadId: "thread-123",
      });

      await sendCaptcha(mockUser);

      // Should get the user from DB
      expect(mockDb.getNotVerifiedUser).toHaveBeenCalledWith("123456789");

      // Should send a message to the thread with the first question
      expect(discord.messages.sendEmbedToThread).toHaveBeenCalledWith(
        "thread-123",
        expect.objectContaining({
          data: expect.objectContaining({
            title: "Captcha",
            description: expect.stringContaining("captcha"),
            fields: expect.arrayContaining([
              expect.objectContaining({
                name: "Question",
                value: "What is 2+2?",
              }),
            ]),
          }),
        }),
      );

      // Should not log any errors
      expect(Stumper.error).not.toHaveBeenCalled();
    });

    it("should send the second captcha question when user has answered 1 question", async () => {
      // Setup: user has answered 1 question
      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "123456789",
        questionsAnswered: 1,
        addedAt: new Date(),
        lock: false,
        incorrectAnswers: 0,
        timedoutAt: null,
        timeOutCount: 0,
        threadId: "thread-123",
      });

      await sendCaptcha(mockUser);

      expect(discord.messages.sendEmbedToThread).toHaveBeenCalledWith(
        "thread-123",
        expect.objectContaining({
          data: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                name: "Question",
                value: "What color is the sky?",
              }),
            ]),
          }),
        }),
      );
    });

    it("should send the third captcha question when user has answered 2 questions", async () => {
      // Setup: user has answered 2 questions
      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "123456789",
        questionsAnswered: 2,
        addedAt: new Date(),
        lock: false,
        incorrectAnswers: 0,
        timedoutAt: null,
        timeOutCount: 0,
        threadId: "thread-123",
      });

      await sendCaptcha(mockUser);

      expect(discord.messages.sendEmbedToThread).toHaveBeenCalledWith(
        "thread-123",
        expect.objectContaining({
          data: expect.objectContaining({
            fields: expect.arrayContaining([
              expect.objectContaining({
                name: "Question",
                value: "What is the capital of France?",
              }),
            ]),
          }),
        }),
      );
    });

    it("should not send captcha and log error if user is not in not verified users table", async () => {
      // Setup: user does not exist
      mockDb.getNotVerifiedUser.mockResolvedValue(undefined);

      await sendCaptcha(mockUser);

      // Should check for user
      expect(mockDb.getNotVerifiedUser).toHaveBeenCalledWith("123456789");

      // Should not send message
      expect(discord.messages.sendEmbedToThread).not.toHaveBeenCalled();

      // Should log error
      expect(Stumper.error).toHaveBeenCalledWith(expect.stringContaining("not in the not verified users table"), "joinLeave:sendCaptcha");
    });

    it("should not send captcha and log error if user has already answered all questions", async () => {
      // Setup: user has answered all 3 questions
      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "123456789",
        questionsAnswered: 3,
        addedAt: new Date(),
        lock: false,
        incorrectAnswers: 0,
        timedoutAt: null,
        timeOutCount: 0,
        threadId: "thread-123",
      });

      await sendCaptcha(mockUser);

      // Should not send message
      expect(discord.messages.sendEmbedToThread).not.toHaveBeenCalled();

      // Should log error
      expect(Stumper.error).toHaveBeenCalledWith(expect.stringContaining("already answered all the questions"), "joinLeave:sendCaptcha");
    });

    it("should not send captcha if user has answered more questions than available", async () => {
      // Setup: user has somehow answered 5 questions (edge case)
      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "123456789",
        questionsAnswered: 5,
        addedAt: new Date(),
        lock: false,
        incorrectAnswers: 0,
        timedoutAt: null,
        timeOutCount: 0,
        threadId: "thread-123",
      });

      await sendCaptcha(mockUser);

      expect(discord.messages.sendEmbedToThread).not.toHaveBeenCalled();
      expect(Stumper.error).toHaveBeenCalled();
    });

    it("should create embed with correct structure", async () => {
      mockDb.getNotVerifiedUser.mockResolvedValue({
        userId: "123456789",
        questionsAnswered: 0,
        addedAt: new Date(),
        lock: false,
        incorrectAnswers: 0,
        timedoutAt: null,
        timeOutCount: 0,
        threadId: "thread-123",
      });

      await sendCaptcha(mockUser);

      expect(discord.messages.sendEmbedToThread).toHaveBeenCalledWith(
        "thread-123",
        expect.objectContaining({
          data: expect.objectContaining({
            title: "Captcha",
            description: expect.any(String),
            fields: expect.any(Array),
          }),
        }),
      );
    });
  });
});
