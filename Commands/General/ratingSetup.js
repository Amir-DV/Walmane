const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    PermissionFlagsBits,
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rating_setup')
        .setDescription(
            'Setup The Rating Form For Users To Submit Their Rating',
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false })

        const embed = new EmbedBuilder()
            .setTitle('Rating Setup')
            .setDescription('Rate the organizers.')
            .setColor('#FF5733')
            .addFields({
                name: 'Instructions',
                value: 'Click the button below to start the rating process.',
            })

        const Row = new ActionRowBuilder().setComponents(
            new ButtonBuilder()
                .setCustomId('submit_rating')
                .setLabel('Submit')
                .setStyle(ButtonStyle.Primary),
        )

        interaction.followUp({ embeds: [embed], components: [Row] })
    },
}
