module.exports ={
    permissions: "none",
    help: `Displays the credits for PartBot`,
    commandFunction: function (Bot, room, by, args, client) {
        Bot.say(room, '/addhtmlbox ' + colourize('Ecuacion') + ' for their client.js and handling the connection.<BR>' + colourize('cycro') + ' for their help in the initial phase of development of the Bot.<BR>' + colourize('PartMan') + ' for coding in all the commands.<BR>' + colourize('Morfent') + ', ' + colourize('JumboWhales') + ', and ' + colourize('XpRienzo') + ' for their help throughout the development of the Bot.<BR>And ' + colourize('Zarel') + ' and the other contributers of Pokémon Showdown.');
    }
}