const Discord = require("discord.js")
 
module.exports = {
    name: "delete",
    description: "Rename Ticket",
    run: async (client, message, args, db, prefix) => {
        console.log('test')
         let channelcheck = await db.get(`tickets`)
        if(channelcheck && channelcheck.find(find => find.channelid == message.channel.id)) {
        let succes = new Discord.MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setDescription(`Deleting Ticket After 5 Seconds`)
      .setTimestamp()
      message.channel.send(succes)
      setTimeout(function(){ 

       message.channel.delete()
      }, 5000); 
      return;
        }
      return message.channel.send(`That's not aTicket`).then(msg => {
        msg.delete({ timeout: 5000 })
      })
    }}
