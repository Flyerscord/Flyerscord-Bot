import Stumper from "stumper";

export default abstract class Time {
  static getCurrentTime(): Date {
    const timeElapsed = Date.now();
    return new Date(timeElapsed);
  }

  static getCurrentFormattedDate(): string {
    const time = this.getCurrentTime();
    const month = time.getMonth() + 1;
    const day = time.getDate();
    const year = time.getFullYear();

    const hour = time.getHours();
    const minute = this.prefixZero(time.getMinutes());
    const second = this.prefixZero(time.getSeconds());
    const millisecond = time.getMilliseconds();
    return `${month}/${day}/${year} ${hour}:${minute}:${second}.${millisecond}`;
  }

  static getFormattedDate(time: Date): string {
    const month = time.getMonth() + 1;
    const day = time.getDate();
    const year = time.getFullYear();

    const hour = time.getHours();
    const minute = this.prefixZero(time.getMinutes());
    const second = this.prefixZero(time.getSeconds());
    const millisecond = time.getMilliseconds();
    return `${month}/${day}/${year} ${hour}:${minute}:${second}.${millisecond}`;
  }

  static prefixZero(number: number): number | string {
    if (number < 10) {
      return `0${number}`;
    }
    return number;
  }

  static timeSince(time: number): number {
    const currTime = this.getCurrentTime().getTime();
    const diff = currTime - time;
    if (diff < 0) {
      Stumper.warning("Given time is after the current time", "timeSince");
    }
    return diff;
  }

  static timeUntil(time: number): number {
    const currTime = this.getCurrentTime().getTime();
    const diff = time - currTime;
    if (diff < 0) {
      Stumper.warning("Given time is before the current time", "timeUntil");
    }
    return diff;
  }

  static getCurrentDate(): string {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const year = currentDate.getFullYear().toString().slice(-2);

    return `${month}/${day}/${year}`;
  }

  static getDate(time: number): Date {
    return new Date(time);
  }

  static getFormattedTimeUntil(timeUntil: number): string {
    const seconds = Math.floor(timeUntil / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const outputPieces: Array<string> = [];

    if (days > 0) {
      outputPieces.push(`${days} day${days > 1 ? "s" : ""}`);
    }

    if (hours > 0) {
      outputPieces.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    }

    if (minutes > 0) {
      outputPieces.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);
    }

    if (seconds > 0) {
      outputPieces.push(`${seconds} second${seconds > 1 ? "s" : ""}`);
    }

    return outputPieces.join(" ");
  }

  static getDateFromString(dateString: string): Date | undefined {
    const parsedDate = new Date(dateString);

    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    } else {
      return undefined;
    }
  }
}
