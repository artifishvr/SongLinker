const dotenv = require("dotenv");
const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const Odesli = require('odesli.js');
const { sendLink } = require("./utils/replyHelper");
const { SlashCreator, GatewayServer } = require('slash-create');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

dotenv.config();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/songlinker.db',
    logging: false
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
    allowedMentions: { parse: [], repliedUser: false }
});
const odesli = new Odesli();
const creator = new SlashCreator({
    applicationID: process.env.DISCORD_ID,
    publicKey: process.env.DISCORD_PUBKEY,
    token: process.env.DISCORD_TOKEN,
});

const OptedOut = sequelize.define('OptedOut', {
    UserID: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
});


(async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connection established.');

        await sequelize.sync();
        console.log('Models synced.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

client.on("ready", () => {
    client.user.setPresence({
        activities: [{ name: `for music links`, type: ActivityType.Watching }],
        status: 'online',
    });
    updatePresence();
    console.log(`Logged in as ${client.user.tag}!`);

    setInterval(updatePresence, 1000 * 60 * 60);
})

client.on("messageCreate", async (message) => {
    if ((await getOptedOut(message.author.id)).length > 0) return;

    const urls = message.content.match(/(https?:\/\/(music\.apple\.com|open\.spotify\.com|spotify\.link)\/[^\s]+)/g);

    if (urls) {
        message.channel.sendTyping();
        for (const url of urls) {
            try {
                let song = await odesli.fetch(url);
                if (!song) return;

                sendLink(message, song);
            } catch (error) {
                console.error(error);
            }
        }
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
    odesli,
    OptedOut
};

async function getOptedOut(userid) {
    // TODO add a caching layer here
    const users = await OptedOut.findAll({ where: { UserID: userid } });

    return users;
}

function updatePresence() {
    client.user.setPresence({
        activities: [{ name: `for music in ${client.guilds.cache.size} servers`, type: ActivityType.Watching }],
        status: 'online',
    });
}