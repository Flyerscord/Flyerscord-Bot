export interface IAuditLogInfo {
  oldText: string;
  newText: string;
  commandName: string;
  commandId: number;
}

export enum CustomCommandsActionType {
  ADD = "ADD",
  DELETE = "DELETE",
  EDIT = "EDIT",
}
