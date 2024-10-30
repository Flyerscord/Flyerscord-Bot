import Database from "./Database";

export default class GlobalDB extends Database {
  private static instance: GlobalDB;

  private readonly COMMAND_LIST_MESSAGE_ID_KEY = "commandListMessageId";
  private readonly USER_LOG_CHANNEL_ID_KEY = "userLogChannelId";
  private readonly VISITOR_ROLE_MESSAGE_ID_KEY = "visitorRoleMessageId";

  private constructor() {
    super({ name: "global" });
    this.db.ensure(this.COMMAND_LIST_MESSAGE_ID_KEY, "");
    this.db.ensure(this.USER_LOG_CHANNEL_ID_KEY, "");
    this.db.ensure(this.VISITOR_ROLE_MESSAGE_ID_KEY, "");
  }

  static getInstance(): GlobalDB {
    return this.instance || (this.instance = new this());
  }

  /* -------------------------------------------------------------------------- */
  /*                           Command List Message ID                          */
  /* -------------------------------------------------------------------------- */

  getCommandListMessageId(): string {
    return this.db.get(this.COMMAND_LIST_MESSAGE_ID_KEY);
  }

  setCommandListMessageId(newMessageId: string): void {
    this.db.set(this.COMMAND_LIST_MESSAGE_ID_KEY, newMessageId);
  }

  /* -------------------------------------------------------------------------- */
  /*                           User Log Channel ID                              */
  /* -------------------------------------------------------------------------- */

  getUserLogChannelId(): string {
    return this.db.get(this.USER_LOG_CHANNEL_ID_KEY);
  }

  setUserLogChannelId(newChannelId: string): void {
    this.db.set(this.USER_LOG_CHANNEL_ID_KEY, newChannelId);
  }

  /* -------------------------------------------------------------------------- */
  /*                           Visitor Role Message ID                          */
  /* -------------------------------------------------------------------------- */

  getVisitorRoleMessageId(): string {
    return this.db.get(this.VISITOR_ROLE_MESSAGE_ID_KEY);
  }

  setVisitorRoleMessageId(newMessageId: string): void {
    this.db.set(this.VISITOR_ROLE_MESSAGE_ID_KEY, newMessageId);
  }
}
