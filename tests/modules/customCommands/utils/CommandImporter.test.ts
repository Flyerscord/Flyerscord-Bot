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

// Mock CustomCommandsDB
const mockHasCommand = jest.fn();
const mockAddCommand = jest.fn();
jest.mock("@modules/customCommands/db/CustomCommandsDB", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      hasCommand: mockHasCommand,
      addCommand: mockAddCommand,
    })),
  };
});

import CommandImporter from "@modules/customCommands/utils/CommandImporter";
import { InvalidImgurUrlException } from "@modules/customCommands/exceptions/InvalidImgurUrlException";
import { ErrorUploadingToImageKitException } from "@modules/customCommands/exceptions/ErrorUploadingToImageKitException";
import PageNotFoundException from "@modules/customCommands/exceptions/PageNotFoundException";

describe("CommandImporter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the singleton by disabling it (this resets all state)
    // We can't reset the singleton instance itself since it's a real class
    const importer = CommandImporter.getInstance();
    importer.disable();
  });

  describe("enable/disable", () => {
    it("should enable the importer with correct values", () => {
      const importer = CommandImporter.getInstance();

      importer.enable("channel123", "user456", "bot789", "!");

      expect(importer.isEnabled()).toBe(true);
      expect(importer.getChannelId()).toBe("channel123");
      expect(importer.getUserId()).toBe("user456");
      expect(importer.getBotId()).toBe("bot789");
    });

    it("should disable the importer and reset all values", () => {
      const importer = CommandImporter.getInstance();

      importer.enable("channel123", "user456", "bot789", "!");
      importer.disable();

      expect(importer.isEnabled()).toBe(false);
      expect(importer.getChannelId()).toBe("");
      expect(importer.getUserId()).toBe("");
      expect(importer.getBotId()).toBe("");
      expect(importer.getNewCommandName()).toBe("");
      expect(importer.getNewCommandText()).toBe("");
    });
  });

  describe("isEnabled", () => {
    it("should return false by default", () => {
      const importer = CommandImporter.getInstance();
      expect(importer.isEnabled()).toBe(false);
    });

    it("should return true after enabling", () => {
      const importer = CommandImporter.getInstance();
      importer.enable("channel123", "user456", "bot789", "!");
      expect(importer.isEnabled()).toBe(true);
    });
  });

  describe("setNewCommandName", () => {
    it("should set the command name with prefix removed", () => {
      const importer = CommandImporter.getInstance();
      importer.enable("channel123", "user456", "bot789", "!");

      importer.setNewCommandName("!testcmd");

      expect(importer.getNewCommandName()).toBe("testcmd");
    });

    it("should convert command name to lowercase", () => {
      const importer = CommandImporter.getInstance();
      importer.enable("channel123", "user456", "bot789", "!");

      importer.setNewCommandName("!TestCmd");

      expect(importer.getNewCommandName()).toBe("testcmd");
    });

    it("should handle command name without prefix", () => {
      const importer = CommandImporter.getInstance();
      importer.enable("channel123", "user456", "bot789", "!");

      importer.setNewCommandName("testcmd");

      expect(importer.getNewCommandName()).toBe("testcmd");
    });
  });

  describe("setNewCommandText", () => {
    it("should create command when name and text are valid", async () => {
      mockHasCommand.mockResolvedValue(false);
      mockAddCommand.mockResolvedValue(true);

      const importer = CommandImporter.getInstance();
      importer.enable("channel123", "user456", "bot789", "!");
      importer.setNewCommandName("!newcmd");

      await importer.setNewCommandText("This is the response");

      expect(importer.getNewCommandText()).toBe("This is the response");
      expect(mockAddCommand).toHaveBeenCalledWith("newcmd", "This is the response", "user456");
    });

    it("should send error message when name is empty", async () => {
      const importer = CommandImporter.getInstance();
      // Disable and re-enable to reset state
      importer.disable();
      importer.enable("channel123", "user456", "bot789", "!");
      // Don't set command name - name should be empty after disable/enable

      await importer.setNewCommandText("This is the response");

      expect(mockSendMessageToChannel).toHaveBeenCalledWith("channel123", "Error creating command! Name or text is missing!");
      expect(mockAddCommand).not.toHaveBeenCalled();
    });

    it("should send error message when text is empty", async () => {
      const importer = CommandImporter.getInstance();
      importer.enable("channel123", "user456", "bot789", "!");
      importer.setNewCommandName("!newcmd");

      await importer.setNewCommandText("");

      expect(mockSendMessageToChannel).toHaveBeenCalledWith("channel123", "Error creating command! Name or text is missing!");
      expect(mockAddCommand).not.toHaveBeenCalled();
    });

    it("should send error message when command already exists", async () => {
      mockHasCommand.mockResolvedValue(true);

      const importer = CommandImporter.getInstance();
      importer.enable("channel123", "user456", "bot789", "!");
      importer.setNewCommandName("!existingcmd");

      await importer.setNewCommandText("This is the response");

      expect(mockSendMessageToChannel).toHaveBeenCalledWith("channel123", "Command existingcmd already exists!");
      expect(mockAddCommand).not.toHaveBeenCalled();
    });

    it("should send error message for InvalidImgurUrlException", async () => {
      mockHasCommand.mockResolvedValue(false);
      mockAddCommand.mockRejectedValue(new InvalidImgurUrlException());

      const importer = CommandImporter.getInstance();
      importer.enable("channel123", "user456", "bot789", "!");
      importer.setNewCommandName("!imgcmd");

      await importer.setNewCommandText("https://imgur.com/invalid");

      expect(mockSendMessageToChannel).toHaveBeenCalledWith("channel123", "Error creating command! There was an issue with the url.");
    });

    it("should send error message for ErrorUploadingToImageKitException", async () => {
      mockHasCommand.mockResolvedValue(false);
      mockAddCommand.mockRejectedValue(new ErrorUploadingToImageKitException());

      const importer = CommandImporter.getInstance();
      importer.enable("channel123", "user456", "bot789", "!");
      importer.setNewCommandName("!imgcmd");

      await importer.setNewCommandText("https://example.com/image.jpg");

      expect(mockSendMessageToChannel).toHaveBeenCalledWith("channel123", "Error creating command! There was an issue with the url.");
    });

    it("should send error message for PageNotFoundException", async () => {
      mockHasCommand.mockResolvedValue(false);
      mockAddCommand.mockRejectedValue(new PageNotFoundException());

      const importer = CommandImporter.getInstance();
      importer.enable("channel123", "user456", "bot789", "!");
      importer.setNewCommandName("!imgcmd");

      await importer.setNewCommandText("https://example.com/notfound.jpg");

      expect(mockSendMessageToChannel).toHaveBeenCalledWith("channel123", "Error creating command! The url returns a 404.");
    });

    it("should send generic error message for unknown errors", async () => {
      mockHasCommand.mockResolvedValue(false);
      mockAddCommand.mockRejectedValue(new Error("Unknown error"));

      const importer = CommandImporter.getInstance();
      importer.enable("channel123", "user456", "bot789", "!");
      importer.setNewCommandName("!newcmd");

      await importer.setNewCommandText("https://example.com/image.jpg");

      expect(mockSendMessageToChannel).toHaveBeenCalledWith("channel123", "Error creating command!");
    });
  });

  describe("getters", () => {
    it("should return correct values after enabling", () => {
      const importer = CommandImporter.getInstance();
      importer.enable("channel123", "user456", "bot789", "!");

      expect(importer.getChannelId()).toBe("channel123");
      expect(importer.getUserId()).toBe("user456");
      expect(importer.getBotId()).toBe("bot789");
    });

    it("should return empty strings when disabled", () => {
      const importer = CommandImporter.getInstance();
      // Explicitly disable to reset state from previous tests
      importer.disable();

      expect(importer.getChannelId()).toBe("");
      expect(importer.getUserId()).toBe("");
      expect(importer.getBotId()).toBe("");
    });
  });
});
