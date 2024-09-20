export default interface ICustomCommand {
  name: string; // The initiator of the command
  text: string; // Text to be sent by the command
  createdOn: Date;
  createdBy: string; // Discord User ID
  history: Array<ICustomCommandHistory>;
}

export interface ICustomCommandHistory {
  oldText: string;
  newText: string;
  editedOn: Date;
  editedBy: string; // Discord User ID
}
