export default interface ICustomCommand {
  name: string; // The initiator of the command
  text: string; // Text to be sent by the command
  createdOn: Date;
  createdBy: string; // Discord User ID
}
