import IDaysUntilEvent from "../interfaces/IDaysUntilEvent.js";
import IEvents from "../interfaces/IEvents.js";

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

const events: IEvents = {
  tradeDeadline: tradeDeadline,
  draft: draft,
  lottery: lottery,
  season: season,
};

export default events;

export function getEventNames(): Array<string> {
  const names: Array<string> = [];

  Object.keys(events).forEach((key) => {
    const event = events[key];
    names.push(event.name);
  });

  return names;
}

export function getEventDbKeys(): Array<string> {
  const dbKeys: Array<string> = [];

  Object.keys(events).forEach((key) => {
    const event = events[key];
    dbKeys.push(event.dbKey);
  });

  return dbKeys;
}

export function getKeyByName(name: string): string | undefined {
  const keys = Object.keys(events);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (events[key].name == name) {
      return key;
    }
  }
  return undefined;
}
