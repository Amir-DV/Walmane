const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('follow')
        .setDescription(
            'You Will Follow The Selected Organizer ( If They Are In The System )',
        )
        .addUserOption((user) =>
            user
                .setName('user')
                .setDescription('The Organizer That You Want To Follow.')
                .setRequired(true),
        )
        .setDMPermission(false),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true })

        const embed = new EmbedBuilder().setColor('Green')
        const errEmbed = new EmbedBuilder().setColor('Red')
        const user = interaction.options.getUser('user')
        const Organizer = await interaction.guild.members.fetch(user.id)

        if (
            Organizer.roles.cache.has('994997307827294298') ||
            Organizer.roles.cache.has('1119939892277940234')
        ) {
            const OrganizerEmoji = Array.from(Organizer.nickname)[0]
            const Emoji = interaction.guild.roles.cache.find(
                (role) =>
                    role.name.includes('Badge') &&
                    role.name.includes(`${OrganizerEmoji}`),
            )
            if (Emoji) {
                if (interaction.member.roles.cache.has(Emoji.id)) {
                    errEmbed.setDescription(
                        'You Are Already Following This Organizer.',
                    )
                    interaction.followUp({ embeds: [errEmbed] })
                } else {
                    interaction.member.roles.add(Emoji.id)
                    embed.setDescription(
                        'You Have Successfully Followed That Organizer.',
                    )
                    interaction.followUp({ embeds: [embed] })
                }
            } else {
                errEmbed.setDescription(
                    'That Organizer Is Not Opted In The Follow System',
                )
                interaction.followUp({ embeds: [errEmbed] })
            }
        } else {
            errEmbed.setDescription(
                'That User Doesnt Have <@&994997307827294298> || <@&1119939892277940234> Role',
            )
            interaction.followUp({ embeds: [errEmbed] })
        }
    },
}
