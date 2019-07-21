module.exports ={
    permissions: "none",
    help: `How cool are you`,
    commandFunction: function (Bot, room, by, args, client) {
        Bot.say(room, `"very cool"`);
    }
}
