import ClientManager from "@common/managers/ClientManager";
import Stumper from "stumper";
import FantasyDB from "../db/FantasyDB";
import { updateSignupMessage } from "../utils/signupMessage";

/**
 * Removes a user's Fantasy signup (skill level and/or commissioner) if they leave the server while
 * signups are still open. Doesn't touch anything once signups have closed - by then a signup can only
 * be removed via `/fantasyseason move` or admin cleanup, matching how `LeaveSignupButton` is scoped.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberRemove", async (member) => {
    const db = new FantasyDB();
    const season = await db.getOpenSeason();
    if (!season) {
      return;
    }

    const removedSignup = await db.removeSignup(season.id, member.user.id);
    const removedCommissioner = await db.removeCommissionerSignup(season.id, member.user.id);
    if (!removedSignup && !removedCommissioner) {
      return;
    }

    Stumper.info(`Removed Fantasy signup(s) for ${member.user.id} after they left the server`, "fantasy:onGuildMemberRemove:onGuildMemberRemove");

    await updateSignupMessage(season);
  });
};
