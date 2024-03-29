import Exception from "./Exception";

export class DiscordAuditSetupRequiredException extends Exception {
  constructor() {
    super("DiscordAuditSetupRequired", "You need to setup the Discord Audit logging channel before use!");
  }
}
