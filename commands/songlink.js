const { SlashCommand, CommandOptionType } = require('slash-create');

module.exports = class extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'songlink',
            description: 'Manually get a song.link.',
            options: [
                {
                    name: 'url',
                    type: CommandOptionType.STRING,
                    description: 'URL to a song/album (On Spotify, Apple Music, Youtube, SoundCloud, etc.)',
                    required: true
                }
            ],
        });
    }

    async run(ctx) {
        const { odesli } = require('..');

        await ctx.defer();

        try {
            let song = await odesli.fetch(ctx.options.url);

            ctx.sendFollowUp(song.pageUrl);
        } catch (error) {
            ctx.sendFollowUp("Couldn't find a song link for your URL.");
        }
    }
}