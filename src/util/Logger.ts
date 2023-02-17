import Time from "./Time";

enum LOG_TYPE {
  ERROR = "ERROR",
  WARNING = "WARNING",
  DEBUG = "DEBUG",
  INFO = "INFO",
}

export default abstract class Logger {
  static error(msg: unknown, mod = ""): void {
    const type: LOG_TYPE = LOG_TYPE.ERROR;
    const outString = this.createOutputString(type, msg, mod);
    this.output(type, outString);
  }

  static warning(msg: unknown, mod = ""): void {
    const type: LOG_TYPE = LOG_TYPE.WARNING;
    const outString = this.createOutputString(type, msg, mod);
    this.output(type, outString);
  }

  static info(msg: unknown, mod = ""): void {
    const type: LOG_TYPE = LOG_TYPE.INFO;
    const outString = this.createOutputString(type, msg, mod);
    this.output(type, outString);
  }

  static debug(msg: unknown, mod = ""): void {
    const type: LOG_TYPE = LOG_TYPE.DEBUG;
    const outString = this.createOutputString(type, msg, mod);
    this.output(type, outString);
  }

  private static createOutputString(type: LOG_TYPE, msg: unknown, mod: string): string {
    if (mod) {
      return `${Time.getFormattedDate()} - ${type}(${mod}): ${msg}`;
    } else {
      return `${Time.getFormattedDate()} - ${type}: ${msg}`;
    }
  }

  private static output(logType: LOG_TYPE, outString: string): void {
    if (logType == LOG_TYPE.ERROR) {
      console.error(outString);
    } else if (logType === LOG_TYPE.WARNING) {
      console.warn(outString);
    } else if (logType === LOG_TYPE.DEBUG) {
      console.debug(outString);
    } else if (logType === LOG_TYPE.INFO) {
      console.info(outString);
    }
  }
}
