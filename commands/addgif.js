module.exports ={
    permissions: "alpha",
    help: `Assigns a GIF to a user. Syntax: ${prefix}addgif (Pokémon), (user)`,
    commandFunction: function (Bot, room, by, args, client) {
    	if (!args[0]) return Bot.say(room, unxa);
    	if (!args.join(' ').includes(',')) return Bot.say(room, unxa);
    	let thearr = args.join('').split(',');
    	let pkmnlink = require('./POKEMON.js');
    	let pkmnn = thearr.shift().toLowerCase();
    	if (!pkmnlink.pokemon.includes(pkmnn)) return Bot.say(room, 'Pokémon not found.');
        let gifobj = JSON.parse(String(fs.readFileSync('./data/gifdata.json')));
        let name = toId(thearr.join(''));
        if (Object.keys(gifobj).includes(name)) return Bot.say(room, 'User already has a GIF. To edit, is must be manually entered.');
        gifobj[name] = pkmnn;
        fs.writeFile('./data/gifdata.json', JSON.stringify(gifobj), function (e) {
        	if (e) return Bot.say(room, e);
        	Bot.say(room, 'GIF has been added.');
        });
    }
}