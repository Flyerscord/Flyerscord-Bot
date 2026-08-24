import Module, { IModuleConfigSchema } from "@common/models/Module";
import SlashCommand from "@common/models/SlashCommand";
import Zod from "@common/utils/ZodWrapper";
import schema from "./db/schema";
import PredictionsDB from "./db/PredictionsDB";
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
    key: "exactScorePoints",
    description: "Points awarded for predicting the exact final score",
    required: false,
    secret: false,
    requiresRestart: false,
    defaultValue: 3,
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

    onReady();
  }

  protected async cleanup(): Promise<void> {
    ResolveGameTask.getInstance().removeScheduledJob();
    PollGameResultTask.getInstance().stopScheduledJob();
  }
}
