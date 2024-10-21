const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    PermissionFlagsBits,
} = require('discord.js')

const Blacklist = require('../../Models/blackList')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist_show')
        .setDescription('Show A List Of Blacklisted Users.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false })

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle(`✅BLACKLISTS`)

        const errEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('⭕Nothing Found')

        const List = await Blacklist.find({
            guildId: interaction.guild.id,
        })
        if (!List?.length) {
            errEmbed.setDescription(`**There Is No Blacklisted User.\n**`),
                await interaction.followUp({ embeds: [errEmbed] })
        } else {
            const embedDescripption = List.map((warn) => {
                return [
                    `BlackListID: ${warn._id}`,
                    `UserId: <@${warn.userId}>`,
                    `Reason: ${warn.reason}`,
                    `Comments: ${warn.comments}`,
                    `Date: ${warn.timestamp}`,
                ].join('\n')
            }).join(`\n\n`)

            embed.setDescription(embedDescripption)
            await interaction.followUp({ embeds: [embed] })
        }
    },
}
