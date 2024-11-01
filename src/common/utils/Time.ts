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

  static getFormattedDateTimeWithoutSeconds(time: Date): string {
    const month = time.getMonth() + 1;
    const day = time.getDate();
    const year = time.getFullYear();

    const hour = time.getHours();
    const minute = this.prefixZero(time.getMinutes());

    let hour12 = hour % 12;
    hour12 = hour12 ? hour12 : 12; // the hour '0' should be '12'

    const amPm = hour >= 12 ? "PM" : "AM";

    return `${month}/${day}/${year} ${hour12}:${minute} ${amPm}`;
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
      Stumper.warning("Given time is after the current time", "common:Time:timeSince");
    }
    return diff;
  }

  static timeUntil(time: number): number {
    const currTime = this.getCurrentTime().getTime();
    const diff = time - currTime;
    if (diff < 0) {
      Stumper.warning("Given time is before the current time", "common:Time:timeUntil");
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
    const days = Math.floor(timeUntil / (1000 * 60 * 60 * 24));
    timeUntil %= 1000 * 60 * 60 * 24;

    const hours = Math.floor(timeUntil / (1000 * 60 * 60));
    timeUntil %= 1000 * 60 * 60;

    const minutes = Math.floor(timeUntil / (1000 * 60));
    timeUntil %= 1000 * 60;

    const seconds = Math.floor(timeUntil / 1000);

    const dayStr = days === 1 ? "day" : "days";
    const hourStr = hours === 1 ? "hour" : "hours";
    const minuteStr = minutes === 1 ? "minute" : "minutes";
    const secondStr = seconds === 1 ? "second" : "seconds";

    return `${days} ${dayStr}, ${hours} ${hourStr}, ${minutes} ${minuteStr}, ${seconds} ${secondStr}`;
  }

  static getDateFromString(dateString: string): Date | undefined {
    const parsedDate = new Date(dateString);

    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    } else {
      return undefined;
    }
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear();
  }

  static getFormattedTimeFromMilliseconds(milliseconds: number): string {
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
    milliseconds %= 24 * 60 * 60 * 1000;
    const hours = Math.floor(milliseconds / (60 * 60 * 1000));
    milliseconds %= 60 * 60 * 1000;
    const minutes = Math.floor(milliseconds / (60 * 1000));
    milliseconds %= 60 * 1000;
    const seconds = Math.floor(milliseconds / 1000);
    milliseconds %= 1000;

    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds) parts.push(`${seconds}s`);
    if (milliseconds) parts.push(`${milliseconds}ms`);

    return parts.join(" ");
  }
}
