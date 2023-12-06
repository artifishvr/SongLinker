const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require("discord.js");
const Vibrant = require('node-vibrant')


async function sendLink(message, song) {
    const linkButton = new ButtonBuilder().setURL(song.pageUrl).setLabel('Listen Anywhere!').setStyle(ButtonStyle.Link);
    const removeButton = new ButtonBuilder().setCustomId('remove').setLabel('Delete').setStyle(ButtonStyle.Danger);

    const primaryRow = new ActionRowBuilder().addComponents(linkButton);
    const configRow = new ActionRowBuilder().addComponents(removeButton);

    const collectorFilter = i => {
        i.deferUpdate();
        return i.user.id === message.author.id;
    };

    const embedcolor = await Vibrant.from(song.thumbnail).getPalette();

    const msgEmbed = new EmbedBuilder()
        .setColor(embedcolor.Vibrant?.hex ?? "#2b2d31")
        .setTitle(`${song.title} by ${song.artist}`)
        .setURL(`${song.pageUrl}`)
        .setAuthor({ name: `${song.artist}` })
        .setThumbnail(`${song.thumbnail}`)
        .setDescription(`${song.type.charAt(0).toUpperCase() + song.type.slice(1)}`)

    message.reply({
        content: ``,
        embeds: [msgEmbed],
        failIfNotExists: true,
        components: [primaryRow, configRow]
    }).then(async sentMessage => {
        try {
            const confirmation = await sentMessage.awaitMessageComponent({ filter: collectorFilter, time: 60000, componentType: ComponentType.Button });
            if (confirmation.customId === 'remove') {
                await sentMessage.delete();
            };
        } catch (e) {
            await sentMessage.edit({ components: [primaryRow] });
        }
    });
}

module.exports = { sendLink }