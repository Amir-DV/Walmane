const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    Client,
    EmbedBuilder,
} = require('discord.js')
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Will Clear Set Amount Of Messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false)
        .addIntegerOption((number) =>
            number
                .setName('number')
                .setDescription('Amount Of Messages You Wanna Delete.')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100),
        ),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true })

        const embed = new EmbedBuilder().setColor('Green')
        const Number = interaction.options.getInteger('number')

        try {
            const Messages = await interaction.channel.messages.fetch({
                limit: Number,
            })
            const Filtered = Messages.filter(
                (msg) => Date.now() - msg.createdTimestamp < ms('14 days'),
            )

            await interaction.channel.bulkDelete(Filtered)
            embed.setDescription(`Deleted ${Filtered.size} Number Of Messages`)
            interaction.followUp({ embeds: [embed] })
        } catch (error) {
            embed.setColor('Red')
            embed.setDescription(
                `There Was Something Wrong In Deleting Messages \n\n**ERROR**\n${error}`,
            )
            interaction.followUp({ embeds: [embed] })
        }
    },
}
