import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import Zod from "@common/utils/ZodWrapper";
import schema from "./db/schema";
import PredictionsDB from "./db/PredictionsDB";
import AnnounceGameTask from "./tasks/AnnounceGameTask";
import ResolveGameTask from "./tasks/ResolveGameTask";
import PollGameResultTask from "./tasks/PollGameResultTask";
import onReady from "./listeners/onReady";

export const predictionsConfigSchema = [
  {
    key: "resultsChannelId",
    description: "The channel where prediction results are posted after each predicted game finishes",
    required: true,
    secret: false,
    requiresRestart: false,
    defaultValue: "",
    schema: Zod.string(),
  },
  {
    key: "exactPoints",
    description: "Points awarded for predicting the exact final score and how the game ended (regulation/OT/shootout)",
    required: false,
    secret: false,
    requiresRestart: false,
    defaultValue: 3,
    schema: Zod.number({ min: 0 }),
  },
  {
    key: "exactScorePoints",
    description: "Points awarded for predicting the exact final score, but the wrong ending (regulation/OT/shootout)",
    required: false,
    secret: false,
    requiresRestart: false,
    defaultValue: 2,
    schema: Zod.number({ min: 0 }),
  },
  {
    key: "correctWinnerPoints",
    description: "Points awarded for predicting the correct winner, but not the exact score",
    required: false,
    secret: false,
    requiresRestart: false,
    defaultValue: 1,
    schema: Zod.number({ min: 0 }),
  },
] as const satisfies readonly IModuleConfigSchema[];

export default class PredictionsModule extends Module {
  protected readonly CONFIG_SCHEMA = predictionsConfigSchema;

  constructor() {
    super("Predictions", { schema });
  }

  protected async setup(): Promise<void> {
    const db = new PredictionsDB();
    await db.ensureStateRowExists();

    await this.readInCommands<SlashCommand>(__dirname, "slash");

    // Run every day at 12:30 AM, same time as CreateGameDayPostTask
    AnnounceGameTask.getInstance().createScheduledJob();

    onReady();
  }

  protected async cleanup(): Promise<void> {
    AnnounceGameTask.getInstance().stopScheduledJob();
    ResolveGameTask.getInstance().removeScheduledJob();
    PollGameResultTask.getInstance().stopScheduledJob();
  }
}
