exports.parse = {
	actionUrl: url.parse('https://play.pokemonshowdown.com/~~' + config.serverid + '/action.php'),
	room: 'lobby',
	'settings': settings,
	//'profiles': profiles,
	blacklistRegexes: {},
	chatData: {},
	rooms: {},
	data: function(data) {
		if (data.substr(0, 1) === 'a') {
			data = JSON.parse(data.substr(1));
			if (data instanceof Array) {
				for (var i = 0, len = data.length; i < len; i++) {
					this.splitMessage(data[i]);
				}
			}
			else {
				this.splitMessage(data);
			}
		}
	},
	splitMessage: function(message) {
		if (!message) return;
		var changes = false;
		if (!this.settings[config.serverid]) {
			this.settings[config.serverid] = {};
			info('Created subsettings: serverid')
			changes = true;
		}
		if (!this.settings[config.serverid][toId(config.nick)]) {
			this.settings[config.serverid][toId(config.nick)] = {};
			info('Created subsettings: nick');
			changes = true;
		}
		if (changes) {
			Tools.writeSettings();
		}
		var room = 'lobby';
		if (message.indexOf('\n') < 0) return this.message(message, room);

		var spl = message.split('\n|:|')[0].split('\n');
		/*
		if (spl[0].charAt(0) === '>') {
			if (spl[1].substr(1, 10) === 'tournament') return;
			room = spl.shift().substr(1);
			if (spl[0].substr(1, 4) === 'init') {
				var users = spl[2].substr(7).split(',');
				var nickId = toId(config.nick);
				for (var i = users.length; i--;) {
					if (toId(users[i]) === nickId) {
						Bot.ranks[room] = users[i].trim().charAt(0);
						break;
					}
				}
				return ok('joined ' + room);
			}
		}*/
		if (spl[0].charAt(0) === '>') {
			room = spl.shift().substr(1);
		}
		for (var i = 0, len = spl.length; i < len; i++) {
			this.message(spl[i], room);
		}
	},
	message: function(message, room) {
		Battle.receive(message, room);
		var spl = message.split('|');
		switch (spl[1]) {
			case 'init':
				this.rooms[room] = {
					type: spl[1] || 'chat',
					title: '',
					users: {},
					userCount: 0
				};
				this.roomcount = Object.keys(this.rooms).length;
				if (this.events['joinroom'] && typeof this.events['joinroom'] === 'function') {
					this.events['joinroom'](room, this.rooms[room].type);
				}
				break;
			case 'nametaken':
			case 'challstr':
				var id = spl[1];
				var str = spl[2];
				this.challstr = {
					id: id,
					str: str
				};
				if (this.opts.nickName !== null) this.rename(this.opts.nickName, this.opts.pass);
				if (this.events['challstr'] && typeof this.events['challstr'] === 'function') {
					this.events['challstr'](spl[1] + spl[2]);
				}
				break;
			case 'updateuser':
				var name = spl[1];
				var named = parseInt(spl[2]);
				var avatar = spl[3];
				this.status.nickName = spl[1];
				this.status.named = named;
				if (config.avatar) this.status.avatar = config.avatar;
				else this.status.avatar = avatar;
				if (this.events['rename'] && typeof this.events['rename'] === 'function') {
					this.events['rename'](name, named, avatar);
				}
				if (named) this.joinRooms(this.opts.autoJoin);
				if (!config.avatar === '') this.setAvatar(config.avatar);
				if (!config.status === '') this.setStatus(config.status);
				break;
			case 'c':
				var by = spl[1];
				var timeOff = Date.now();
				spl.splice(0, 2);
				if (isIntro) {
					if (this.events['intro'] && typeof this.events['intro'] === 'function') {
						this.events['intro']('chat', room, timeOff, by, spl.join('|'));
					}
					break;
				}
				if (by.substr(1) === this.status.nickName) {
					if (this.events['chatsucess'] && typeof this.events['chatsucess'] === 'function') {
						this.events['chatsucess'](room, timeOff, spl.join('|'));
					}
				} else {
					if (this.events['chat'] && typeof this.events['chat'] === 'function') {
						this.events['chat'](room, timeOff, by, spl.join('|'));
					}
				}
				break;
			case 'c:':
				var by = spl[2];
				var timeOff = parseInt(spl[1]) * 1000;
				spl.splice(0, 3);
				if (isIntro) {
					if (this.events['intro'] && typeof this.events['intro'] === 'function') {
						this.events['intro']('chat', room, timeOff, by, spl.join('|'));
					}
					break;
				}
				if (by.substr(1) === this.status.nickName) {
					if (this.events['chatsucess'] && typeof this.events['chatsucess'] === 'function') {
						this.events['chatsucess'](room, timeOff, spl.join('|'));
					}
				} else {
					if (this.events['chat'] && typeof this.events['chat'] === 'function') {
						this.events['chat'](room, timeOff, by, spl.join('|'));
					}
				}
				break;
			case 'pm':
				var by = spl[1];
				var dest = spl[2];
				spl.splice(0, 3);
				if (toId(by) === toId(this.status.nickName)) {
					if (this.events['pmsucess'] && typeof this.events['pmsucess'] === 'function') {
						this.events['pmsucess'](dest, spl.join('|'));
					}
				} else {
					if (this.events['pm'] && typeof this.events['pm'] === 'function') {
						this.events['pm'](by, spl.join('|'));
					}
				}
				break;
			case 'n': 
			case 'N':
				var by = spl[1];
				var old = spl[2];
				if (this.rooms[room]) {
					if (this.rooms[room].users[toId(old)]) delete this.rooms[room].users[toId(old)];
					this.rooms[room].users[toId(by)] = by;
				}
				if (this.events['userrename'] && typeof this.events['userrename'] === 'function') {
					this.events['userrename'](room, old, by);
				}
				break;
			case 'J':
			case 'j':
				var by = spl[1];
				if (this.rooms[room] && !this.rooms[room].users[toId(by)]) {
					this.rooms[room].users[toId(by)] = by;
					this.rooms[room].userCount++;
				}
				if (this.events['userjoin'] && typeof this.events['userjoin'] === 'function') {
					this.events['userjoin'](room, by);
				}
				break;
			case 'l':
			case 'L':
				var by = spl[1];
				if (this.rooms[room] && this.rooms[room].users[toId(by)]) {
					delete this.rooms[room].users[toId(by)];
					this.rooms[room].userCount--;
				}
				if (this.events['userleave'] && typeof this.events['userleave'] === 'function') {
					this.events['userleave'](room, by);
				}
				break;
			case 'raw':
			case 'html':
				this.parseEmotes(spl[2], room);
				break;
			case 'users':
				if (isIntro) {
					if (this.events['intro'] && typeof this.events['intro'] === 'function') {
						this.events['intro']('raw', room, message.substr(2 + spl[0].length));
					}
					break;
				}
				if (this.events['raw'] && typeof this.events['raw'] === 'function') {
					this.events['raw'](room, message.substr(2 + spl[0].length));
				}
				break;
			case 'title':
				if (this.rooms[room]) this.rooms[room].title = spl[1];
				if (isIntro) {
					if (this.events['intro'] && typeof this.events['intro'] === 'function') {
						this.events['intro']('title', room, spl[1]);
					}
				}
			case 'popup':
				if (this.events['popup'] && typeof this.events['popup'] === 'function') {
					this.events['popup'](message.substr(7));
				}
				break;
			case 'deinit':
				if (this.rooms[room]) {
					if (this.events['leaveroom'] && typeof this.events['leaveroom'] === 'function') {
						this.events['leaveroom'](room);
					}
					delete this.rooms[room];
					this.roomcount = Object.keys(this.rooms).length;
				}
				break;
			case 'noinit':
				if (this.events['joinfailure'] && typeof this.events['joinfailure'] === 'function') {
					this.events['joinfailure'](room, spl[1], spl[2]);
				}
				break;		
			case 'updatechallenges':
				var challengeData = JSON.parse(spl[2]).challengesFrom;
				var players = Object.keys(challengeData);
				Battle.accept(players[0], challengeData[players[0]])
				break;
			case 'tournament':
				Battle.tournaments(spl.slice(2), room);
				break;
		}
	},
	parseTransfer: function(text) {
		if (toId(config.nick) !== 'sparkybottt') return;
		if (text.split(' has transferred ').length < 2) return;
		var user = text.split(' has transferred ')[0];
		var amount = text.split(' has transferred ')[1].split(' buck')[0] * 1;
		if (typeof amount !== 'number') {
			if (text.split(' has transferred ').length < 3) return;
			user += ' has transferred ';
			amount = text.split(' has transferred')[2].split(' buck')[0] * 1
		}
		info(user + ' has transfered ' + amount + 'bucks');
	},
	/*
	updateProfile: function(by, room, oldname) {
		if (!by || !oldname || !room || !config.alts) return;
		var user = toId(by);
		oldname = toId(oldname);
		if (this.profiles[user] && this.profiles[oldname]) {
			if (this.profiles[user].indexOf(oldname) > -1 && this.profiles[oldname].indexOf(user) > -1) {
				return;
			}
		}
		if (user === oldname) {
			return;
		}
		var profile = this.profiles;
		if (!profile[user]) {
			profile[user] = [user];
		}
		var alts = profile[user];
		if (alts.indexOf(oldname) === -1) {
			alts.push(oldname);
		}
		//compile FULL alt list
		for (var i = 0; i < alts.length; i++) {
			//safety catch
			if (!profile[alts[i]]) {
				profile[alts[i]] = [alts[i]];
			}
			//gather full alts list
			if (profile[alts[i]].length > 0) {
				for (var j = 0; j < profile[alts[i]].length; j++) {
					if (alts.indexOf(profile[alts[i]][j]) > -1) {
						continue;
					}
					if (!profile[alts[i]][j]) {
						continue;
					}
					alts.push(profile[alts[i]][j]);
				}
			}
		}
		//syncronize alts
		for (i = 0; i < alts.length; i++) {
			profile[alts[i]] = alts;
		}
		this.profiles = profile;
		fs.writeFileSync('profiles.json', JSON.stringify(profile))
	},
	*/
	parseEmotes: function(html, room) {

		if (html.indexOf('<div class=\'chat\'><small>') !== 0) return false;
		var emoteList = ["#freewolf", "feelsbd", "feelsbn", "feelspn", "feelsdd", "feelsgd", "feelsgn", "feelsmd", "feelsnv", "feelsok", "feelspika", "feelspink", "feelsrs", "feelssc", "fukya", "funnylol", "hmmface", "Kappa", "noface", "Obama", "oshet", "PJSalt", "trumpW", "Sanic", "wtfman", "xaa", "yayface", "yesface", "meGusta", "trollface", "Doge"];
		var initialLength = html.length;
		var usersearch = html.indexOf('</small><button name=\'parseCommand\' value=\'/user ') + 49

		var user = html.slice(usersearch).split('\' style=\'background:none;border:0;padding:0 5px 0 0;font-family:Verdana,Helvetica,Arial,sans-serif;font-size:9pt;cursor:pointer\'><b><font color=')[0];


		if (toId(user) === toId(config.nick)) return false;
		var emoteCount = 0;

		var emoteStats = {};

		for (var j = 0; j < emoteList.length; j++) {
			var replacer = '" title="' + emoteList[j] + '" />';
			var newText = '';
			emoteStats[emoteList[j]] = 0;
			for (var i = 0; i < ~~(initialLength / replacer.length) + 1; i++) {
				if (html.indexOf(replacer) === -1) {
					break;
				}
				emoteStats[emoteList[j]]++;
				html = html.replace(replacer, '');
				emoteCount++;
			}
		}

		//parse flooding
		if (emoteStats) {
			if (!emoteFlooding[toId(user)]) {
				emoteFlooding[toId(user)] = 0;
			}
			emoteFlooding[toId(user)]++
				setTimeout(function() {
					emoteFlooding[toId(user)]--
				}.bind(this), FLOOD_MESSAGE_TIME);
			if (emoteFlooding[toId(user)] >= FLOOD_MESSAGE_NUM) {
				emoteCount = emoteFlooding[toId(user)];
			}
		}
		//data logging
		Plugins.emoteCount(emoteStats);
		//moderation
		this.emoteModerate(emoteCount, user, room)
	},
	emoteModerate: function(count, user, room) {
		if (Bot.rankFrom(user, '+')) return false;

		if (!emoticonAbuse[toId(user)]) {
			emoticonAbuse[toId(user)] = 0
		}
		if (count < 3) return false;
		if (count > 2) {
			emoticonAbuse[toId(user)] = emoticonAbuse[toId(user)] + count;
		}

		var noModeration = fs.readFileSync('data/emotemoderation.txt').toString().split('\n');
		if (noModeration.indexOf('d|' + room) > -1) {
			return false;
		}


		if (count > 15) {
			if (Bot.hasRank(Bot.ranks[room], '@#&~')) {
				return Bot.talk(room, '/roomban ' + user + ', Emoticon Spam (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
			else if (Bot.hasRank(Bot.ranks[room], '%')) {
				return Bot.talk(room, '/hourmute ' + user + ', Emoticon Spam (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
		//

		if (emoticonAbuse[toId(user)] > 150) {
			if (Bot.hasRank(Bot.ranks[room], '@#&~')) {
				return Bot.talk(room, '/roomban ' + user + ', Emoticon Spam (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
			else if (Bot.hasRank(Bot.ranks[room], '%')) {
				return Bot.talk(room, '/hourmute ' + user + ', Emoticon Spam (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
		else if (emoticonAbuse[toId(user)] > 50 && emoticonAbuse[toId(user)] < 151) {
			if (Bot.hasRank(Bot.ranks[room], '%@#&~')) {
				return Bot.talk(room, '/hourmute ' + user + ', Please do not spam emoticons. (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
		else if (emoticonAbuse[toId(user)] > 6 && emoticonAbuse[toId(user)] < 51) {
			if (Bot.hasRank(Bot.ranks[room], '%@#&~')) {
				return Bot.talk(room, '/mute ' + user + ', Please do not abuse emoticons. (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
		else if (emoticonAbuse[toId(user)] > 2 && emoticonAbuse[toId(user)] < 7) {
			if (Bot.hasRank(Bot.ranks[room], '%@#&~')) {
				return Bot.talk(room, '/warn ' + user + ', Please use emoticons in moderation. (' + count + ' [' + emoticonAbuse[toId(user)] + '])');
			}
		}
	},
	chatMessage: function(message, by, room) {
		var cmdrMessage = '["' + room + '|' + by + '|' + message + '"]';
		message = message.trim();
		// auto accept invitations to rooms
		if (room.charAt(0) === ',' && message.substr(0, 8) === '/invite ' && Bot.hasRank(by, '+%@&~') && !Bot.roomIsBanned(message.substr(8))) {
			invite(by, message.substr(8));
			Bot.talk('', '/join ' + message.substr(8));
		}

		if (Bot.isBanned(by)) return false;

		Bot.ResourceMonitor(message, by, room, 'command');

		if (Bot.isBanned(by)) return false;

		Plugins.autoRes(message, by, room);

		//check for command char
		var isCommand = 0;
		for (var c = 0; c < config.commandcharacter.length; c++) {
			if (message.indexOf(config.commandcharacter[c]) === 0) {
				isCommand = config.commandcharacter[c].length;
			}
		}

		if (isCommand === 0 || toId(by) === toId(config.nick)) return;

		Plugins.customCommands('+' + message.slice(isCommand), by, room);

		message = message.slice(isCommand);
		var index = message.indexOf(' ');
		var arg = '';
		if (index > -1) {
			var cmd = toId(message.substr(0, index));
			arg = message.substr(index + 1).trim();
		}
		else {
			var cmd = toId(message);
		}

		if (Commands[cmd]) {
			var failsafe = 0;
			var leCommand = cmd;
			while (typeof Commands[cmd] !== "function" && failsafe++ < 10) {
				cmd = Commands[cmd];
			}
			if (typeof Commands[cmd] === "function") {
				if (!this.settings[config.serverid][toId(config.nick)].disable) {
					this.settings[config.serverid][toId(config.nick)].disable = {};
				}
				if (this.settings[config.serverid][toId(config.nick)].disable[cmd] && !Bot.isDev(by)) {
					return;
				}
				cmdr(cmdrMessage);
				try {
					Commands[cmd].call(this, arg, by, room, leCommand);
				}
				catch (e) {
					Bot.talk(room, 'The command failed! :o');
					error(sys.inspect(e).toString().split('\n').join(' '))
					if (config.debuglevel <= 3) {
						console.log(e.stack);
					}
				}
			}
			else {
				error("invalid command type for " + cmd + ": " + (typeof Commands[cmd]));
			}
		}
	},
	isBlacklisted: function(user, room) {
		var blacklistRegex = this.blacklistRegexes[room];
		return blacklistRegex && blacklistRegex.test(user);
	},
	blacklistUser: function(user, room) {
		var blacklist = this.settings[config.serverid][toId(config.nick)].blacklist || (this.settings[config.serverid][toId(config.nick)].blacklist = {});
		if (blacklist[room]) {
			if (blacklist[room][user]) return false;
		}
		else {
			blacklist[room] = {};
		}

		blacklist[room][user] = 1;
		this.updateBlacklistRegex(room);
		return true;
	},
	unblacklistUser: function(user, room) {
		var blacklist = this.settings[config.serverid][toId(config.nick)].blacklist;
		if (!blacklist || !blacklist[room] || !blacklist[room][user]) return false;

		delete blacklist[room][user];
		if (Object.isEmpty(blacklist[room])) {
			delete blacklist[room];
			delete this.blacklistRegexes[room];
		}
		else {
			this.updateBlacklistRegex(room);
		}
		return true;
	},
	updateBlacklistRegex: function(room) {
		var blacklist = this.settings[config.serverid][toId(config.nick)].blacklist[room];
		var buffer = [];
		for (var entry in blacklist) {
			if (entry.charAt(0) === '/' && entry.substr(-2) === '/i') {
				buffer.push(entry.slice(1, -2));
			}
			else {
				buffer.push('^' + entry + '$');
			}
		}
		this.blacklistRegexes[room] = new RegExp(buffer.join('|'), 'i');
	},
		processChatData: function(user, room, msg) {
		// NOTE: this is still in early stages
		if (!user || room.charAt(0) === ',') return;

		msg = msg.trim().replace(/[ \u0000\u200B-\u200F]+/g, ' '); // removes extra spaces and null characters so messages that should trigger stretching do so
		this.updateSeen(user, 'c', room);
		var now = Date.now();
		if (!this.chatData[user]) this.chatData[user] = {
			zeroTol: 0,
			lastSeen: '',
			seenAt: now
		};
		var userData = this.chatData[user];

		if (!this.chatData[user][room]) this.chatData[user][room] = {
			times: [],
			points: 0,
			lastAction: 0,
			posts: [],
			lastPost: now
		};
		var roomData = userData[room];

		roomData.times.push(now);
		if(now - roomData.lastPost > 15000){
			roomData.posts = [];
		}
		roomData.lastPost = now;
		roomData.posts.push(msg);
		if (roomData.posts.length > 7) {
			roomData.posts = roomData.posts.slice(roomData.posts.length - 7);
		}
		var by = user;
		user = toId(user);
		// this deals with punishing rulebreakers, but note that the bot can't think, so it might make mistakes
		if (config.allowmute && Bot.hasRank(Bot.ranks[room] || ' ', '%@&#~')) {
			var useDefault = !(this.settings[config.serverid][toId(config.nick)].modding && this.settings[config.serverid][toId(config.nick)].modding[room]);
			var pointVal = 0;
			var muteMessage = '';
			var modSettings = useDefault ? null : this.settings[config.serverid][toId(config.nick)].modding[room];

			// moderation for banned words
			if (!this.settings[config.serverid][toId(config.nick)].banword) {
				this.settings[config.serverid][toId(config.nick)].banword = {};
			}
			if ((useDefault || !this.settings[config.serverid][toId(config.nick)].banword[room]) && pointVal < 2) {
				var bannedPhraseSettings = this.settings[config.serverid][toId(config.nick)].bannedphrases;
				var bannedPhrases = !!bannedPhraseSettings ? (Object.keys(bannedPhraseSettings[room] || {})).concat(Object.keys(bannedPhraseSettings.global || {})) : [];
				for (var i = 0; i < bannedPhrases.length; i++) {
					if (msg.toLowerCase().replace(/(\*\*|\_\_|\~\~|\`\`)/g, '').indexOf(bannedPhrases[i]) > -1) {
						pointVal = 2;
						muteMessage = ', Automated response: your message contained a banned phrase';
						break;
					}
				}
			}
			// moderation for flooding (more than x lines in y seconds)
			var times = roomData.times;
			var timesLen = times.length;
			var isFlooding = (timesLen >= FLOOD_MESSAGE_NUM && (now - times[timesLen - FLOOD_MESSAGE_NUM]) < FLOOD_MESSAGE_TIME && (now - times[timesLen - FLOOD_MESSAGE_NUM]) > (FLOOD_PER_MSG_MIN * FLOOD_MESSAGE_NUM));
			if ((useDefault || !('flooding' in modSettings)) && isFlooding) {
				if (pointVal < 2) {
					pointVal = 2;
					muteMessage = ', Automated response: flooding';
				}
			}

			//parse spam patterns for spammers that cannot trigger flooding :(
			function arrayCount(array, search) {
				var tarTimes = 0;
				for (var arrayIndex = 0; arrayIndex < array.length; arrayIndex++) {
					if (array[arrayIndex] === search) tarTimes++;
				}
				return tarTimes;
			}
			/*
			function parseLengthPattern(array) {
				var tarTimes = 0;
				for (var arrayIndex = 0; arrayIndex < array.length; arrayIndex++) {
					if (array[arrayIndex].length <= 4 && !/[ioue]/i.test(array[arrayIndex])) {
						//ignore faces just in case but not lennies
						if(array[arrayIndex].indexOf(':') > -1) continue;
						//ignore common 3 letter phrases..
						if (array[arrayIndex].length === 3 && (array[arrayIndex][1] === 'a' || ['mhm', 'pls', 'hmm', 'gdi'].indexOf(array[arrayIndex]) > -1)) continue;
						tarTimes++;
					}
				}
				//should be high enough... seriously if you only talk 4 letter phrases in a room, you're a bad user anyways.
				return tarTimes >= 5;
			}
			*/
			function spamLetterCount(string) {
				var foundLetters = [];
				for (var lindex = 0; lindex < string.length; lindex++) {
					var tarLetter = string[lindex];
					if (foundLetters.indexOf(tarLetter) > -1) continue;
					if ('sdfghjk'.indexOf(tarLetter) > -1) {
						foundLetters.push(tarLetter);
					}
				}
				return foundLetters.length >= 2;
			}

			function parseRandomLetterSpam(array) {
				var tarTimes = 0;
				for (var arrayIndex = 0; arrayIndex < array.length; arrayIndex++) {
					var spaceCount = array[arrayIndex].length - array[arrayIndex].replace(/\s/g, '').length;
					var spamLetter = spamLetterCount(array[arrayIndex]);
					if (!/[eiou]/i.test(array[arrayIndex]) && spaceCount <= 1 && spamLetter) tarTimes++;
				}
				return tarTimes;
			}
			if (arrayCount(roomData.posts, msg) >= 4 || parseRandomLetterSpam(roomData.posts) >= 5) {
				if (useDefault || !('flooding' in modSettings)) {
					pointVal = 2;
					if (muteMessage.length) {
						muteMessage += ', spam pattern (repeated messages/repeated excessively short messages/random letter spam)'
					}
					else {
						muteMessage = ', Automated response: spam pattern (repeated messages/repeated excessively short messages/random letter spam)';
					}
				}
				roomData.posts = [];
			}

			// moderation for caps (over x% of the letters in a line of y characters are capital)
			var capsMatch = msg.replace(/[^A-Za-z]/g, '').match(/[A-Z]/g);
			if ((useDefault || !('caps' in modSettings)) && capsMatch && toId(msg).length > MIN_CAPS_LENGTH && (capsMatch.length >= ~~(toId(msg).length * MIN_CAPS_PROPORTION))) {
				if (pointVal < 1) {
					pointVal = 1;
					muteMessage = ', Automated response: caps';
				}
			}
			// moderation for stretching (over x consecutive characters in the message are the same)
			var stretchMatch = /(.)\1{7,}/gi.test(msg) || /(..+)\1{4,}/gi.test(msg); // matches the same character (or group of characters) 8 (or 5) or more times in a row
			if ((useDefault || !('stretching' in modSettings)) && stretchMatch) {
				if (pointVal < 1) {
					pointVal = 1;
					muteMessage = ', Automated response: stretching';
				}
			}

			if (pointVal > 0 && now - roomData.lastAction >= ACTION_COOLDOWN) {
				var cmd = 'mute';
				// defaults to the next punishment in config.punishVals instead of repeating the same action (so a second warn-worthy
				// offence would result in a mute instead of a warn, and the third an hourmute, etc)
				if (roomData.points >= pointVal && pointVal < 4) {
					roomData.points++;
					cmd = config.punishvals[roomData.points] || cmd;
				}
				else { // if the action hasn't been done before (is worth more points) it will be the one picked
					cmd = config.punishvals[pointVal] || cmd;
					roomData.points = pointVal; // next action will be one level higher than this one (in most cases)
				}
				if (config.privaterooms.indexOf(room) > -1 && cmd === 'warn') cmd = 'mute'; // can't warn in private rooms
				// if the bot has % and not @, it will default to hourmuting as its highest level of punishment instead of roombanning
				if (roomData.points >= 4 && !Bot.hasRank(Bot.ranks[room] || ' ', '@&#~')) cmd = 'hourmute';
				if (userData.zeroTol > 4) { // if zero tolerance users break a rule they get an instant roomban or hourmute
					muteMessage = ', Automated response: zero tolerance user';
					cmd = Bot.hasRank(Bot.ranks[room] || ' ', '@&#~') ? 'roomban' : 'hourmute';
				}
				if (roomData.points > 1) userData.zeroTol++; // getting muted or higher increases your zero tolerance level (warns do not)
				roomData.lastAction = now;
				Bot.talk(room, '/' + cmd + ' ' + user + muteMessage);
			}
		}
	},
	cleanChatData: function() {
		var chatData = this.chatData;
		for (var user in chatData) {
			for (var room in chatData[user]) {
				var roomData = chatData[user][room];
				if (!Object.isObject(roomData)) continue;

				if (!roomData.times || !roomData.times.length) {
					delete chatData[user][room];
					continue;
				}
				var newTimes = [];
				var now = Date.now();
				var times = roomData.times;
				for (var i = 0, len = times.length; i < len; i++) {
					if (now - times[i] < 5 * 1000) newTimes.push(times[i]);
				}
				newTimes.sort(function(a, b) {
					return a - b;
				});
				roomData.times = newTimes;
				if (roomData.points > 0 && roomData.points < 4) roomData.points--;
			}
		}
	},

	updateSeen: function(user, type, detail) {
		if (type !== 'n' && config.rooms.indexOf(detail) === -1 || config.privaterooms.indexOf(toId(detail)) > -1) return;
		var now = Date.now();
		if (!this.chatData[user]) this.chatData[user] = {
			zeroTol: 0,
			lastSeen: '',
			seenAt: now
		};
		if (!detail) return;
		var userData = this.chatData[user];
		var msg = '';
		switch (type) {
			case 'j':
			case 'J':
				msg += 'joining ';
				break;
			case 'l':
			case 'L':
				msg += 'leaving ';
				break;
			case 'c':
			case 'c:':
				msg += 'chatting in ';
				break;
			case 'N':
				msg += 'changing nick to ';
				if (detail.charAt(0) !== ' ') detail = detail.substr(1);
				break;
		}
		msg += detail.trim() + '.';
		userData.lastSeen = msg;
		userData.seenAt = now;
	},
};
