const {
    SlashCommandBuilder,
    Client,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('checkmessage')
        .setDescription('blala')
        .addStringOption((id) =>
            id.setName('id').setDescription('MessageID').setRequired(true),
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        const messageID = interaction.options.getString('id')
        const textChannel = await interaction.channel.fetch()

        const message = await textChannel.messages.fetch(messageID)
        console.log(message.embeds)
        console.log(message.embeds[0].fields)
    },
}
