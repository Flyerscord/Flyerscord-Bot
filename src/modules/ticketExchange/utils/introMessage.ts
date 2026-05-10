import discord from "@common/utils/discord/discord";
import TicketExchangeDB from "../db/TicketExchangeDB";
import ConfigManager from "@common/managers/ConfigManager";
import Stumper from "stumper";
import { ButtonStyle, Message } from "discord.js";

export async function sendOrUpdateIntroMessage(): Promise<void> {
  const db = new TicketExchangeDB();
  const config = ConfigManager.getInstance().getConfig("TicketExchange");

  let startPostId = await db.getStartPostId();

  const NUMBER_OF_BUTTONS = 3;

  let updateMessage = false;
  let firstMessage: Message | null = null;

  if (startPostId !== "") {
    const startPost = await discord.threads.getThread(startPostId);
    if (!startPost) {
      Stumper.error(`Could not find start post with ID ${startPostId}`, "ticketExchange:introMessage:sendOrUpdateIntroMessage");
      return;
    }

    firstMessage = await startPost.fetchStarterMessage();
    if (!firstMessage) {
      Stumper.error(`Could not fetch first message from start post with ID ${startPostId}`, "ticketExchange:introMessage:sendOrUpdateIntroMessage");
      return;
    }

    if (firstMessage.content !== config.startPostMessage || firstMessage.components.length !== NUMBER_OF_BUTTONS) {
      updateMessage = true;
    }
  }

  if (startPostId === "" || updateMessage) {
    // Create buttons
    const createNewPostingButton = discord.buttons.createButton("TicketExchange", "createNewPosting", "Create New Posting", ButtonStyle.Primary);
    const sthVerificationButton = discord.buttons.createButton("TicketExchange", "sthVerification", "STH Verification", ButtonStyle.Secondary);
    const newPostNotificationButton = discord.buttons.createButton(
      "TicketExchange",
      "newPostNotification",
      "New Post Notification",
      ButtonStyle.Secondary,
    );

    const buttonRow = discord.buttons.createRow([createNewPostingButton, sthVerificationButton, newPostNotificationButton]);

    if (startPostId === "") {
      // Need to create the post and set the startPostId
      const startPost = await discord.forums.createPost(
        config.forumId,
        "START HERE",
        { content: config.startPostMessage, components: [buttonRow] },
        [],
        "Creating start post for ticket exchange",
      );
      if (!startPost) {
        Stumper.error("Could not create start post", "ticketExchange:introMessage:sendOrUpdateIntroMessage");
        return;
      }

      await db.setStartPostId(startPost.id);

      // Pin the post
      await discord.forums.pinPost(config.forumId, startPost.id);
    } else {
      // Update the post
      if (!firstMessage) {
        Stumper.error(`Could not fetch first message from start post with ID ${startPostId}`, "ticketExchange:introMessage:sendOrUpdateIntroMessage");
        return;
      }
      await firstMessage.edit({ content: config.startPostMessage, components: [buttonRow] });
    }
  }
}
