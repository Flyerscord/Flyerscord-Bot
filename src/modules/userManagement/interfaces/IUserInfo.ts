import { IUserEvent } from "./IUserEvent.js";

export interface IUserInfo {
  userId: string;
  warnings: Array<IUserEvent>;
  notes: Array<IUserEvent>;
}
