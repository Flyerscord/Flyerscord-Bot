import crypto from "node:crypto";
import Stumper from "stumper";
import { Singleton } from "../models/Singleton";
import Env from "../utils/Env";

export default class SecretManager extends Singleton {
  private algorithm = "aes-256-gcm";
  private key: Buffer;

  constructor() {
    super();
    const keyString = Env.get("ENCRYPTION_KEY")!;

    this.key = crypto.scryptSync(keyString, "discord-bot-salt", 32);
  }

  encrypt(value: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv) as crypto.CipherGCM;

    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  }

  decrypt(value: string): string {
    try {
      const parts = value.split(":");
      if (parts.length !== 3) {
        throw new Error("Invalid encrypted value");
      }

      const [ivHex, authTagHex, encrypted] = parts;
      const iv = Buffer.from(ivHex, "hex");
      const authTag = Buffer.from(authTagHex, "hex");

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv) as crypto.DecipherGCM;
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      Stumper.caughtError(error, "Common::SecretManager::decrypt");
      throw new Error(`Failed to decrypt value: ${value}`);
    }
  }

  isEncrypted(value: string): boolean {
    return /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/i.test(value);
  }
}
