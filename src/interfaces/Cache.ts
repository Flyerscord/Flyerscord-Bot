export interface IDaysUtilCache {
  name: string;
  date: IDate | IDateWithTime;
}

export interface IDateWithTime {
  month: number;
  day: number;
  year: number;

  hour: number;
  minute: number;
}

export interface IDate {
  month: number;
  day: number;
  year: number;
}
