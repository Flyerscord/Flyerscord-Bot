module.exports.run = async (client, message, args) => {
  var reactMsgId = "884850958985748500";
  var annouceId = "799094245809455164";

  const up = "👍";
  const down = "👎";

  const fantasyRole = "353747870765285387";

  if (message.channel.id != "413248253522345984") return;

  var channel = message.guild.channels.cache.find((c) => c.id == annouceId);

  channel.messages.fetch(reactMsgId).then(async (message) => {
    var upReacts = message.reactions.cache.find((r) => r.emoji.name === up);
    var downReacts = message.reactions.cache.find((r) => r.emoji.name === down);
    // console.log(upReacts);

    var upUsers = await upReacts.users.fetch();
    var downUsers = await downReacts.users.fetch();

    upUsers.each(async (user) => {
      if (downUsers.find((u) => u.id === user.id)) {
        console.log(`${user.username} reacted to both`);
      } else {
        var member = await message.guild.members.fetch(user.id);
        member.roles.add(fantasyRole);
        console.log(`${user.username} added to fantasy role`);
      }
    });
  });
};

module.exports.help = {
  name: "fantRole",
};
