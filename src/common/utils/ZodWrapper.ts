import { z } from "zod";
import SecretManager from "../managers/SecretManager";

export default class ZodWrapper {
  static string(options?: { min?: number; max?: number }): z.ZodString {
    const defaultType = z.string().min(1);

    if (!options || (!options.min && !options.max)) {
      return defaultType;
    }

    if (options.min && options.max) {
      if (options.max < options.min) {
        return defaultType;
      }

      if (options.min < 1) {
        return z.string().min(1).max(options.max);
      }

      if (options.min == options.max) {
        return z.string().length(options.min);
      }

      return z.string().min(options.min).max(options.max);
    }

    if (options.min && options.min >= 1) {
      return z.string().min(options.min);
    }

    if (options.max && options.max >= 1) {
      return z.string().max(options.max);
    }

    return defaultType;
  }

  static encryptedString(): z.ZodType {
    return z.string().transform((val) => SecretManager.getInstance().decrypt(val));
  }

  static number(options?: { min?: number; max?: number }): z.ZodNumber {
    const defaultType = z.number();

    if (!options) {
      return defaultType;
    }

    if (options.min && options.max) {
      return z.number().min(options.min).max(options.max);
    }

    if (options.min) {
      return z.number().min(options.min);
    }

    if (options.max) {
      return z.number().max(options.max);
    }

    return defaultType;
  }
}
