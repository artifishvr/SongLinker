const dotenv = require("dotenv");
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const Odesli = require('odesli.js');
const { sendLink } = require("./utils/replyHelper");
const { SlashCreator, GatewayServer } = require('slash-create');
const SimplDB = require('simpl.db');
const path = require('path');
const { setInterval } = require("timers/promises");

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});
const odesli = new Odesli();
const creator = new SlashCreator({
    applicationID: process.env.DISCORD_ID,
    publicKey: process.env.DISCORD_PUBKEY,
    token: process.env.DISCORD_TOKEN,
});

const dbpath = path.resolve('./db/');
const db = new SimplDB({
    dataFile: path.join(dbpath, 'db.json'),
    collectionsFolder: path.join(dbpath, 'collections'),
});

client.optOutDB = db.createCollection('optedout');

function updatePresence() {
    client.user.setPresence({
        activities: [{ name: `for music in ${client.guilds.cache.size} servers`, type: ActivityType.Watching }],
        status: 'online',
    });

    setInterval(updatePresence, 1000 * 60 * 60 * 1);
}

client.on("ready", () => {
    client.user.setPresence({
        activities: [{ name: `for music links`, type: ActivityType.Watching }],
        status: 'online',
    });
    updatePresence();

    console.log(`Logged in as ${client.user.tag}!`);
})

client.on("messageCreate", async (message) => {
    if (client.optOutDB.fetch(u => u.user === message.author.id)) {
        return;
    }

    const urls = message.content.match(/(https?:\/\/(music\.apple\.com|open\.spotify\.com)\/[^\s]+)/g);

    if (urls) {
        message.channel.sendTyping();
        urls.forEach(async url => {
            try {
                let song = await odesli.fetch(url);
                if (!song) return;

                sendLink(message, song);
            } catch (error) {
                console.error(error);
            }

        });
    }

});

creator
    .withServer(
        new GatewayServer(
            (handler) => client.ws.on('INTERACTION_CREATE', handler)
        )
    )
    .registerCommandsIn(path.join(__dirname, 'commands'))
    .syncCommands();

client.login(process.env.DISCORD_TOKEN);
module.exports = {
    client,
    creator,
    odesli
};