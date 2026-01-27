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

// Mock ClientManager for autocomplete listener
jest.mock("@common/managers/ClientManager", () => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({
      client: {
        on: jest.fn(),
      },
    })),
  },
}));

// Mock BlueSky
jest.mock("@modules/bluesky/utils/BlueSky");

// Mock BlueSkyDB
jest.mock("@modules/bluesky/db/BlueSkyDB");

import BlueSkyCommand from "@modules/bluesky/commands/slash/BlueSkyCommand";
import BlueSky from "@modules/bluesky/utils/BlueSky";
import BlueSkyDB, { BlueSkyActionType } from "@modules/bluesky/db/BlueSkyDB";
import { AccountAlreadyExistsException } from "@modules/bluesky/exceptions/AccountAlreadyExistsException";
import { AccountDoesNotExistException } from "@modules/bluesky/exceptions/AccountDoesNotExistException";
import Stumper from "stumper";
import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";

describe("BlueSkyCommand", () => {
  let command: BlueSkyCommand;
  let mockBlueSky: jest.Mocked<BlueSky>;
  let mockDb: jest.Mocked<BlueSkyDB>;
  let mockInteraction: Partial<ChatInputCommandInteraction>;
  let mockReplies: { reply: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock BlueSky instance
    mockBlueSky = {
      addAccountToList: jest.fn(),
      removeAccountFromList: jest.fn(),
      getListAccounts: jest.fn(),
    } as unknown as jest.Mocked<BlueSky>;

    (BlueSky.getInstance as jest.Mock).mockReturnValue(mockBlueSky);

    // Setup mock DB instance
    mockDb = {
      addAuditLog: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<BlueSkyDB>;

    (BlueSkyDB as jest.MockedClass<typeof BlueSkyDB>).mockImplementation(() => mockDb);

    // Setup mock replies
    mockReplies = {
      reply: jest.fn().mockResolvedValue(undefined),
    };

    // Setup mock interaction
    mockInteraction = {
      user: { id: "user123" },
      options: {
        getSubcommand: jest.fn(),
        getString: jest.fn(),
      },
    } as unknown as Partial<ChatInputCommandInteraction>;

    command = new BlueSkyCommand();

    // Inject mock replies
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (command as any).replies = mockReplies;
  });

  describe("constructor", () => {
    it("should create command with correct name", () => {
      expect(command.data.name).toBe("bluesky");
    });

    it("should create command with correct description", () => {
      expect(command.data.description).toBe("Command for managing the BlueSky followed accounts");
    });
  });

  describe("execute - add subcommand", () => {
    beforeEach(() => {
      (mockInteraction.options!.getSubcommand as jest.Mock).mockReturnValue("add");
      (mockInteraction.options!.getString as jest.Mock).mockReturnValue("newaccount.bsky.social");
    });

    it("should add account successfully", async () => {
      mockBlueSky.addAccountToList.mockResolvedValue(undefined);

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(mockBlueSky.addAccountToList).toHaveBeenCalledWith("newaccount.bsky.social");
      expect(mockDb.addAuditLog).toHaveBeenCalledWith(BlueSkyActionType.ADD, "user123", { account: "newaccount.bsky.social" });
      expect(mockReplies.reply).toHaveBeenCalledWith("Account newaccount.bsky.social added!");
      expect(Stumper.info).toHaveBeenCalledWith("Account newaccount.bsky.social added to watched accounts", "blueSky:BlueSkyCommand:add");
    });

    it("should handle AccountAlreadyExistsException", async () => {
      mockBlueSky.addAccountToList.mockRejectedValue(new AccountAlreadyExistsException());

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(mockReplies.reply).toHaveBeenCalledWith({
        content: "Account newaccount.bsky.social already exists!",
        ephemeral: true,
      });
    });

    it("should handle generic error", async () => {
      mockBlueSky.addAccountToList.mockRejectedValue(new Error("Unknown error"));

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(mockReplies.reply).toHaveBeenCalledWith({
        content: "Error adding account!",
        ephemeral: true,
      });
    });
  });

  describe("execute - remove subcommand", () => {
    beforeEach(() => {
      (mockInteraction.options!.getSubcommand as jest.Mock).mockReturnValue("remove");
      (mockInteraction.options!.getString as jest.Mock).mockReturnValue("account.bsky.social");
    });

    it("should remove account successfully", async () => {
      mockBlueSky.removeAccountFromList.mockResolvedValue(undefined);

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(mockBlueSky.removeAccountFromList).toHaveBeenCalledWith("account.bsky.social");
      expect(mockDb.addAuditLog).toHaveBeenCalledWith(BlueSkyActionType.REMOVE, "user123", { account: "account.bsky.social" });
      expect(mockReplies.reply).toHaveBeenCalledWith("Account account.bsky.social removed!");
      expect(Stumper.info).toHaveBeenCalledWith("Account account.bsky.social removed from watched accounts", "blueSky:BlueSkyCommand:remove");
    });

    it("should handle AccountDoesNotExistException", async () => {
      mockBlueSky.removeAccountFromList.mockRejectedValue(new AccountDoesNotExistException("account.bsky.social"));

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(mockReplies.reply).toHaveBeenCalledWith({
        content: "Account account.bsky.social does not exist!",
        ephemeral: true,
      });
    });

    it("should handle generic error", async () => {
      mockBlueSky.removeAccountFromList.mockRejectedValue(new Error("Unknown error"));

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(mockReplies.reply).toHaveBeenCalledWith({
        content: "Error removing account!",
        ephemeral: true,
      });
    });
  });

  describe("execute - list subcommand", () => {
    beforeEach(() => {
      (mockInteraction.options!.getSubcommand as jest.Mock).mockReturnValue("list");
    });

    it("should list all accounts when accounts exist", async () => {
      mockBlueSky.getListAccounts.mockResolvedValue([
        { userHandle: "account1.bsky.social", userDid: "did1", displayName: "Account 1", uri: "uri1" },
        { userHandle: "account2.bsky.social", userDid: "did2", displayName: "Account 2", uri: "uri2" },
      ]);

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(mockBlueSky.getListAccounts).toHaveBeenCalled();
      expect(mockReplies.reply).toHaveBeenCalledWith(expect.stringContaining("Current Accounts:"));
      expect(mockReplies.reply).toHaveBeenCalledWith(expect.stringContaining("account1.bsky.social"));
      expect(mockReplies.reply).toHaveBeenCalledWith(expect.stringContaining("account2.bsky.social"));
    });

    it("should show message when no accounts exist", async () => {
      mockBlueSky.getListAccounts.mockResolvedValue([]);

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(mockReplies.reply).toHaveBeenCalledWith("No accounts found!");
    });
  });

  describe("execute - invalid subcommand", () => {
    it("should respond with error for invalid subcommand", async () => {
      (mockInteraction.options!.getSubcommand as jest.Mock).mockReturnValue("invalid");

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(mockReplies.reply).toHaveBeenCalledWith({
        content: "Invalid subcommand!",
        ephemeral: true,
      });
    });
  });

  describe("getAutoCompleteOptions", () => {
    let mockAutocompleteInteraction: Partial<AutocompleteInteraction>;

    beforeEach(() => {
      mockAutocompleteInteraction = {
        options: {
          getSubcommand: jest.fn().mockReturnValue("remove"),
          getFocused: jest.fn().mockReturnValue({ name: "account", value: "" }),
        },
      } as unknown as Partial<AutocompleteInteraction>;
    });

    it("should return account handles for remove subcommand", async () => {
      mockBlueSky.getListAccounts.mockResolvedValue([
        { userHandle: "account1.bsky.social", userDid: "did1", displayName: "Account 1", uri: "uri1" },
        { userHandle: "account2.bsky.social", userDid: "did2", displayName: "Account 2", uri: "uri2" },
      ]);

      const result = await command.getAutoCompleteOptions(mockAutocompleteInteraction as AutocompleteInteraction);

      expect(result).toEqual(["account1.bsky.social", "account2.bsky.social"]);
    });

    it("should return undefined for non-remove subcommand", async () => {
      (mockAutocompleteInteraction.options!.getSubcommand as jest.Mock).mockReturnValue("add");

      const result = await command.getAutoCompleteOptions(mockAutocompleteInteraction as AutocompleteInteraction);

      expect(result).toBeUndefined();
    });

    it("should return undefined for non-account option", async () => {
      (mockAutocompleteInteraction.options!.getFocused as jest.Mock).mockReturnValue({ name: "other", value: "" });

      const result = await command.getAutoCompleteOptions(mockAutocompleteInteraction as AutocompleteInteraction);

      expect(result).toBeUndefined();
    });

    it("should return undefined on API error", async () => {
      mockBlueSky.getListAccounts.mockRejectedValue(new Error("API Error"));

      const result = await command.getAutoCompleteOptions(mockAutocompleteInteraction as AutocompleteInteraction);

      expect(result).toBeUndefined();
    });
  });
});
