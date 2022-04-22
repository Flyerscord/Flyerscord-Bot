module.exports.run = async (client, message, args) => {
    let role = message.guild.roles.find(r => r.name == 'Fuck Cancer');

    if (!role) 
        return message.channel.send(`**${message.author.username}**, role not found`);

    message.guild.members.filter(m => !m.user.bot).forEach(member => {
        massRole(member, role);
    });
    message.channel.send(`**${message.author.username}**, role **${role.name}** was added to all members`);
}

module.exports.help = {
    name: "roleassign"
}

async function massRole(user, role) {
    user.addRole(role);
}