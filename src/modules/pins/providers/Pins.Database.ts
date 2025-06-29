import Database from "../../../common/providers/Database";
import IPin from "../interfaces/IPin";

export default class PinsDB extends Database {
  private static instance: PinsDB;

  constructor() {
    super({ name: "pins" });
  }

  static getInstance(): PinsDB {
    return this.instance || (this.instance = new this());
  }

  addPin(orignalMessageId: string, channelId: string, ogCreatedAt: Date, pinnedBy: string): IPin | undefined {
    if (!this.hasPin(orignalMessageId)) {
      const pin: IPin = {
        orignalMessageId: orignalMessageId,
        messageId: undefined,
        channelId: channelId,
        ogCreatedAt: ogCreatedAt,
        pinnedAt: new Date(),
        pinnedBy: pinnedBy,
      };

      this.db.set(orignalMessageId, pin);
      return pin;
    }
    return undefined;
  }

  updateMessageId(originalMessageId: string, messageId: string): boolean {
    if (!this.hasPin(originalMessageId)) {
      return false;
    }
    this.db.update(originalMessageId, { messageId: messageId });
    return true;
  }

  hasPin(orignalMessageId: string): boolean {
    return this.db.has(orignalMessageId);
  }

  deletePin(originalMessageId: string): boolean {
    if (!this.hasPin(originalMessageId)) {
      return false;
    }
    this.db.delete(originalMessageId);
    return true;
  }

  getPin(originalMessageId: string): IPin | undefined {
    if (!this.hasPin(originalMessageId)) {
      return undefined;
    }
    return this.db.get(originalMessageId);
  }

  getPinByMessageId(messageId: string): IPin | undefined {
    return this.db.find((pin) => pin.messageId === messageId);
  }

  getAllPins(): IPin[] {
    return this.getAllValues();
  }
}
