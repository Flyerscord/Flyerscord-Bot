import { ModuleDatabase } from "@common/models/ModuleDatabase";
import { eq } from "drizzle-orm";
import { claimRoleAllowlist } from "./schema";

export default class ClaimRoleDB extends ModuleDatabase {
  constructor() {
    super("ClaimRole");
  }

  async isUserAllowed(discordUserId: string): Promise<boolean> {
    return this.select1(claimRoleAllowlist, eq(claimRoleAllowlist.discordUserId, discordUserId));
  }
}
