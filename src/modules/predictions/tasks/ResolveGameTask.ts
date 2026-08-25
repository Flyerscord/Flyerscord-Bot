import EphemeralTask from "@common/models/EphemeralTask";
import PollGameResultTask from "./PollGameResultTask";

export default class ResolveGameTask extends EphemeralTask {
  constructor() {
    super("ResolveGame");
  }

  protected async execute(): Promise<void> {
    PollGameResultTask.getInstance().createScheduledJob();
  }
}
