const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const { Client, GatewayIntentBits, ActivityType, messageLink } = require("discord.js");
const Odesli = require('odesli.js');

dotenv.config();
const odesli = new Odesli();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.on("ready", () => {
    client.user.setPresence({
        activities: [{ name: `for music`, type: ActivityType.Watching }],
        status: 'dnd',
    });

    console.log(`Logged in as ${client.user.tag}!`);
})

client.on("messageCreate", async (message) => {
    const urls = message.content.match(/(https?:\/\/(music\.apple\.com|open\.spotify\.com|soundcloud\.com)\/[^\s]+)/g);
    if (urls) {
        message.channel.sendTyping();
        urls.forEach(url => {
            odesli.fetch(url).then(song => {
                message.reply(`${song.pageUrl}`, {
                    failIfNotExists: true
                })
            });
        });
    }


});

client.login(process.env.DISCORD_TOKEN);
