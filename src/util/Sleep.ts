export default class Sleep {
  static async ms(milliseconds: number): Promise<void> {
    return await new Promise((r) => setTimeout(r, milliseconds));
  }

  static async sec(seconds: number): Promise<void> {
    return await this.ms(seconds * 1000);
  }
}
