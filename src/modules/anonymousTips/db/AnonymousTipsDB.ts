import { ModuleDatabase } from "@common/models/ModuleDatabase";
import SecretManager from "@common/managers/SecretManager";
import { state, tipBans, tips } from "./schema";
import Time from "@common/utils/Time";
import { eq } from "drizzle-orm";

export default class AnonymousTipsDB extends ModuleDatabase {
  constructor() {
    super("AnonymousTips", state);
  }

  async addTip(userId: string, tip: string): Promise<number> {
    const secretManager = SecretManager.getInstance();
    const encryptedUserId = secretManager.encrypt(userId);

    const result = await this.db.insert(tips).values({ encryptedUserId, tip }).returning();
    return result[0].id;
  }

  async addTipBan(userId: string, tipId: number, bannedBy: string, banLength: number): Promise<void> {
    const secretManager = SecretManager.getInstance();
    const encryptedUserId = secretManager.encrypt(userId);

    await this.db.insert(tipBans).values({ encryptedUserId, bannedTip: tipId, bannedBy, expiresAt: Time.addSecondsToDate(new Date(), banLength) });
  }

  async hasTipBan(userId: string): Promise<boolean> {
    const secretManager = SecretManager.getInstance();
    const encryptedUserId = secretManager.encrypt(userId);

    const tipBan = await this.db.select().from(tipBans).where(eq(tipBans.encryptedUserId, encryptedUserId));
    if (tipBan.length === 0) {
      return false;
    }

    const timeUntil = Time.timeUntil(tipBan[0].expiresAt);
    if (timeUntil <= 0) {
      await this.removeTipBan(userId);
      return false;
    }
    return true;
  }

  private async removeTipBan(userId: string): Promise<void> {
    const secretManager = SecretManager.getInstance();
    const encryptedUserId = secretManager.encrypt(userId);

    await this.db.delete(tipBans).where(eq(tipBans.encryptedUserId, encryptedUserId));
  }

  async setupDBState(): Promise<void> {
    await this.ensureStateExists("starterMessageId", state.stringValue, "");
  }

  async setStarterMessageId(messageId: string): Promise<void> {
    await this.db.update(state).set({ stringValue: messageId }).where(eq(state.key, "starterMessageId"));
  }

  async getStarterMessageId(): Promise<string> {
    const result = await this.db.select().from(state).where(eq(state.key, "starterMessageId"));
    return result[0]?.stringValue ?? "";
  }
}
