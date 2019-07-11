module.exports ={
    permissions: "gamma",
    help: `Dispays the gif of a given Pokémon. Does not support periods. Syntax: ${prefix}gif (Pokémon)`,
    commandFunction: function (Bot, room, by, args, client) {
    	var pkmnlink = require('./POKEMON.js');
    	if (!args[0]) return Bot.say(room, unxa);
    	let pokemonnam = args.join(' ').toLowerCase();
        let gifobj = JSON.parse(String(fs.readFileSync('./data/gifdata.json')));
        if (Object.keys(gifobj).includes(pokemonnam)) pokemonnam = gifobj[pokemonnam];
        if (pokemonnam === 'vanish') return Bot.say(room, '/adduhtml PKMNGIF, <COMMENT>');
    	if (pokemonnam === 'yech' || pokemonnam === 'yeche') return Bot.say(room, 'Pokémon not found. Did you mean: Touhou Addict?');
        if (pokemonnam === 'touhou addict') return Bot.say(room, 'Pokémon not found. Did you mean: Yech E?');
    	if (!pkmnlink.pokemon.includes(pokemonnam)) return Bot.say(room, 'Pokémon not found.');
    	Bot.say(room, `/adduhtml PKMNGIF,<CENTER><IMG src="https://play.pokemonshowdown.com/sprites/xyani/${pokemonnam}.gif" height="0" width="0" style="width:auto;height:auto"></CENTER>`);
    }
}