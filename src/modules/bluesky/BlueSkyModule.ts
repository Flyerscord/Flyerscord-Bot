import { IKeyedObject } from "@common/interfaces/IKeyedObject";
import Module from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import CheckForNewPostsTask from "./tasks/CheckForNewPostsTask";
import BlueSky from "./utils/BlueSky";
import schema from "./db/schema";
import { IConfigInfoNoModule } from "@root/src/common/config/ConfigManager";
import { ValueType } from "@root/src/common/db/schema";

export type BlueSkyConfigKeys = "username" | "password" | "channelId" | "listId";

export default class BlueSkyModule extends Module<BlueSkyConfigKeys> {
  constructor(config: IKeyedObject) {
    super("BlueSky", config, schema);
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");

    // Login to BlueSky
    BlueSky.getInstance();

    this.registerSchedules();
  }

  protected async cleanup(): Promise<void> {}

  private registerSchedules(): void {
    CheckForNewPostsTask.getInstance().createScheduledJob();
  }

  protected setConfigInfo(): IConfigInfoNoModule<BlueSkyConfigKeys>[] {
    return [
      {
        key: "username",
        description: "BlueSky username",
        valueType: ValueType.ENCRYPTED,
        defaultValue: "",
        isSecret: true,
        requiresRestart: true,
      },
      {
        key: "password",
        description: "BlueSky password",
        valueType: ValueType.ENCRYPTED,
        defaultValue: "",
        isSecret: true,
        requiresRestart: true,
      },
      {
        key: "channelId",
        description: "Channel that posts will be posted to",
        valueType: ValueType.STRING,
        defaultValue: "",
        requiresRestart: true,
      },
      {
        key: "listId",
        description: "The BlueSky list Id that will be used to pull posts from",
        valueType: ValueType.STRING,
        defaultValue: "",
        requiresRestart: true,
      },
    ];
  }
}
