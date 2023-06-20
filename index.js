const dotenv = require("dotenv");
const { Client, GatewayIntentBits, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Odesli = require('odesli.js');
const fetch = require('node-fetch');

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

    const removeButton = new ButtonBuilder().setCustomId('remove').setLabel('Delete').setStyle(ButtonStyle.Danger);
    const buttonRow = new ActionRowBuilder().addComponents(removeButton);
    const collectorFilter = (i) => i.user.id === message.author.id

    if (urls) {
        message.channel.sendTyping();
        urls.forEach(async url => {
            try {
                let song = await odesli.fetch(url);

                message.reply({
                    content: `${song.pageUrl}`,
                    failIfNotExists: true,
                    components: [buttonRow]
                }).then(async sentMessage => {
                    try {
                        const confirmation = await sentMessage.awaitMessageComponent({ filter: collectorFilter, time: 30000 });
                        if (confirmation.customId === 'remove') {
                            await sentMessage.delete();
                        };
                    } catch (e) {
                        await sentMessage.edit({ components: [] });
                    }
                });
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
            message.reply({
                content: `${song.pageUrl}`,
                failIfNotExists: true,
                components: [buttonRow]
            }).then(async sentMessage => {
                try {
                    const confirmation = await sentMessage.awaitMessageComponent({ filter: collectorFilter, time: 30000 });
                    if (confirmation.customId === 'remove') {
                        await sentMessage.delete();
                    };
                } catch (e) {
                    await sentMessage.edit({ components: [] });
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

});

client.login(process.env.DISCORD_TOKEN);
