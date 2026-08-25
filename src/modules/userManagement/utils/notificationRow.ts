import { ActionRowBuilder, ButtonBuilder, MessageActionRowComponentBuilder } from "discord.js";
import ViewHistoryButton from "../commands/buttons/ViewHistoryButton";
import CopyUserIdButton from "../commands/buttons/CopyUserIdButton";

/**
 * Builds the action row attached to warning/note notification posts, letting moderators jump straight
 * to the target user's history or grab their raw user ID from the notification itself. Each button's
 * customId is `<handlerName>-<userId>` so the shared handler (registered under `<handlerName>`) can
 * recover the target user at click time via `getDataFromId`.
 * @param userId - The Discord user ID the notification is about
 */
export function getNotificationRow(userId: string): ActionRowBuilder<MessageActionRowComponentBuilder> {
  const viewHistoryButton = ButtonBuilder.from(new ViewHistoryButton().button).setCustomId(`${new ViewHistoryButton().name}-${userId}`);
  const copyUserIdButton = ButtonBuilder.from(new CopyUserIdButton().button).setCustomId(`${new CopyUserIdButton().name}-${userId}`);

  return new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(viewHistoryButton, copyUserIdButton);
}
