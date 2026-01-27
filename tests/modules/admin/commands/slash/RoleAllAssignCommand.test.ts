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
        getConfig: jest.fn(() => ({})),
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
    caughtError: jest.fn(),
  },
}));

// Mock discord utilities
jest.mock("@common/utils/discord/discord", () => ({
  members: {
    getMembers: jest.fn(),
  },
  roles: {
    addRoleToUser: jest.fn().mockResolvedValue(undefined),
    userHasAnyRole: jest.fn(),
  },
  interactions: {
    createReplies: jest.fn().mockReturnValue({
      reply: jest.fn().mockResolvedValue(undefined),
      editReply: jest.fn().mockResolvedValue(undefined),
      followUp: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

import RoleAllAssignCommand from "@modules/admin/commands/slash/RoleAllAssignCommand";
import discord from "@common/utils/discord/discord";
import { ChatInputCommandInteraction, Collection, GuildMember, Role } from "discord.js";

describe("RoleAllAssignCommand", () => {
  let command: RoleAllAssignCommand;
  let mockInteraction: Partial<ChatInputCommandInteraction>;
  let mockReplies: { reply: jest.Mock };
  let mockRole: { id: string; name: string };
  let mockMembers: Collection<string, GuildMember>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock role
    mockRole = {
      id: "role-123",
      name: "TestRole",
    };

    // Setup mock members
    mockMembers = new Collection<string, GuildMember>();
    mockMembers.set("member-1", { id: "member-1" } as GuildMember);
    mockMembers.set("member-2", { id: "member-2" } as GuildMember);
    mockMembers.set("member-3", { id: "member-3" } as GuildMember);

    (discord.members.getMembers as jest.Mock).mockResolvedValue(mockMembers);

    // Setup mock replies
    mockReplies = {
      reply: jest.fn().mockResolvedValue(undefined),
    };

    // Setup mock interaction
    mockInteraction = {
      user: { id: "user123" },
      options: {
        getRole: jest.fn().mockReturnValue(mockRole),
        getBoolean: jest.fn().mockReturnValue(false),
      },
    } as unknown as Partial<ChatInputCommandInteraction>;

    command = new RoleAllAssignCommand();

    // Inject mock replies
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (command as any).replies = mockReplies;
  });

  describe("constructor", () => {
    it("should create command with correct name", () => {
      expect(command.data.name).toBe("roleallassign");
    });

    it("should create command with correct description", () => {
      expect(command.data.description).toBe("Assign the role to all members of the server");
    });

    it("should have ephemeral option set to true", () => {
      // Access via any to test protected property
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((command as any).ephermal).toBe(true);
    });
  });

  describe("execute - assign to all members", () => {
    beforeEach(() => {
      (mockInteraction.options!.getBoolean as jest.Mock).mockReturnValue(false);
    });

    it("should assign role to all members when onlynonrole is false", async () => {
      await command.execute(mockInteraction as ChatInputCommandInteraction);

      // Should get all members
      expect(discord.members.getMembers).toHaveBeenCalled();

      // Should add role to each member
      expect(discord.roles.addRoleToUser).toHaveBeenCalledTimes(3);
      expect(discord.roles.addRoleToUser).toHaveBeenCalledWith(expect.objectContaining({ id: "member-1" }), "role-123");
      expect(discord.roles.addRoleToUser).toHaveBeenCalledWith(expect.objectContaining({ id: "member-2" }), "role-123");
      expect(discord.roles.addRoleToUser).toHaveBeenCalledWith(expect.objectContaining({ id: "member-3" }), "role-123");

      // Should reply with success message
      expect(mockReplies.reply).toHaveBeenCalledWith("Adding the following role to all users: TestRole");
    });

    it("should assign role when onlynonrole is null (default to false)", async () => {
      (mockInteraction.options!.getBoolean as jest.Mock).mockReturnValue(null);

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(discord.roles.addRoleToUser).toHaveBeenCalledTimes(3);
      expect(mockReplies.reply).toHaveBeenCalledWith("Adding the following role to all users: TestRole");
    });
  });

  describe("execute - assign only to members without roles", () => {
    beforeEach(() => {
      (mockInteraction.options!.getBoolean as jest.Mock).mockReturnValue(true);
    });

    it("should only assign role to members who have any role when onlynonrole is true", async () => {
      // Mock that only member-1 and member-3 have roles
      (discord.roles.userHasAnyRole as jest.Mock).mockImplementation((member: GuildMember) => {
        return member.id === "member-1" || member.id === "member-3";
      });

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      // Should check each member
      expect(discord.roles.userHasAnyRole).toHaveBeenCalledTimes(3);

      // Should only add role to members with roles (member-1 and member-3)
      expect(discord.roles.addRoleToUser).toHaveBeenCalledTimes(2);
      expect(discord.roles.addRoleToUser).toHaveBeenCalledWith(expect.objectContaining({ id: "member-1" }), "role-123");
      expect(discord.roles.addRoleToUser).toHaveBeenCalledWith(expect.objectContaining({ id: "member-3" }), "role-123");

      // Should reply with appropriate message
      expect(mockReplies.reply).toHaveBeenCalledWith("Adding the following role to users that do not have a role: TestRole");
    });

    it("should not assign role to any member when none have roles", async () => {
      (discord.roles.userHasAnyRole as jest.Mock).mockReturnValue(false);

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(discord.roles.addRoleToUser).not.toHaveBeenCalled();
      expect(mockReplies.reply).toHaveBeenCalledWith("Adding the following role to users that do not have a role: TestRole");
    });
  });

  describe("execute - error handling", () => {
    it("should reply with error when getMembers fails", async () => {
      (discord.members.getMembers as jest.Mock).mockResolvedValue(null);

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(mockReplies.reply).toHaveBeenCalledWith("Error retreiving the guild members");
      expect(discord.roles.addRoleToUser).not.toHaveBeenCalled();
    });

    it("should reply with error when getMembers returns undefined", async () => {
      (discord.members.getMembers as jest.Mock).mockResolvedValue(undefined);

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(mockReplies.reply).toHaveBeenCalledWith("Error retreiving the guild members");
      expect(discord.roles.addRoleToUser).not.toHaveBeenCalled();
    });
  });

  describe("execute - empty server", () => {
    it("should handle empty member collection", async () => {
      const emptyMembers = new Collection<string, GuildMember>();
      (discord.members.getMembers as jest.Mock).mockResolvedValue(emptyMembers);

      await command.execute(mockInteraction as ChatInputCommandInteraction);

      expect(discord.roles.addRoleToUser).not.toHaveBeenCalled();
      expect(mockReplies.reply).toHaveBeenCalledWith("Adding the following role to all users: TestRole");
    });
  });
});
