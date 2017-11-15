const Discord = require("discord.js");
const Commando = require("discord.js-commando");
const config = require("./config.json");
const db = require("sqlite");


// Connecting the bot
//const bot = new Discord.Client();
const bot = new Commando.Client();
bot.registry.registerGroup('random', 'Random' );
bot.registry.registerDefaults();
bot.registry.registerCommandsIn(__dirname + "/commands");

//connecting the database
db.open("./repository/score.sqlite");

const prefix = "+";
bot.on('message', (message) => {
    if(message.author.bot) return;
    if(message.channel.type != 'text') return;
    if(message.content.startsWith("ping")) {
        message.reply("pong!");
    }
    if(message.content == prefix +"info") {
        message.reply( "seu username: " + message.author.username + " seu id: " + message.author.id);
    }
    if (message.content == prefix + "emote") {
        message.channel.send(":sob:");
    }

    db.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
        if (!row) {
          db.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
        } else {
          let curLevel = Math.floor(1.0 * Math.sqrt(row.points + 1));
          if (curLevel > row.level) {
            row.level = curLevel;
            db.run(`UPDATE scores SET points = ${row.points + 1}, level = ${row.level} WHERE userId = ${message.author.id}`);
            message.reply(`Voce upou para o level: **${curLevel}**! Deus garena te perdoe`);
          }
          db.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
        }
      }).catch(() => {
        console.error;
        db.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)").then(() => {
          db.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
        });
      });
    
      if (!message.content.startsWith(prefix)) return;
    
      if (message.content.startsWith(prefix + "level")) {
        db.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
          if (!row) return message.reply("Your current level is 0");
          message.reply(`Your current level is ${row.level}`);
        });
      } else
    
      if (message.content.startsWith(prefix + "farm")) {
        db.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
          if (!row) return message.reply("sadly you do not have any points yet!");
          message.reply(`Famô? Quantos creepa? ${row.points}!`);
        });
      } else

      if(message.content.startsWith(prefix + "scores")) {
        let query = `SELECT * FROM scores ORDER BY points`;
        db.all(query).then(rows => {
          if (!rows) return message.reply("Scores not founded!");
          rows.forEach((row) => {
            message.reply(`id: ${row.userId}, level: ${row.level}, points: ${row.points}!`);
          });
        });
      }

});


bot.login(config.token);

