import ClientManager from "@common/managers/ClientManager";
import { getVoiceStateEmbed } from "../utils/Embeds";
import logEvent from "../utils/logEvent";

/**
 * Registers the voiceStateUpdate listener that logs voice channel joins, leaves, moves,
 * and mute/deafen/stream toggles. These are independent, non-exclusive checks since a single
 * voiceStateUpdate event can carry more than one change at once (e.g. a move that also mutes).
 */
export default (): void => {
  const client = ClientManager.getInstance().client;
  client.on("voiceStateUpdate", async (oldState, newState) => {
    const userId = newState.member?.id ?? oldState.member?.id;

    if (!oldState.channelId && newState.channelId) {
      const embed = getVoiceStateEmbed("Voice Channel Joined", newState, `Joined ${newState.channel}`);
      logEvent("voiceJoined", embed, userId, { channelId: newState.channelId });
    } else if (oldState.channelId && !newState.channelId) {
      const embed = getVoiceStateEmbed("Voice Channel Left", oldState, `Left ${oldState.channel}`);
      logEvent("voiceLeft", embed, userId, { channelId: oldState.channelId });
    } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      const embed = getVoiceStateEmbed("Voice Channel Moved", newState, `Moved from ${oldState.channel} to ${newState.channel}`);
      logEvent("voiceMoved", embed, userId, {
        fromChannelId: oldState.channelId,
        toChannelId: newState.channelId,
      });
    }

    if (oldState.selfMute !== newState.selfMute) {
      const embed = getVoiceStateEmbed("Voice Mute Toggled", newState, `${newState.selfMute ? "Muted" : "Unmuted"} themselves`);
      logEvent("voiceMuteToggled", embed, userId, { muted: Boolean(newState.selfMute) });
    }

    if (oldState.selfDeaf !== newState.selfDeaf) {
      const embed = getVoiceStateEmbed("Voice Deafen Toggled", newState, `${newState.selfDeaf ? "Deafened" : "Undeafened"} themselves`);
      logEvent("voiceDeafenToggled", embed, userId, { deafened: Boolean(newState.selfDeaf) });
    }

    if (oldState.streaming !== newState.streaming) {
      const embed = getVoiceStateEmbed("Voice Stream Toggled", newState, `${newState.streaming ? "Started" : "Stopped"} streaming`);
      logEvent("voiceStreamToggled", embed, userId, { streaming: Boolean(newState.streaming) });
    }
  });
};
