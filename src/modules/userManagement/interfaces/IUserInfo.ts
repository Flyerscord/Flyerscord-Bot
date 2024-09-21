import { IUserEvent } from "./IUserEvent";

export interface IUserInfo {
    userId: string;
    warnings: Array<IUserEvent>;
    notes: Array<IUserEvent>;
}