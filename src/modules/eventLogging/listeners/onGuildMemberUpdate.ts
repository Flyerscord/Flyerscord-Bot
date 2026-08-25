import ClientManager from "@common/managers/ClientManager";
import { getBoostEmbed, getNicknameChangeEmbed, getRoleChangeEmbed, getTimeoutEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the guildMemberUpdate listener that logs nickname changes, role changes,
 * timeout applied/removed, and boost start/stop. Only fields that actually changed emit a log entry,
 * since Discord fires this event for many incidental/unrelated member updates.
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    if (oldMember.nickname !== newMember.nickname) {
      const embed = getNicknameChangeEmbed(newMember, oldMember.nickname, newMember.nickname);
      logEvent("nicknameChanged", embed, newMember.id);
    }

    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;
    const addedRoles = newRoles.filter((role) => !oldRoles.has(role.id)).map((role) => role);
    const removedRoles = oldRoles.filter((role) => !newRoles.has(role.id)).map((role) => role);
    if (addedRoles.length > 0 || removedRoles.length > 0) {
      const embed = getRoleChangeEmbed(newMember, addedRoles, removedRoles);
      logEvent("rolesChanged", embed, newMember.id, {
        added: addedRoles.map((role) => role.id),
        removed: removedRoles.map((role) => role.id),
      });
    }

    const oldTimeout = oldMember.communicationDisabledUntilTimestamp ?? null;
    const newTimeout = newMember.communicationDisabledUntilTimestamp ?? null;
    if (oldTimeout !== newTimeout) {
      const applied = newTimeout != null && newTimeout > Date.now();
      const embed = getTimeoutEmbed(newMember, applied, newTimeout);
      logEvent(applied ? "timeoutApplied" : "timeoutRemoved", embed, newMember.id);
    }

    const oldBoost = oldMember.premiumSinceTimestamp ?? null;
    const newBoost = newMember.premiumSinceTimestamp ?? null;
    if (oldBoost !== newBoost) {
      const started = newBoost != null;
      const embed = getBoostEmbed(newMember, started);
      logEvent(started ? "boostStarted" : "boostStopped", embed, newMember.id);
    }
  });
};
