// Mock the database BEFORE any imports
jest.mock("@common/db/db", () => {
  const mockDb = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue([]),
    $client: jest.fn(),
  };

  return {
    __esModule: true,
    default: {
      getInstance: jest.fn(() => ({
        getDb: jest.fn(() => mockDb),
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
        getConfig: jest.fn(() => ({
          prefix: "!",
          "imageKit.redirectUrl": "https://images.example.com/",
          "imageKit.proxyUrl": "https://proxy.example.com/",
        })),
        isLoaded: jest.fn(() => true),
      })),
    },
  };
});

// Mock discord utils
const mockSendMessageToChannel = jest.fn();
jest.mock("@common/utils/discord/discord", () => ({
  __esModule: true,
  default: {
    messages: {
      sendMessageToChannel: mockSendMessageToChannel,
    },
  },
}));

// Mock ClientManager
const mockOn = jest.fn();
jest.mock("@common/managers/ClientManager", () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      client: {
        on: mockOn,
        textCommands: {
          hasAny: jest.fn().mockReturnValue(false),
        },
      },
    })),
  },
}));

// Mock CustomCommandsDB
const mockGetCommand = jest.fn();
const mockCreateAuditLog = jest.fn();
jest.mock("@modules/customCommands/db/CustomCommandsDB", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      getCommand: mockGetCommand,
      createAuditLog: mockCreateAuditLog,
    })),
  };
});

// Mock CommandImporter
const mockIsEnabled = jest.fn();
const mockGetChannelId = jest.fn();
const mockGetUserId = jest.fn();
const mockGetBotId = jest.fn();
const mockSetNewCommandName = jest.fn();
const mockSetNewCommandText = jest.fn();
jest.mock("@modules/customCommands/utils/CommandImporter", () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      isEnabled: mockIsEnabled,
      getChannelId: mockGetChannelId,
      getUserId: mockGetUserId,
      getBotId: mockGetBotId,
      setNewCommandName: mockSetNewCommandName,
      setNewCommandText: mockSetNewCommandText,
    })),
  },
}));

// Mock MyImageKit
const mockIsImageKitUrl = jest.fn();
const mockConvertToProxyUrlIfNeeded = jest.fn();
jest.mock("@modules/customCommands/utils/ImageKit", () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      isImageKitUrl: mockIsImageKitUrl,
      convertToProxyUrlIfNeeded: mockConvertToProxyUrlIfNeeded,
    })),
  },
}));

import registerListener from "@modules/customCommands/listeners/onMessageCreate";

