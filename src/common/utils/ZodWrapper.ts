import { z } from "zod";
import SecretManager from "../managers/SecretManager";

export default class ZodWrapper {
  static string(minLength: number = 1): z.ZodType {
    return z.string().min(minLength);
  }

  static encryptedString(): z.ZodType {
    return z.string().transform((val) => SecretManager.getInstance().decrypt(val));
  }

  static number(options: { min?: number; max?: number }): z.ZodType {
    if (options.min && options.max) {
      return z.number().min(options.min).max(options.max);
    }
    if (options.min) {
      return z.number().min(options.min);
    }
    if (options.max) {
      return z.number().max(options.max);
    }
    return z.number();
  }

  static boolean(): z.ZodType {
    return z.boolean();
  }
}
