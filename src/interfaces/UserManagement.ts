export interface IUserInfo {
  userId: string;
  warnings: Array<IUserEvent>;
  mutes: Array<IUserEvent>;
  notes: Array<IUserEvent>;
}

export interface IUserEvent {
  reason: string;
  date: number;
}
