let config = require("./config.js");
let SDClient = require('./client.js');
let Discord = require('discord.js');
let globaljs = require('./global.js');
let globalranks = require('./ranks.js');

//Check if details have been entered
if (config.prefix === 'PREFIX' || config.nickName === 'USERNAME' || config.pass === 'PASSWORD' || config.token === 'TOKEN' || config.owner === 'OWNER' || !admin[0]) {
  console.log('Please fill in the required details in config.js (prefix, nickName, pass, token, owner) and in ranks.js (admin).');
  process.exit();
}

global.useDiscord = true;
if (config.token === '')  useDiscord = false;

function loadFunctions() {
	global.Commands = {};
	global.Parse = require('./parser.js').parse;
	var commandFiles = fs.readdirSync('./commands/');
	for (var i = 0; i < commandFiles.length; i++) {
		try {
			Object.merge(Commands, require('./commands/' + commandFiles[i]).commands);
			ok('Loaded command files: ' + commandFiles[i])
		}
		catch (e) {
			error('Unable to load command files: ' + commandFiles[i]);
			console.log(e.stack)
		}
	}
}

let options = {
  serverid: config.serverid,
  loginServer: 'https://play.pokemonshowdown.com/~~' + config.serverid +'/action.php',
  nickName: config.nickName,
  pass: config.pass,
  autoJoin: config.autoJoin
};
let Bot = new SDClient(config.server, config.port, options);
Bot.connect();

let client = '';


if (useDiscord) {
  client = new Discord.Client();
  client.login(config.token);

  client.on("ready", () => {
    console.log(`Connected to Discord.`); 
    client.user.setActivity('Pokémon Showdown');
    config.discordAdmin.forEach(function(element) {
      discordAdmin.push(element);
    });
  });

  client.on("message", async message => {
    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot) return;
    messagecontent = message.content.substr((prefix).length);
    let args = messagecontent.split(' ');
    let command = args.shift().toLowerCase();
    if (command === 'help') {
      if (!args[0] || args[0].toLowerCase() === 'help') return message.channel.send('Uhh, what do you need help with?');
      fs.readdir(dfol, (e, files) => {
        if (args[0].toLowerCase() === 'eval') return message.channel.send('Admin stuff. Shh.');
        if (!files.includes(`${args[0].toLowerCase()}.js`)) return message.channel.send('Command not found.');
        let commandFile = require(`./discordcommands/${args[0].toLowerCase()}.js`);
        if (commandFile.help == undefined) return message.channel.send('Help for this command was not found.');
        if (commandFile.permissions === 'admin' && !admin.includes(message.author.id)) return message.channel.send('Admin stuff. Shh.');
        return message.channel.send(commandFile.help);
      });
      return;
    }
    if (command === 'eval') {
      if (!discordAdmin.includes(message.author.id)) return message.channel.send('Access denied.');
      try {
        message.channel.send(`<< ${eval(args.join(' '))}`);
      }
      catch (e) {
        message.channel.send(`<< ${e.message}`);
        console.log(e.stack);
      }
      return;
    }
    fs.readdir(dfol, (e, files) => {
      if (!files.includes(`${command}.js`)) return message.channel.send('Command not found.');
      let commandFile = require(`./discordcommands/${command}.js`);
      if (commandFile.permissions === 'admin') {
        if (!discordAdmin.includes(message.author.id)) return message.channel.send('Access denied.');
        return commandFile.commandFunction(Bot, args, message, client);
      }
      else if (commandFile.permissions === 'none') {
        return commandFile.commandFunction(Bot, args, message, client);
      }
      else return message.channel.send('Something went wrong.');
    });
  });
}


