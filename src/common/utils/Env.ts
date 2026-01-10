export default class Env {
  static get(key: string): string | undefined {
    return process.env[key];
  }

  static has(key: string): boolean {
    return !!process.env[key];
  }
}
