import { IUserEvent } from "./IUserEvent";

export interface IUserInfo {
  userId: string;
  warnings: IUserEvent[];
  notes: IUserEvent[];
}
