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
  getCommandListMessageId(): string {
    return this.db.get(this.COMMAND_LIST_MESSAGE_ID_KEY);
  }

  setCommandListMessageId(newMessageId: string): void {
    this.db.set(this.COMMAND_LIST_MESSAGE_ID_KEY, newMessageId);
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
