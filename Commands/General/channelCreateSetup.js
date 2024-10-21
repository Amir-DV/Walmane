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
        .setName('channel_create_setup')
        .setDescription('Setup The Channel Creation Process For Organizers')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false })

        const embed = new EmbedBuilder()
            .setTitle('Channel Creation')
            .setDescription('Create Your Channel')
            .setColor('#FF5733')
            .addFields({
                name: 'Instructions',
                value: 'Click the button below to start the creating your channel.',
            })

        const Row = new ActionRowBuilder().setComponents(
            new ButtonBuilder()
                .setCustomId('chcreate_25')
                .setLabel('25 Man')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('chcreate_10')
                .setLabel('10 Man')
                .setStyle(ButtonStyle.Primary),
        )

        interaction.followUp({ embeds: [embed], components: [Row] })
    },
}
