module.exports ={
    permissions: "none",
    help: `Displays the date on which a specified account was registered. Syntax: ${prefix}regdate (username)`,
    commandFunction: function (Bot, room, by, args, client) {
    	if (!args[0]) return Bot.say(room, unxa);
    	let per = toId(args.join(''));
        let request = require('request');
        request('https://pokemonshowdown.com/users/' + per, function(error, response, body) {
        	if (error) return Bot.say(room, error);
        	//Bot.log(body);
        	if (!body.includes('Joined:')) return Bot.say(room, args.join(' ') + ' is unregistered.');
        	let ghf = body.split('<em>Joined:</em> ');
        	let rda = ghf[1].split('</small>')[0];
        	Bot.say(room, args.join(' ') + ' was registered on ' + rda + '.');
        });
    }
}