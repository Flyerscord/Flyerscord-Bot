import EphemeralTask from "@common/models/EphemeralTask";
import FantasyDB from "../db/FantasyDB";
import { closeSeason } from "../utils/closeSeason";
import Stumper from "stumper";

export default class SeasonCloseTask extends EphemeralTask {
  constructor() {
    super("FantasySeasonCloseTask");
  }

  /**
   * Closes the currently open Fantasy season once its signup deadline is reached.
   */
  protected async execute(): Promise<void> {
    const db = new FantasyDB();
    const season = await db.getOpenSeason();
    if (!season) {
      Stumper.warning("FantasySeasonCloseTask fired but no open season was found", "fantasy:SeasonCloseTask:execute");
      return;
    }

    await closeSeason(season.id);
  }
}
