const {
    SlashCommandBuilder,
    Client,
    EmbedBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
} = require('discord.js')

const WarningList = require('../../Models/warningList')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warninglist')
        .setDescription('Show Warnings Of A Users')
        .addUserOption((user) =>
            user
                .setName('user')
                .setDescription('The User You Want The Warnings Of')
                .setRequired(true),
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false })

        const embed = new EmbedBuilder().setColor('Red')
        const user = interaction.options.getUser('user')
        const List = await WarningList.find({
            userId: user.id,
        })
        const hasRole = interaction.member.roles.cache.some(
            (r) =>
                r.id === '996424602186174504' ||
                r.id === '994997307827294298' ||
                r.id === '1102832639720833074' ||
                r.id === '992580744511758346' ||
                r.id === '1119939892277940234',
        )
        if (hasRole) {
            if (!List?.length) {
                embed.setTitle('⭕Nothing Found⭕'),
                    embed.setDescription(
                        `**${user} Doesnt Have Any Warnings.\n**`,
                    ),
                    interaction.followUp({ embeds: [embed] })
            } else {
                const embedDescripption = List.map((warn) => {
                    const moderator = interaction.guild.members.cache.get(
                        warn.moderatorId,
                    )
                    return [
                        `Warning ID: ${warn._id}`,
                        `UserId: <@${warn.userId}>`,
                        `Moderator: ${moderator || `Not Available`}`,
                        `Reason: ${warn.reason}`,
                        `Comments: ${warn.comments}`,
                        `Date: ${warn.timestamp}`,
                    ].join('\n')
                }).join(`\n\n`)

                embed.setTitle(`Warning List`)
                embed.setDescription(embedDescripption)
                interaction.followUp({ embeds: [embed] })
            }
        } else {
            if (interaction.user.id === user.id) {
                if (!List?.length) {
                    embed.setTitle('⭕Nothing Found⭕'),
                        embed.setDescription(
                            `**You Dont Have Any Warnings.\n**`,
                        ),
                        interaction.followUp({
                            embeds: [embed],
                            ephemeral: true,
                        })
                } else {
                    const embedDescripption = List.map((warn) => {
                        const moderator = interaction.guild.members.cache.get(
                            warn.moderatorId,
                        )

                        return [
                            `Warning ID: ${warn._id}`,
                            `UserId: <@${warn.userId}>`,
                            `Moderator: ${moderator || `Not Available`}`,
                            `Reason: ${warn.reason}`,
                            `Comments: ${warn.comments}`,
                            `Date: ${warn.timestamp}`,
                        ].join('\n')
                    }).join(`\n\n`)

                    embed.setTitle(`Warning List`)
                    embed.setColor('RANDOM')
                    embed.setDescription(embedDescripption)
                    interaction.followUp({ embeds: [embed] })
                }
            } else {
                embed.setTitle('⭕Invalid Entry⭕'),
                    embed.setDescription(
                        `**You Can Only See Your Own Warnings.\n**`,
                    ),
                    interaction.followUp({ embeds: [embed], ephemeral: true })
            }
        }
    },
}
