module.exports.run = (client, message, args) => {
    message.channel.send("I am online!");
}

module.exports.help = {
    name: "hello"
}