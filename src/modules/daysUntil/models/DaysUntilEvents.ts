import IDaysUntilEvent from "../interfaces/IDaysUntilEvent";
import IEvents from "../interfaces/IEvents";

const tradeDeadline: IDaysUntilEvent = {
  name: "NHL Trade Deadline",
  dbKey: "tradeDeadline",
  daysUntilMessage: "The NHL Trade Deadline is in **{time}**!",
  pastMessage: "The NHL Trade Deadline has passed!",
  exactMessage: "The NHL Trade Deadle is now!",
};

const draft: IDaysUntilEvent = {
  name: "NHL Draft",
  dbKey: "draft",
  daysUntilMessage: "The NHL Draft is in **{time}**!",
  pastMessage: "The NHL Draft has passed!",
  exactMessage: "The NHL Draft is starting now!",
};

const lottery: IDaysUntilEvent = {
  name: "NHL Lottery",
  dbKey: "lottery",
  daysUntilMessage: "The NHL Lottery is in **{time}**!",
  pastMessage: "The NHL Lottery has passed!",
  exactMessage: "The NHL Lottery is starting now!",
};

const season: IDaysUntilEvent = {
  name: "NHL Season",
  dbKey: "season",
  daysUntilMessage: "The NHL Season starts in **{time}**!",
  pastMessage: "The NHL Season has started!",
  exactMessage: "The NHL Season is starting now!",
};

export const events: IEvents = {
  tradeDeadline: tradeDeadline,
  draft: draft,
  lottery: lottery,
  season: season,
};

export function getEventNames(): string[] {
  const names: string[] = [];

  Object.keys(events).forEach((key) => {
    const event = events[key];
    names.push(event.name);
  });

  return names;
}
