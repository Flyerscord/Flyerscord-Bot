const request = require("request");
const playerIds = require("../team_info/player_ids.json");
const config = require("../config.json");

module.exports.run = (client, message, args) => {
 if (args.length == 0) {
   message.channel.send("You need to give a player's first and last name! It is caps sensitive!");
 } else {
   //args[0] = args[0].toLowerCase();
 }
 
 var fullName = "";
 for (var i = 0; i < args.length; i++) {
    if (i == args.length - 1) {
      fullName = fullName + args[i]; 
    } else {
      fullName = fullName + args[i] + " "; 
    }
  }
  message.channel.send(fullName + "'s player ID: " + playerIds[fullName]);
}
  
module.exports.help = {
  name: "pid"
}