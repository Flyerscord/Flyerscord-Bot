export default {
  common: {
    productionMode: false,
    token: "",
    logLevel: 3,
    masterGuildId: "",
    adminPrefix: ".",
    advancedDebug: false,
  },
  admin: {
    ub3rBot: {
      userId: "",
      alertChannelId: "",
    },
  },
  bluesky: {
    username: "",
    password: "",
    channelId: "",
    listId: "",
  },
  customcommands: {
    prefix: "!",
    commandTempChannelId: "",
    customCommandListChannelId: "",
    imageKit: {
      publicKey: "",
      privateKey: "",
      urlEndpoint: "",
      redirectUrl: "",
      proxyUrl: "",
    },
    imgur: {
      clientId: "",
      clientSecret: "",
    },
  },
  daysuntil: {},
  gamedayposts: {
    channelId: "",
    tagIds: {
      preseason: "",
      regularSeason: "",
      postSeason: "",
      seasons: [],
    },
  },
  healthcheck: {},
  imageproxy: {},
  joinleave: {
    channelId: "",
  },
  levels: {},
  misc: {},
  nhl: {},
  pins: {
    channelId: "",
  },
  playeremojis: {},
  reactionrole: {
    channelId: "",
    reactionRoles: [],
  },
  registercommands: {},
  rules: {
    channelId: "",
    sections: ["Welcome", "Rules", "Staff", "Roles", "Channels", "Servers"],
  },
  statsvoicechannel: {
    channels: [],
  },
  usermanagement: {
    channelId: "",
  },
  visitorrole: {
    memberRoleId: "",
    visitorRoleId: "",
    visitorEmojiId: "",
    rolesChannelId: "",
  },
};