Bot.on('connect', function (connection) {
  console.log('Connected to Pokémon Showdown.');
});
Bot.on('chat', function (room, time, by, message) {
  if (message === `${config.nickName}?`) return Bot.say(room, `Hi, I'm ${config.nickName}! My prefix is \`\`${config.prefix}\`\`. I hope to be of assistance!`);
  if (locked.includes(toId(by))) return;
    if (!message.startsWith(prefix)) return;
    messagecontent = message.substr((prefix).length);
    let args = messagecontent.split(' ');
    let command = args.shift().toLowerCase();
    if (by.startsWith('~') || by.startsWith('&') || by.startsWith('#') || by.startsWith('*') || by.startsWith('@')) {
      if (!admin.includes(toId(by)) && !alpha.includes(toId(by))) {
        alpha.push(toId(by));
        spliceRank = by.charAt(0);
      }
    }
    if (by.startsWith('%')) {
      if (!admin.includes(toId(by)) && !alpha.includes(toId(by)) && !beta.includes(toId(by))) {
        beta.push(toId(by));
        spliceRank = by.charAt(0);
      }
    }
    if (by.startsWith('+')) {
      if (!admin.includes(toId(by)) && !alpha.includes(toId(by)) && !beta.includes(toId(by)) && !gamma.includes(toId(by))) {
        gamma.push(toId(by));
        spliceRank = by.charAt(0);
      }
    }
    if (command === 'help') {
      if (!args[0] || args[0].toLowerCase() === 'help') {
        if (spliceRank) spliceRanks(spliceRank, by);
        return Bot.say(room, 'Uhh, what do you need help with?');
      }
      fs.readdir(cfol, (e, files) => {
        if (args[0].toLowerCase() === 'eval') {
          if (spliceRank) spliceRanks(spliceRank, by);
          return Bot.say(room, 'Admin stuff. Shh.');
        }
        if (!files.includes(`${args[0].toLowerCase()}.js`)) {
          if (spliceRank) spliceRanks(spliceRank, by);
          return Bot.say(room, 'Command not found.');
        }
        let commandFile = require(`./commands/${args[0].toLowerCase()}.js`);
        if (commandFile.help == undefined) {
          if (spliceRank) spliceRanks(spliceRank, by);
          return Bot.say(room, 'Help for this command was not found.');
        }
        if (commandFile.permissions === 'admin' && !admin.includes(toId(by))) {
          if (spliceRank) spliceRanks(spliceRank, by);
          return Bot.say(room, 'Admin stuff. Shh.');
        }
        if (commandFile.permissions === 'alpha' && !admin.includes(toId(by)) && !alpha.includes(toId(by))) {
          if (spliceRank) spliceRanks(spliceRank, by);
          return Bot.say(room, 'Alpha stuff. Shh.');
        }
        if (commandFile.permissions === 'beta' && !admin.includes(toId(by)) && !alpha.includes(toId(by)) && !beta.includes(toId(by))) {
          if (spliceRank) spliceRanks(spliceRank, by);
          return Bot.say(room, 'Beta stuff. Shh.');
        }
        if (commandFile.permissions === 'gamma' && !admin.includes(toId(by)) && !alpha.includes(toId(by)) && !beta.includes(toId(by)) && !gamma.includes(toId(by))) {
          if (spliceRank) spliceRanks(spliceRank, by);
          return Bot.say(room, 'Gamma stuff. Shh.');
        }
        Bot.say(room, commandFile.help);
        if (spliceRank) spliceRanks(spliceRank, by);
      });
      return;
    }
    if (command === 'eval') {
      if (!admin.includes(toId(by))) return Bot.say(room, 'Access denied.');
      try {
        let eoutpu = eval(args.join(' '));
        if (typeof(eoutpu) === 'object') return Bot.say(room, JSON.stringify(eoutpu));
        else if (typeof(eoutpu) === 'function') return Bot.say(room, '!code \n' + eoupu.toString());
        else Bot.say(room, eoutpu);
      }
      catch (e) {
        Bot.say(room, e.message);
        console.log(e.stack);
      }
      return;
    }
    fs.readdir(cfol, (e, files) => {
      if (!files.includes(`${command}.js`)) {
        if (spliceRank) spliceRanks(spliceRank, by);
        return Bot.say(room, 'Command not found.');
      }
      let commandFile = require(`./commands/${command}.js`);
      if (commandFile.permissions === 'admin') {
        if (spliceRank) spliceRanks(spliceRank, by);
        if (!admin.includes(toId(by))) return Bot.say(room, 'Access denied.');
        commandFile.commandFunction(Bot, room, by, args, client);
      }
      else if (commandFile.permissions === 'alpha') {
        if (!admin.includes(toId(by)) && !alpha.includes(toId(by))) {
          if (spliceRank) spliceRanks(spliceRank, by);
          return Bot.say(room, 'Access denied.');
        }
        commandFile.commandFunction(Bot, room, by, args, client);
        if (spliceRank) spliceRanks(spliceRank, by);
      }
      else if (commandFile.permissions === 'beta') {
        if (!admin.includes(toId(by)) && !alpha.includes(toId(by)) && !beta.includes(toId(by))) {
          if (spliceRank) spliceRanks(spliceRank, by);
          return Bot.say(room, 'Access denied.');
        }
        commandFile.commandFunction(Bot, room, by, args, client);
        if (spliceRank) spliceRanks(spliceRank, by);
      }
      else if (commandFile.permissions === 'gamma') {
        if (!admin.includes(toId(by)) && !alpha.includes(toId(by)) && !beta.includes(toId(by)) && !gamma.includes(toId(by))) {
          if (spliceRank) spliceRanks(spliceRank, by);
          return Bot.say(room, 'Access denied.');
        }
        commandFile.commandFunction(Bot, room, by, args, client);
        if (spliceRank) spliceRanks(spliceRank, by);
      }
      else if (commandFile.permissions === 'none') {
        commandFile.commandFunction(Bot, room, by, args, client);
        if (spliceRank) spliceRanks(spliceRank, by);
      }
      else {
        if (spliceRank) spliceRanks(spliceRank, by);
        return Bot.say(room, 'Error occurred.');
      }
    });
});  
Bot.on('pm', function (by, message) {
  if (!admin.includes(toId(by))) Bot.pm('PartMan', `${by}: ${message}`);
  let mtoid = toId(message);
  if (mtoid.indexOf('invit') !== -1) Bot.pm(by, `/invite ${tcroom}`);
    if (!message.startsWith(prefix)) return;
    messagecontent = message.substr((prefix).length);
    let args = messagecontent.split(' ');
    let command = args.shift().toLowerCase();
    if (!admin.includes(toId(by))) return;
    if (command === 'do') {
      Bot.pm(by, args.join(' '));
    }
    if (command === 'eval') {
      try {
          Bot.pm(by, eval(args.join(' ')));
      }
      catch (e) {
        Bot.pm(by, e.message);
        console.log(e.stack);
      }
    }
    if (command === 'kill') Bot.disconnect();
    if (command === 'sayin') {
      roomin = args.shift();
      messagetext = args.join(' ');
      Bot.say(roomin, messagetext);
    }
    if (command === 'sayintc' && args[0]) Bot.say(tcroom, args.join(' '));
    if (command === 'pm') {
      let cargs = messagecontent.split(',');
      let personto = cargs.shift();
      Bot.pm(personto, cargs.join(','));
    }
    if (command === 'j' && args[0]) Bot.pm(by, `/j ${args.join(' ')}`);
});
Bot.on('error', function(room, emessage) {
  let str = room + ': ' + emessage;
  if (str.length > 300) str = str.substr(0,300);
  Bot.pm(owner, str);
});
Bot.on('popup', function(pmessage) {
  if (pmessage.length > 293) pmessage = pmessage.substr(0, 293);
  Bot.pm(owner, 'Popup: ' + pmessage);
});
Bot.on('queryresponse', function(response) {Bot.say(queryRoom, response);});
let standard_input = process.stdin;
standard_input.setEncoding('utf-8');
standard_input.on('data', function(data) {
  try {
    console.log(eval(data));
  }
  catch(e) {
    console.log(e.stack);
  }
});
