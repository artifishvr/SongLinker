const dotenv = require("dotenv");
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const Odesli = require('odesli.js');
const fetch = require('node-fetch');
const { sendLink } = require("./utils/reply");

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});
const odesli = new Odesli();

client.on("ready", () => {
    client.user.setPresence({
        activities: [{ name: `for music links`, type: ActivityType.Watching }],
        status: 'online',
    });

    console.log(`Logged in as ${client.user.tag}!`);
})

client.on("messageCreate", async (message) => {
    const urls = message.content.match(/(https?:\/\/(music\.apple\.com|open\.spotify\.com|soundcloud\.com)\/[^\s]+)/g);

    if (urls) {
        message.channel.sendTyping();
        urls.forEach(async url => {
            try {
                let song = await odesli.fetch(url);

                sendLink(message, song);
            } catch (error) {
                console.error(error);
            }

        });
    }

    if (message.content.startsWith('music:')) {
        message.channel.sendTyping();
        try {
            let MessageContent = message.content.replace('music:', '');
            let song = await odesli.fetch(MessageContent);
            
            sendLink(message, song);
        } catch (error) {
            console.error(error);
        }
    }

});

client.login(process.env.DISCORD_TOKEN);
