import { EmbedBuilder, embedLength } from "discord.js";
import { Singleton } from "@common/models/Singleton";
import ConfigManager from "@common/managers/ConfigManager";
import discord from "@common/utils/discord/discord";
import Stumper from "stumper";

const MAX_EMBEDS_PER_MESSAGE = 10;
const MAX_EMBED_CHARACTERS_PER_MESSAGE = 6000;

/**
 * A FIFO queue of pending event log embeds, drained on an interval and flushed to the configured
 * log channel in batches (up to Discord's 10-embeds/6000-characters-per-message limits) instead
 * of one message per event, so a burst of events doesn't spam the channel with rapid-fire messages.
 */
export default class EventLogQueue extends Singleton {
  private queue: EmbedBuilder[] = [];
  private intervalHandle: NodeJS.Timeout | undefined;

  constructor() {
    super();
  }

  /**
   * Adds an embed to the back of the queue to be sent on the next drain.
   * @param embed - The embed to enqueue
   */
  enqueue(embed: EmbedBuilder): void {
    this.queue.push(embed);
  }

  /**
   * Starts draining the queue on the given interval.
   * @param intervalSeconds - How often, in seconds, to drain the queue
   */
  start(intervalSeconds: number): void {
    this.intervalHandle = setInterval(() => void this.drain(), intervalSeconds * 1000);
  }

  /**
   * Stops draining the queue.
   */
  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = undefined;
    }
  }

  /**
   * Sends all currently queued embeds to the log channel, batched to stay within Discord's
   * per-message embed limits. A batch that fails to send is dropped (not retried), since the
   * audit log entry for each event was already recorded independently of this queue.
   */
  private async drain(): Promise<void> {
    if (this.queue.length === 0) return;

    const logChannelId = ConfigManager.getInstance().getConfig("EventLogging").logChannelId;

    while (this.queue.length > 0) {
      const batch: EmbedBuilder[] = [];
      let characterCount = 0;

      while (this.queue.length > 0 && batch.length < MAX_EMBEDS_PER_MESSAGE) {
        const next = this.queue[0];
        const nextLength = embedLength(next.toJSON());
        if (batch.length > 0 && characterCount + nextLength > MAX_EMBED_CHARACTERS_PER_MESSAGE) break;

        batch.push(next);
        characterCount += nextLength;
        this.queue.shift();
      }

      try {
        await discord.messages.sendEmbedsToChannel(logChannelId, batch);
      } catch (error) {
        Stumper.caughtError(error, "eventLogging:EventLogQueue:drain");
      }
    }
  }
}
