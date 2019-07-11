module.exports ={
    permissions: "admin",
    help: `Shh.`,
    commandFunction: function (Bot, room, by, args, client) {
        if (!args[0].toLowerCase() === 'userdetails' && args[1]) return Bot.say(room, unxa);
        args.shift();
        queryRoom = room;
        Bot.say('', '/cmd userdetails ' + args.join(' '));
    }
}