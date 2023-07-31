const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const removeButton = new ButtonBuilder().setCustomId('remove').setLabel('Delete').setStyle(ButtonStyle.Danger);
const buttonRow = new ActionRowBuilder().addComponents(removeButton);

function sendLink(message, song) {
    const collectorFilter = (i) => i.user.id === message.author.id

    const msgEmbed = {
            "type": "rich",
            "title": `${song.title} by ${song.artist}`,
            "color": 0x2b2d31,
            "author": {
                "name": `${song.artist}`
            },
            "footer": {
              "text": `Powered by Odesli <3`
            },
            "image": {
                "url": `${song.thumbnail}`
              },
            "url": `${song.pageUrl}`
    }

    message.reply({
        content: ``,
        embeds: [msgEmbed],
        failIfNotExists: true,
        components: [buttonRow]
    }).then(async sentMessage => {
        try {
            const confirmation = await sentMessage.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
            if (confirmation.customId === 'remove') {
                await sentMessage.delete();
            };
        } catch (e) {
            await sentMessage.edit({ components: [] });
        }
    });
}

module.exports = { sendLink }