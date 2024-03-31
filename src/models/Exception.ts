export default abstract class Exception {
  readonly name: string;
  readonly reason: string;

  constructor(name: string, reason: string) {
    this.name = name;
    this.reason = reason;
  }
}
