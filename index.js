require("dotenv").config();
const {Client, Intents} = require("discord.js");

// https://stackoverflow.com/a/10050831
function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function characterRange(startChar, endChar) {
    return String.fromCharCode(...range(endChar.charCodeAt(0) - startChar.charCodeAt(0), startChar.charCodeAt(0)))
}

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS]});
const botId="510016054391734273";
const countingChannels=["952171490143527043", "750343389903454289", "941188352454053939"];
const unallowedReactions = ["✅", "☑️"]
const gifs = ["https://tenor.com/view/the-office-why-michael-scott-gif-5422774", "https://tenor.com/view/get-good-kid-trolling-skateboard-cat-meow-gif-21860979", "https://tenor.com/view/real-housewives-get-a-life-loser-gif-4219987", "https://tenor.com/view/stop-fooling-around-get-back-to-work-mad-scolding-back-to-work-gif-13899533", "https://tenor.com/view/boy-childish-trolling-stop-stop-it-gif-18501285"]

const messagesRepliedTo = new Set();


client.on("ready", ()=>console.log(`Logged in as ${client.user.tag}!`))

client.on("messageReactionAdd", async (reaction, user)=>{
    const users = await reaction.users.fetch();
    // Counting bot has reacted to message, so its probably legit
    if (users.has(botId)) return;

    // The message reacted to is not in the #counting channel(s), so we don't care
    if (countingChannels.indexOf(reaction.message.channelId) === -1) return
    
    // The counting bot is reacting to the message, so it cannot be fake
    if (user.id===botId) return

    // The reaction emoji was not an emoji that could fool people, so we don't care
    if (unallowedReactions.indexOf(reaction.emoji.name)===-1) return

    // We already replied to this message warning everyone, so we don't care
    if (messagesRepliedTo.has(reaction.message.id)) return

    // At this point it could be a concerning message, or it could be a troll reaction, so we should be able to filter MOST real messages. (and hope for as few flase negatives as possible)
    
    const content = reaction.message.content;
    // Intentionally doesnt include characters like * and _, which stand for stuff in discord's client's markdown and may make the characters invisible.
    const asciiChars = characterRange(":", "^");
    for (const character of content){
        // Message is officially unzuspicious
        if (asciiChars.indexOf(character.toUpperCase())>=0) return
    }

    // We aren't doing anything else, for now, because I feel like everything else can be somewhat tricked/bypassed. and overcomplicates stuff. we can deal with a few false positives
    // For example, we cant ignore messages without numbers in their body, since certain Unicode characters look like numbers.
    const gif = gifs[Math.floor(Math.random()*gifs.length)];
    await reaction.message.reply(gif);
    messagesRepliedTo.add(reaction.message.id);
})


client.login(process.env.TOKEN);
