import { ModuleDatabase } from "@common/models/ModuleDatabase";
import SecretManager from "@common/managers/SecretManager";
import { eq } from "drizzle-orm";
import { tickets, ticketButtonMessages } from "./schema";

export default class TicketsDB extends ModuleDatabase {
  constructor() {
    super("Tickets");
  }

  /**
   * Stores a new ticket, encrypting the submitter's user ID before it touches the database.
   * @param type - The ticket type (e.g. "tip")
   * @param content - The ticket content submitted by the user
   * @param userId - The Discord user ID of the submitter, encrypted before storage
   * @returns The ID of the newly created ticket
   */
  async createTicket(type: string, content: string, userId: string): Promise<string> {
    const encryptedUserId = SecretManager.getInstance().encrypt(userId);
    const [row] = await this.db.insert(tickets).values({ type, content, encryptedUserId }).returning({ id: tickets.id });
    return row.id;
  }

  /**
   * Checks whether a persistent button message has already been posted for the given ticket type.
   * @param type - The ticket type
   * @returns True if a button message is recorded for this type
   */
  async hasButtonMessage(type: string): Promise<boolean> {
    return this.select1(ticketButtonMessages, eq(ticketButtonMessages.type, type));
  }

  /**
   * Gets the channel and message ID of the persistent button message for a ticket type, if one exists.
   * @param type - The ticket type
   * @returns The channel and message ID, or undefined if none is recorded
   */
  async getButtonMessage(type: string): Promise<{ channelId: string; messageId: string } | undefined> {
    return this.getSingleRow(ticketButtonMessages, eq(ticketButtonMessages.type, type));
  }

  /**
   * Records (or updates) which channel/message holds the persistent submission button for a ticket type.
   * @param type - The ticket type
   * @param channelId - The channel the button message was posted in
   * @param messageId - The ID of the posted button message
   */
  async setButtonMessage(type: string, channelId: string, messageId: string): Promise<void> {
    await this.db
      .insert(ticketButtonMessages)
      .values({ type, channelId, messageId })
      .onConflictDoUpdate({ target: ticketButtonMessages.type, set: { channelId, messageId } });
  }
}
