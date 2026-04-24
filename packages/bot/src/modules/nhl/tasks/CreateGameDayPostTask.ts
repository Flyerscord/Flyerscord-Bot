import Task from "@common/models/Task";
import { checkForGameDay } from "../utils/GameChecker";

export default class CreateGameDayPostTask extends Task {
  constructor() {
    // Run every day at 12:30 AM
    super("CreateGameDayPostTask", "0 30 0 * * *");
  }

  protected async execute(): Promise<void> {
    await checkForGameDay();
  }
}
