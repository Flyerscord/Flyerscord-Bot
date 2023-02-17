const logging = require("../lib/common/logging");

module.exports.run = async (client, message, args) => {
    const roleName = "Member;"
    const role = message.guild.roles.find(r => r.name == roleName);

    if (!role) 
        return message.channel.send(`Role not found!`);

    const members = message.guild.members.filter(m => !m.user.bot);
    for (let i = 0; i < members.length; i++) {
        const member = members[i];
        if (member.roles.cache.size == 0) {
            await new Promise(r => setTimeout(r, 2000));
            member.addRole(role);
            logging.logEvent(`Added ${roleName} role for ${member.displayName}`);
        }
        message.channel.send("Done adding roles!");
    }
}

module.exports.help = {
    name: "roleassign"
}