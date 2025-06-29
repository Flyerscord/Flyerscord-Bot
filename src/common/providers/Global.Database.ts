import Database from "./Database";

export default class GlobalDB extends Database {
  private readonly COMMAND_LIST_MESSAGE_ID_KEY = "commandListMessageId";
  private readonly VISITOR_ROLE_MESSAGE_ID_KEY = "visitorRoleMessageId";

  constructor() {
    super({ name: "global" });
    this.ensure(this.COMMAND_LIST_MESSAGE_ID_KEY, "");
    this.ensure(this.VISITOR_ROLE_MESSAGE_ID_KEY, "");
  }

  /* -------------------------------------------------------------------------- */
  /*                           Command List Message ID                          */
  /* -------------------------------------------------------------------------- */
  getCommandListMessageIds(): string[] {
    return this.db.get(this.COMMAND_LIST_MESSAGE_ID_KEY);
  }

  addCommandListMessageId(newMessageId: string): void {
    this.db.push(this.COMMAND_LIST_MESSAGE_ID_KEY, newMessageId);
  }

  removeAllCommandListMessageIds(): void {
    this.db.set(this.COMMAND_LIST_MESSAGE_ID_KEY, []);
  }

  removeCommandListMessageId(messageId: string): void {
    this.db.remove(this.COMMAND_LIST_MESSAGE_ID_KEY, messageId);
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
