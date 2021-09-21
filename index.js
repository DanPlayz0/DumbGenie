require('dotenv').config();
const Discord = require('discord.js');
const request = require('request'), fetch = require('node-fetch'), cheerio = require('cheerio');
const emojiRegex = require('emoji-regex');
const client = new Discord.Client({ intents: [Discord.Intents.GUILD_MESSAGES, Discord.Intents.GUILDS] });

const REGEX_START = /^i wish i knew how to.*/i, REGEX_END = /[^.,?!;:#/]*/,
  REGEX_ACRONYM = /(?<=\s)(lol|omf?g|lmf?ao+|smf?h)(?=\s|$|[.,;:?!#/])/ig,
  REGEX_EMOJI = emojiRegex(), PREFIX_LENGTH = 14;

client.on('ready', () => {
  console.log(`Loaded as ${client.user.username}`);
})

client.on('message', (message) => {
  if(new RegExp(`^(<@!?${client.user.id}>)`).test(message.content)) return message.channel.send({content:'Wish granted! How to read: https://top.gg/bot/860067050050682900/'});
  const text = message.content.match(REGEX_START);
  if (text !== null) addPunctuation(text[0].replace(REGEX_EMOJI, '.').replace(REGEX_ACRONYM, '.'), message);
});

client.login(process.env.DISCORD_TOKEN);

function addPunctuation(text, message) {
  var data = 'text='+text;
  request.post({
    url: 'http://bark.phon.ioc.ee/punctuator',
    body: data,
    headers: {'content-type':'application/x-www-form-urlencoded'}
  }, (err, response, body) => {
    if(err) return console.error(err);
    if(response.statusCode == 200) {
      return searchWikihow(body.match(REGEX_END)[0].substring(PREFIX_LENGTH).trim(), message)
    }
  })
}

function searchWikihow(data, message) {
  fetch(`https://www.wikihow.com/wikiHowTo?search=${data.split(' ').join('+')}`).then(m => m.text()).then(searchRaw => {
    if(!searchRaw) throw new Error('Invalid url');
    let $ = cheerio.load(searchRaw);
    const link = $("#searchresults_list > .result_link").attr('href');
    message.channel.send({content: `Wish granted! ${data}: ${link}`});
  })
}