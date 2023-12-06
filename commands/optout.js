const { SlashCommand } = require('slash-create');

module.exports = class extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'optout',
            description: 'Opt out of automatic song links.',
        });
    }

    async run(ctx) {
        const { OptedOut } = require('..');

        await ctx.defer({ ephemeral: true });

        let [user, created] = await OptedOut.findOrCreate({ where: { UserID: ctx.user.id } });
        if (created) {
            ctx.sendFollowUp("You have opted out of automatic song links on your messages globally.\nTo opt back in, just run this command again.");
        } else {
            await OptedOut.destroy({ where: { UserID: user.UserID } });
            ctx.sendFollowUp("You have opted back into automatic song links on your messages globally.\nTo opt back out, just run this command again.");
        }

    }
}