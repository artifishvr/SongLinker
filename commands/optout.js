const { SlashCommand, CommandOptionType } = require('slash-create');

module.exports = class extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'optout',
            description: 'Opt out of automatic song links globally.',
        });
    }

    async run(ctx) {
        const { client } = require('..');

        await ctx.defer();

        if (client.optOutDB.fetch(u => u.user === ctx.user.id)) {
            client.optOutDB.remove(u => u.user === ctx.user.id);
            ctx.sendFollowUp("You have opted back into automatic song links on your messages globally.\nTo opt back out, just run this command again.", { ephemeral: true });
            return;
        }

        client.optOutDB.create({ user: ctx.user.id });

        ctx.sendFollowUp("You have opted out of automatic song links on your messages globally.\nTo opt back in, just run this command again.", { ephemeral: true });
    }
}