describe("onMessageCreate listener", () => {
  let messageHandler: (message: unknown) => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mocks to default values
    mockIsEnabled.mockReturnValue(false);
    mockGetChannelId.mockReturnValue("");
    mockGetUserId.mockReturnValue("");
    mockGetBotId.mockReturnValue("");
    mockIsImageKitUrl.mockReturnValue(false);
    mockConvertToProxyUrlIfNeeded.mockResolvedValue(undefined);
    mockGetCommand.mockResolvedValue(undefined);

    // Capture the message handler when it's registered
    mockOn.mockImplementation((event: string, handler: (message: unknown) => Promise<void>) => {
      if (event === "messageCreate") {
        messageHandler = handler;
      }
    });

    // Register the listener
    registerListener();
  });

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createMockMessage = (overrides = {}) => ({
    author: {
      bot: false,
      id: "user123",
    },
    channel: {
      id: "channel456",
      isTextBased: (): boolean => true,
    },
    channelId: "channel456",
    id: "message789",
    content: "!testcmd",
    client: {
      textCommands: {
        hasAny: jest.fn().mockReturnValue(false),
      },
    },
    ...overrides,
  });

  describe("registration", () => {
    it("should register messageCreate event listener", () => {
      expect(mockOn).toHaveBeenCalledWith("messageCreate", expect.any(Function));
    });
  });

  describe("checkCommandImport", () => {
    it("should handle user message in import mode", async () => {
      mockIsEnabled.mockReturnValue(true);
      mockGetChannelId.mockReturnValue("channel456");
      mockGetUserId.mockReturnValue("user123");
      mockGetBotId.mockReturnValue("bot999");

      const message = createMockMessage({ content: "!newcmd" });

      await messageHandler(message);

      expect(mockSetNewCommandName).toHaveBeenCalledWith("!newcmd");
      expect(mockSetNewCommandText).not.toHaveBeenCalled();
    });

    it("should handle bot message in import mode", async () => {
      mockIsEnabled.mockReturnValue(true);
      mockGetChannelId.mockReturnValue("channel456");
      mockGetUserId.mockReturnValue("user123");
      mockGetBotId.mockReturnValue("bot999");

      const message = createMockMessage({
        content: "This is the command response",
        author: { bot: false, id: "bot999" },
      });

      await messageHandler(message);

      expect(mockSetNewCommandText).toHaveBeenCalledWith("This is the command response");
      expect(mockSetNewCommandName).not.toHaveBeenCalled();
    });

    it("should ignore messages from wrong channel in import mode", async () => {
      mockIsEnabled.mockReturnValue(true);
      mockGetChannelId.mockReturnValue("differentchannel");
      mockGetUserId.mockReturnValue("user123");

      const message = createMockMessage({ content: "!newcmd" });

      await messageHandler(message);

      expect(mockSetNewCommandName).not.toHaveBeenCalled();
      expect(mockSetNewCommandText).not.toHaveBeenCalled();
    });

    it("should ignore messages from non-participants in import mode", async () => {
      mockIsEnabled.mockReturnValue(true);
      mockGetChannelId.mockReturnValue("channel456");
      mockGetUserId.mockReturnValue("differentuser");
      mockGetBotId.mockReturnValue("differentbot");

      const message = createMockMessage({ content: "!newcmd" });

      await messageHandler(message);

      expect(mockSetNewCommandName).not.toHaveBeenCalled();
      expect(mockSetNewCommandText).not.toHaveBeenCalled();
    });
  });

  describe("checkForCustomTextCommand", () => {
    it("should ignore messages from bots", async () => {
      const message = createMockMessage({
        author: { bot: true, id: "bot123" },
        content: "!testcmd",
      });

      await messageHandler(message);

      expect(mockGetCommand).not.toHaveBeenCalled();
    });

    it("should ignore messages without command prefix", async () => {
      const message = createMockMessage({ content: "hello world" });

      await messageHandler(message);

      expect(mockGetCommand).not.toHaveBeenCalled();
    });

    it("should ignore messages in non-text channels", async () => {
      const message = createMockMessage({
        content: "!testcmd",
        channel: {
          id: "channel456",
          isTextBased: (): boolean => false,
        },
      });

      await messageHandler(message);

      expect(mockGetCommand).not.toHaveBeenCalled();
    });

    it("should execute custom command and send response", async () => {
      const mockCommand = {
        name: "testcmd",
        text: "This is the response",
      };
      mockGetCommand.mockResolvedValue(mockCommand);
      mockIsImageKitUrl.mockReturnValue(false);

      const message = createMockMessage({ content: "!testcmd" });

      await messageHandler(message);

      expect(mockGetCommand).toHaveBeenCalledWith("testcmd");
      expect(mockSendMessageToChannel).toHaveBeenCalledWith("channel456", "This is the response");
      expect(mockCreateAuditLog).toHaveBeenCalledWith({
        action: "CustomCommandRan",
        userId: "user123",
        details: {
          command: "testcmd",
          channelId: "channel456",
          messageId: "message789",
        },
      });
    });

    it("should convert ImageKit URL to proxy URL when needed", async () => {
      const mockCommand = {
        name: "gifcmd",
        text: "https://images.example.com/image.gif",
      };
      mockGetCommand.mockResolvedValue(mockCommand);
      mockIsImageKitUrl.mockReturnValue(true);
      mockConvertToProxyUrlIfNeeded.mockResolvedValue("https://proxy.example.com/image.gif.gif");

      const message = createMockMessage({ content: "!gifcmd" });

      await messageHandler(message);

      expect(mockConvertToProxyUrlIfNeeded).toHaveBeenCalledWith("https://images.example.com/image.gif");
      expect(mockSendMessageToChannel).toHaveBeenCalledWith("channel456", "https://proxy.example.com/image.gif.gif");
    });

    it("should use original URL when proxy conversion returns undefined", async () => {
      const mockCommand = {
        name: "imgcmd",
        text: "https://images.example.com/image.jpg",
      };
      mockGetCommand.mockResolvedValue(mockCommand);
      mockIsImageKitUrl.mockReturnValue(true);
      mockConvertToProxyUrlIfNeeded.mockResolvedValue(undefined);

      const message = createMockMessage({ content: "!imgcmd" });

      await messageHandler(message);

      expect(mockSendMessageToChannel).toHaveBeenCalledWith("channel456", "https://images.example.com/image.jpg");
    });

    it("should handle command with arguments", async () => {
      const mockCommand = {
        name: "testcmd",
        text: "Response text",
      };
      mockGetCommand.mockResolvedValue(mockCommand);
      mockIsImageKitUrl.mockReturnValue(false);

      const message = createMockMessage({ content: "!testcmd arg1 arg2" });

      await messageHandler(message);

      expect(mockGetCommand).toHaveBeenCalledWith("testcmd");
      expect(mockSendMessageToChannel).toHaveBeenCalledWith("channel456", "Response text");
    });

    it("should convert command name to lowercase", async () => {
      mockGetCommand.mockResolvedValue(undefined);

      const message = createMockMessage({ content: "!TESTCMD" });

      await messageHandler(message);

      expect(mockGetCommand).toHaveBeenCalledWith("testcmd");
    });

    it("should not send message for non-existent commands", async () => {
      mockGetCommand.mockResolvedValue(undefined);

      const message = createMockMessage({ content: "!nonexistent" });

      await messageHandler(message);

      expect(mockSendMessageToChannel).not.toHaveBeenCalled();
    });
  });
});
