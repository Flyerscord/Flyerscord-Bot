const { JsonStorage, config } = require("json-storage-fs");
const _config = require("../common/config.js");

// Create the database
config({ catalog: "../../data/" });

var vistorEmoji = _config.vistorReactRole.visitorEmoji;

module.exports.sendVisitorReactionMessage = async () => {
  let embed = {
    title: "Visitor Role Selection",
    description: `${vistorEmoji} Get the Visitor Role (Everyone else will get the member role)`,
  };
  var message = await globals.client.channels.cache
    .get(rolesChannelId)
    .send({ embed: embed });
  JsonStorage.set("visitorMessageID", message.id);
  message.react(vistorEmoji);
};
