import ICustomCommand from "@modules/customCommands/interfaces/ICustomCommand";
import { createCommandListMessages } from "@modules/customCommands/utils/util";
import "@common/types/discord.js/index.d.ts";
import CustomCommandsModule from "@modules/customCommands/CustomCommandsModule";

describe("createCommandListMessages", () => {
  beforeEach(() => {
    CustomCommandsModule.getInstance({
      customcommands: {
        prefix: "!",
        commandTempChannelId: "",
        customCommandListChannelId: "",
        imageKit: {
          publicKey: "",
          privateKey: "",
          urlEndpoint: "",
          redirectUrl: "",
          proxyUrl: "",
        },
        imgur: {
          clientId: "",
          clientSecret: "",
        },
      },
    });
  });

  it("should return a single message if commands fit within 2000 characters", () => {
    const commands = Array.from({ length: 5 }, (_, i) => ({ name: `cmd${i + 1}` })) as ICustomCommand[];

    const result = createCommandListMessages(commands);

    expect(result.length).toBe(1);
    expect(result[0]).toContain("**Custom Commands (5 commands)**");
    commands.forEach((cmd) => {
      expect(result[0]).toContain(`!${cmd.name}`);
    });
  });

  it("should split messages when exceeding 2000 characters", () => {
    const longCommand = "x".repeat(500); // Each command takes 502 characters (prefix + newline)
    const commands = Array.from({ length: 5 }, (_, i) => ({ name: longCommand + i })) as ICustomCommand[];

    const result = createCommandListMessages(commands);

    expect(result.length).toBeGreaterThan(1);
    expect(result[0].length).toBeLessThanOrEqual(2000);
    expect(result[result.length - 1].length).toBeLessThanOrEqual(2000);
  });

  it("should handle an empty command list", () => {
    const result = createCommandListMessages([]);

    expect(result.length).toBe(1);
    expect(result[0]).toBe("**Custom Commands (0 commands)**\n");
  });
});
