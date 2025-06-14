export default interface IPin {
  orignalMessageId: string;
  messageId: string | undefined;
  channelId: string;
  ogCreatedAt: Date;
  pinnedAt: Date;
  pinnedBy: string;
}
