const {
    SlashCommandBuilder,
    Client,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verification_setup')
        .setDescription('Setup The Verification Form For Users To Verify')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false })

        const embed = new EmbedBuilder()
            .setTitle('Verification System')
            .setDescription('Verify your character')
            .setColor('#FF5733')
            .addFields({
                name: 'Instructions',
                value: 'Click the button below to start the verification process.',
            })

        const Row = new ActionRowBuilder().setComponents(
            new ButtonBuilder()
                .setCustomId('verification')
                .setLabel('Submit')
                .setStyle(ButtonStyle.Primary),
        )

        interaction.followUp({ embeds: [embed], components: [Row] })
    },
}
