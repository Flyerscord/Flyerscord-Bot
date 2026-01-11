export default class Env {
  static get(key: string): string | undefined {
    return process.env[key];
  }

  static has(key: string): boolean {
    return !!process.env[key];
  }

  static getBoolean(key: string): boolean | undefined {
    const value = this.get(key);
    if (!value) {
      return undefined;
    }
    return value.toLowerCase() === "true";
  }
}
