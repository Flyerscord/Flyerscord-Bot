import Exception from "../models/Exception";

export class DiscordAuditSetupRequiredException extends Exception {
  constructor() {
    super("DiscordAuditSetupRequired", "You need to setup the Discord Audit logging before use!");
  }
}
