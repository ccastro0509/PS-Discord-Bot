const config = require('./config.js');

global.typelist = ['bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting', 'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal', 'poison', 'psychic', 'rock', 'steel', 'water'];
global.unxa = 'Unexpected number of arguments.';
global.pollStat = 'inactive';
global.votarr = [];
global.voters = [];
global.votes = [];
global.tcroom = '1v1typechallenge';  
global.admin = [];
global.discordAdmin = [];
global.alpha = [];
global.beta = [];
global.gamma = [];
global.locked = [];
global.cfol = './commands';
global.dfol = './discordcommands';
global.logRooms = [];
global.prefix = config.prefix;
global.owner = config.owner;
global.nickName = config.nickName;
global.spliceRank = false;
global.toId = function toId(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '');
}
global.pokedex = require('./data/pokedex.js').BattlePokedex;
global.colourize = function colourize(text, name) {
    let ccjs = JSON.parse(String(fs.readFileSync('./customcolors.json')));
    if (!name) name = toId(text);
    if (Object.keys(ccjs).includes(toId(name))) name = ccjs[name];
    let md5 = require('js-md5');
    let hash = md5(toId(name));
    let H = parseInt(hash.substr(4, 4), 16) % 360;
    let S = parseInt(hash.substr(0, 4), 16) % 50 + 40;
    let L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 + 30);
    let C = (100 - Math.abs(2 * L - 100)) * S / 100 / 100;
    let X = C * (1 - Math.abs((H / 60) % 2 - 1));
    let m = L / 100 - C / 2;
    let R1;
    let G1;
    let B1;
    switch (Math.floor(H / 60)) {
    case 1: R1 = X; G1 = C; B1 = 0; break;
    case 2: R1 = 0; G1 = C; B1 = X; break;
    case 3: R1 = 0; G1 = X; B1 = C; break;
    case 4: R1 = X; G1 = 0; B1 = C; break;
    case 5: R1 = C; G1 = 0; B1 = X; break;
    case 0: default: R1 = C; G1 = X; B1 = 0; break;
    }
    let R = R1 + m;
    let G = G1 + m;
    let B = B1 + m;
    let lum = R * R * R * 0.2126 + G * G * G * 0.7152 + B * B * B * 0.0722;
    let HLmod = (lum - 0.2) * -150;
    if (HLmod > 18) HLmod = (HLmod - 18) * 2.5;
    else if (HLmod < 0) HLmod = (HLmod - 0) / 3;
    else HLmod = 0;
    let Hdist = Math.min(Math.abs(180 - H), Math.abs(240 - H));
    if (Hdist < 15) {
        HLmod += (15 - Hdist) / 3;
    }
    L += HLmod;
    return '<STRONG style=\"' + `color:hsl(${H},${S}%,${L}%);` + '\">' + text + '</STRONG>';
}
global.fs = require('fs');
global.capitalize = function capitalize(text) {
	return text.charAt(0).toUpperCase() + text.substr(1);
}
global.toName = function toName(text) {
	return text.charAt(0).toUpperCase() + text.substr(1);
}
global.modeString = function modeString(array) {
    if (array.length == 0)
        return null;

    var modeMap = {},
        maxEl = array[0],
        maxCount = 1;

    for(var i = 0; i < array.length; i++)
        {
        var el = array[i];

        if (modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;

        if (modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
        else if (modeMap[el] == maxCount)
        {
            maxEl += '&' + el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}
global.DateString = function DateString() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + "::" + hour + ":" + min + ":" + sec;
}
global.url = require('url');
global.https= require('https');
global.uploadToHastebin = function uploadToHastebin(text, callback) {
    if (typeof callback !== 'function') return false;
    let action = url.parse('https://hastebin.com/documents');
    let options = {
        hostname: action.hostname,
        path: action.pathname,
        method: 'POST',
    };

    let request = https.request(options, response => {
        response.setEncoding('utf8');
        let data = '';
        response.on('data', chunk => {
            data += chunk;
        });
        response.on('end', () => {
            let key;
            try {
                let pageData = JSON.parse(data);
                key = pageData.key;
            } catch (e) {
                if (/^[^<]*<!DOCTYPE html>/.test(data)) {
                    if (e.message === 'Unexpected token < in JSON at position 0') return callback('Hastebin is wonky at the moment. Surprisingly, this isn\'t PartMan\'s fault.');
                    return callback('Cloudflare-related error uploading to Hastebin: ' + e.message);
                } else {
                    return callback('Unknown error uploading to Hastebin: ' + e.message);
                }
            }
            callback('https://hastebin.com/raw/' + key);
        });
    });

    request.on('error', error => console.log('Login error: ' + error.stack));

    if (text) request.write(text);
    request.end();
}
global.spliceRanks = function spliceRanks(spliceRank, by) {
    if (['~', '&', '#', '*', '@', '%', '+'].includes(spliceRank)) {
        if (['~', '&', '#', '*', '@'].includes(by.charAt(0))) {
            if (!alpha.includes(toId(by))) return 'Error: Could not find by in Alpha.';
            alpha.splice(alpha.indexOf(toId(by), 1));
            spliceRank = false;
            return ':)';
        }
        else if (['%'].includes(by.charAt(0))) {
            if (!beta.includes(toId(by))) return 'Error: Could not find by in Beta.';
            beta.splice(beta.indexOf(toId(by), 1));
            spliceRank = false;
            return ':)';
        }
        else if (['+'].includes(by.charAt(0))) {
            if (!gamma.includes(toId(by))) return 'Error: Could not find by in Gamma.';
            gamma.splice(gamma.indexOf(toId(by), 1));
            spliceRank = false;
            return ':)';
        }  
        else return 'Error: spliceRank is incorrect.';
    }
    else return 'UwU';
}
Array.prototype.frequencyOf = function(str) {
    let j = 0;
    for (let i = 0; i < this.length; i++) {
        if (this[i] === str) j++;
    }
    return j;
}
String.prototype.frequencyOf = function (text) {
    if (!typeof text === 'string') return;
    return this.split(text).length - 1;
}
String.prototype.replaceAll = function (text, repl) {
    if (!typeof text === 'string' || !typeof repl === 'string') return;
    return this.split(text).join(repl);
}
