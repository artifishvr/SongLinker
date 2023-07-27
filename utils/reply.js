const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const removeButton = new ButtonBuilder().setCustomId('remove').setLabel('Delete').setStyle(ButtonStyle.Danger);
const buttonRow = new ActionRowBuilder().addComponents(removeButton);

function sendLink(message, song) {
    const collectorFilter = (i) => i.user.id === message.author.id

    message.reply({
        content: `${song.pageUrl}`,
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