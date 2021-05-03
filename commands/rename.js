const Discord = require("discord.js")
 
module.exports = {
    name: "rename",
    description: "Rename Ticket",
    run: async (client, message, args, db, prefix) => {

        let channelcheck = await db.get(`tickets`)
        if(channelcheck && channelcheck.find(find => find.channelid == message.channel.id)) {
      if(!args[0]) {
        let embed = new Discord.MessageEmbed()
        .setAuthor(client.user.tag, client.user.displayAvatarURL())
        .setDescription(`${prefix}rename <wow>`)
      .setTimestamp()
      return message.channel.send(embed);
      }
       message.channel.setName(args[0]) 
      let succes = new Discord.MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(`Ticket Renamed To ${args[0]}`)
      .setTimestamp()
      return message.channel.send(succes);
        }
      return message.channel.send(`That's not aTicket`).then(msg => {
        msg.delete({ timeout: 5000 })
      })
    }}
