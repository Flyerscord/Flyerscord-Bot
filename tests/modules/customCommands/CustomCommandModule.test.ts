describe("CustomCommandModule", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("should return the default config", async () => {
    const { default: CustomCommandsModule } = await import("@modules/customCommands/CustomCommandsModule");
    const { default: ConfigManager } = await import("@root/src/common/managers/ConfigManager");

    CustomCommandsModule.getInstance({});

    const configManager = ConfigManager.getInstance();
    const config = configManager.getConfig("CustomCommands");

    expect(config.prefix).toBe("!");
  });

  it("should return the configured config", async () => {
    const { default: CustomCommandsModule } = await import("@modules/customCommands/CustomCommandsModule");
    const { default: ConfigManager } = await import("@root/src/common/managers/ConfigManager");

    CustomCommandsModule.getInstance({
      customcommands: {
        prefix: "?",
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

    const configManager = ConfigManager.getInstance();
    const config = configManager.getConfig("CustomCommands");

    expect(config.prefix).toBe("?");
  });
});
