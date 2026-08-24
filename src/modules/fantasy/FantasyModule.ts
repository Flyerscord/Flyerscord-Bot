import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import ButtonHandler from "@common/models/ButtonHandler";
import Zod from "@common/utils/ZodWrapper";
import schema from "./db/schema";
import FantasyDB from "./db/FantasyDB";
import SeasonCloseTask from "./tasks/SeasonCloseTask";
import { closeSeason } from "./utils/closeSeason";
import Stumper from "stumper";

export const fantasyConfigSchema = [
  {
    key: "signupChannelId",
    description: "The channel where the Fantasy signup message and season results are posted",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "commissionerRoleId",
    description: "The role granted to users who sign up to be a Fantasy commissioner",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "generalRoleId",
    description: "The role granted to every user who signs up for Fantasy, regardless of skill level or commissioner status",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "adminChannelId",
    description: "The channel where proposed team rosters are posted for admin approval before roles are assigned",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "minLevel",
    description: "The minimum Levels module level required to sign up for Fantasy",
    required: false,
    secret: false,
    requiresRestart: false,
    defaultValue: 5,
    schema: Zod.number({ min: 0 }),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class FantasyModule extends Module {
  protected readonly CONFIG_SCHEMA = fantasyConfigSchema;

  constructor() {
    super("Fantasy", { schema, dependsOn: ["Levels"], loadPriority: 51 });
  }

  protected async setup(): Promise<void> {
    await this.readInCommands<SlashCommand>(__dirname, "slash");
    await this.readInCommands<ButtonHandler>(__dirname, "buttons");

    await this.rearmSeasonCloseTask();
  }

  protected async cleanup(): Promise<void> {
    SeasonCloseTask.getInstance().removeScheduledJob();
  }

  /**
   * Restores the deadline-close scheduling for an in-progress season after a bot restart: re-arms the
   * scheduled task if the deadline is still in the future, or closes the season immediately if it
   * already passed while the bot was down.
   */
  private async rearmSeasonCloseTask(): Promise<void> {
    const db = new FantasyDB();
    const season = await db.getOpenSeason();
    if (!season) {
      return;
    }

    if (season.signupDeadline.getTime() <= Date.now()) {
      Stumper.info(`Fantasy season ${season.id} deadline already passed, closing it now`, "fantasy:FantasyModule:rearmSeasonCloseTask");
      await closeSeason(season.id);
      return;
    }

    SeasonCloseTask.getInstance().setDate(season.signupDeadline);
  }
}
