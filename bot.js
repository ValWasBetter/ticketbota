    const Discord = require('discord.js')
   const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
   const { Database } = require("quickmongo");
   const db = new Database("");
   const hastebin = require('hastebin.js');
    const haste = new hastebin({ /* url: 'hastebin.com */ });
    const date = require('date-and-time')
    const prefix = "$"
   db.on("ready", () => {
       console.log("Database connected!");  
     });
   client.on('ready', () => {
       console.log("App Connected! " , client.user.tag)
   })
   client.commands= new Discord.Collection();

   const { join } = require('path');
   const { readdirSync } = require('fs');
   const commandFiles = readdirSync(join(__dirname, "commands")).filter(file => file.endsWith(".js"));

   for (const file of commandFiles) {
       const command = require(join(__dirname, "commands", `${file}`));
       client.commands.set(command.name , command);
   }
   
   client.on("message", async message => {
          if(message.author.bot) return;
         if(message.channel.type === 'dm') return;
     
         if(message.content.startsWith(prefix)) {
             
    
             const args = message.content.slice(prefix.length).trim().split(/ +/);
     
             const command = args.shift().toLowerCase();
     
             if(!client.commands.has(command)) return;
     
     
             try {
                 client.commands.get(command).run(client, message, args, db, prefix);
     
             } catch (error){
                 console.error(error);
             }
          }
     })
   

   client.on('messageReactionAdd', async (reaction, user) => {
       if(user.partial) await user.fetch();
       if(reaction.partial) await reaction.fetch();
       if(reaction.message.partial) await reaction.message.fetch();
     
       if (user.bot) return;
       let ticketid = await db.get(`tickets_${reaction.message.guild.id}`);
       if(!ticketid) return;
       if(reaction.message.id == ticketid && reaction.emoji.name == '🎟️') {
         db.add(`ticketnumber_${reaction.message.guild.id}`, 1)
         let ticketnumber = await db.get(`ticketnumber_${reaction.message.guild.id}`)
         if (ticketnumber === null) ticketnumber = "1"
         reaction.users.remove(user);
      
           reaction.message.guild.channels.create(`ticket-${ticketnumber}`, { 
               permissionOverwrites: [
                   {
                       id: user.id,
                       allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                   },
                   {
                       id: reaction.message.guild.roles.everyone,
                       deny: ["VIEW_CHANNEL"]
                   }
               ],
               type: 'text'
           }).then(async channel => {
             let data = {
               channelid: channel.id
             }
             db.push(`tickets`, data).then(console.log)

             channel.send(`<@${user.id}>`).then(log => {db.set(`mention_${channel.id}`, log.id)})
             db.set(`ticketauthor_${channel.id}`, user.id)
let icon = reaction.message.guild.iconURL()
             let ticketmsg = await channel.send(new Discord.MessageEmbed()
             .setTitle(`${user.username} Ticket`)
             .setDescription("Our Staff Team Will Be With you soon\nTo Close Ticket React With 🔐")
             .setFooter(reaction.message.guild.name,icon)
             .setTimestamp()
               );    
     
                 ticketmsg.react('🔐')
                 console.log(`${ticketmsg.id}`)
                 db.set(`closeticket_${channel.id}`, ticketmsg.id)
           })
       }
     });
     client.on('messageReactionAdd', async (reaction, user) => {
       if(user.partial) await user.fetch();
       if(reaction.partial) await reaction.fetch();
       if(reaction.message.partial) await reaction.message.fetch();
     
       if (user.bot) return;
       let ticketid = await db.get(`closeticket_${reaction.message.channel.id}`);
       if(!ticketid) return;
       if(reaction.message.id == ticketid && reaction.emoji.name == '🔐') {
           let author = await db.get(`ticketauthor_${reaction.message.channel.id}`)
           reaction.message.channel.updateOverwrite(author, { SEND_MESSAGES: false, VIEW_CHANNEL: false});

          db.add(`closedtickets_${reaction.message.guild.id}`, 1)
         let closednumber = await db.get(`closedtickets_${reaction.message.guild.id}`)
         reaction.message.channel.setName(`Closed-${closednumber}`)
         reaction.users.remove(user);
         let ticketfid = await db.get(`closeticket_${reaction.message.channel.id}`);
       let mention = await db.get(`mention_${reaction.message.channel.id}`)

         reaction.message.channel.messages.delete(ticketfid)
         reaction.message.channel.messages.delete(mention)

       await reaction.message.channel.send(`**Ticket Closed**`).then(async options => {
        let icon = reaction.message.guild.iconURL()

        let embed = new Discord.MessageEmbed()
       .setAuthor(user.tag, user.displayAvatarURL())
       .addField(`🔓`, 'Re-Open Ticket', true)
       .addField(`❌`, 'Delete Ticket', true)
       .addField(`📰`, 'Transcript', true)
       .setDescription(`
       `)
       .setColor('Red')
      .setFooter(reaction.message.guild.name , icon)
       .setTimestamp()
      
        options.edit(embed)
       options.react(`🔓`)
       options.react(`❌`)
       options.react(`📰`)
       db.set(`closedoptions_${reaction.message.channel.id}`, options.id).then(console.log)
       reaction.message.channel.setTopic(`Closed By ${user.tag}.`)
      
    })    
   }

   });   
   client.on('messageReactionAdd', async (reaction, user) => {
       if(user.partial) await user.fetch();
       if(reaction.partial) await reaction.fetch();
       if(reaction.message.partial) await reaction.message.fetch();
     
       if (user.bot) return;
        let ticketid = await db.get(`closedoptions_${reaction.message.channel.id}`);
       if(reaction.message.id == ticketid && reaction.emoji.name == '🔓') {
           reaction.users.remove(user)
            let wow = await db.get(`ticketnumber_${reaction.message.guild.id}`) 
            reaction.message.channel.setName(`ticket-${wow}`)

              let author = await db.get(`ticketauthor_${reaction.message.channel.id}`)
             let options = await db.get(`closedoptions_${reaction.message.channel.id}`)
           
             //reaction.users.remove(user)

          reaction.message.channel.messages.delete(options)
 reaction.message.channel.send(`<@${author}>`).then(log => {db.set(`mention_${reaction.message.channel.id}`, log.id)})
 let icon = reaction.message.guild.iconURL()
           let ticketmsg = new Discord.MessageEmbed()
           .setTitle(`Ticket Re-Opend`)
           .setDescription("Our Staff Team Will Be With you soon\nTo Close Ticket React With 🔐")
           .setFooter(reaction.message.guild.name)
           .setFooter(reaction.message.guild.name,icon)
        
           .setTimestamp()

           reaction.message.channel.send(ticketmsg).then(ticket => {
    
       ticket.react('🔐')
       db.set(`closeticket_${reaction.message.channel.id}`, ticket.id)
       reaction.message.channel.updateOverwrite(author, { SEND_MESSAGES: true, VIEW_CHANNEL: true});
       reaction.message.channel.setTopic(`Re-Opened By ${user.tag}.`) 

            })
   }
   
   });
   client.on('messageReactionAdd', async (reaction, user) => {
       if(user.partial) await user.fetch();
       if(reaction.partial) await reaction.fetch();
       if(reaction.message.partial) await reaction.message.fetch();
     
       if (user.bot) return;
       let ticketid = await db.get(`closedoptions_${reaction.message.channel.id}`);
       if(reaction.message.id == ticketid && reaction.emoji.name == '❌') {
let embed = new Discord.MessageEmbed()
.setAuthor(user.tag, user.displayAvatarURL())
.setDescription(`**Ticket Will Be Deleted After 5 Seconds**`)
.setTimestamp()
reaction.message.channel.send(embed)
db.delete(`mention_${reaction.message.channel.id}`)
db.delete(`closeticket_${reaction.message.channel.id}`)
db.delete(`closedoptions_${reaction.message.channel.id}`)
db.delete(`ticketauthor_${reaction.message.channel.id}`)
setTimeout(function(){ 

             reaction.message.channel.delete()
           }, 5000); 
       }
   });

   client.on('messageReactionAdd', async (reaction, user) => {
       if(user.partial) await user.fetch();
       if(reaction.partial) await reaction.fetch();
       if(reaction.message.partial) await reaction.message.fetch();
     
       if (user.bot) return;
       let ticketid = await db.get(`closedoptions_${reaction.message.channel.id}`);
       if(!ticketid) return;
       if(reaction.message.id == ticketid && reaction.emoji.name == '📰') {
             client.channels.cache.get(reaction.message.channel.id).messages.fetch({  limit: 100 }).then(messages => {
     
             
             
           reaction.message.channel.send(`Uploading ...`).then(o => {
               let text = `Uploaded By ${client.user.tag} \n`;
               for (let [key, value] of messages) {
                     const now = new Date();
                   let dateString = `${date.format(now, 'YYYY/MM/DD HH:mm:ss', true)}`;
                   
                    text += `${dateString} | ${value.author.tag}: ${value.content}\n`;
                      
                }
                const link = haste.post(text).then(link =>   {
               o.edit(`Uploaded!`)
               const Uploaded = new Discord.MessageEmbed()
               .setAuthor(user.tag, user.displayAvatarURL())
               .setDescription(`**This Ticket** 
               Uploaded to [HasteBin](${link})
               Uploaded By ${user.tag}`)
               .setFooter(reaction.message.guild.name , reaction.message.guild.iconURL())
               .setTimestamp()
               o.edit(Uploaded)
               reaction.users.remove(user)
 //Coded by darkboy. (Licencsed. < FAKING LINECNSE WILL GET UR ASS EXPOSED.> )
              })
       });
       })
       } 
   });
   
  
  client.login(' ')
