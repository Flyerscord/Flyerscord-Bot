import EphemeralTask from "@common/models/EphemeralTask";
import LiveDataTask from "./LiveDataTask";

export default class GameStartTask extends EphemeralTask {
  constructor() {
    super("GameStartTask");
  }

  protected async execute(): Promise<void> {
    LiveDataTask.getInstance().createScheduledJob();
  }
}
