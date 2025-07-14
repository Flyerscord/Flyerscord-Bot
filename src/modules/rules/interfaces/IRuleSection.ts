export interface IRuleSection {
  name: string;
  headerUrl: string;
  headerMessageId: string;
  contentPages: IRuleSectionPage[];
}

export interface IRuleSectionPage {
  messageId: string;
  content: string;
}
