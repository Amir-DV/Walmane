const { ChannelType, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const { Interaction } = require('../../Interaction')

async function No_Co_Owner_Without_Badge_Day(
    interaction,
    OrganizerEmoji,
    shortDay,
    hour,
    minute,
    period,
    raidName,
    raidSize,
    OrgName,
    categoryID,
    everyDayRoleID,
    dayRoleID,
    blacklistRoleID,
    organizerID,
    Embed,
    Emoji,
    raidRoleID,
) {
    try {
        await interaction.guild.channels
            .create({
                name: `${
                    OrganizerEmoji || '🛒'
                }${Emoji}${shortDay}-${hour}${minute}${period}-${raidName}${raidSize}-${OrgName}`,
                type: ChannelType.GuildText,
                parent: categoryID,

                permissionOverwrites: [
                    {
                        id: dayRoleID,
                        allow: [PermissionFlagsBits.ViewChannel],
                        deny: [PermissionFlagsBits.SendMessages],
                    },
                    {
                        id: raidRoleID,
                        allow: [PermissionFlagsBits.ViewChannel],
                        deny: [PermissionFlagsBits.SendMessages],
                    },
                    {
                        id: everyDayRoleID,
                        allow: [PermissionFlagsBits.ViewChannel],
                        deny: [PermissionFlagsBits.SendMessages],
                    },
                    {
                        id: blacklistRoleID,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ViewChannel,
                        ],
                    },
                    {
                        id: organizerID,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.CreatePublicThreads,
                            PermissionFlagsBits.MentionEveryone,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.ManageThreads,
                            PermissionFlagsBits.UseApplicationCommands,
                        ],
                        deny: [PermissionFlagsBits.ManageChannels],
                    },
                ],
            })
            .then(async (C) => {
                C.setPosition(1)
                const Fields = Embed.fields
                const Index = Fields.indexOf({ name: 'Status' })

                const successfulEmbed = new EmbedBuilder()
                    .setTitle('✅Successfully Done')
                    .setColor('Green')
                    .setDescription(`Done`)
                Interaction(interaction, successfulEmbed, true)

                const embed = new EmbedBuilder(Embed)
                    .spliceFields(Index, 1, {
                        name: 'Status',
                        value: '✅',
                    })
                    .addFields({ name: 'Created Channel', value: `<#${C.id}>` })

                const msg = await interaction.channel.messages.fetch(
                    `${interaction.message.id}`,
                )
                msg.edit({ embeds: [embed] })

                const Organizer = await interaction.guild.members.fetch(
                    `${organizerID}`,
                )
                const replyEmbed = new EmbedBuilder()
                    .setColor('Grey')
                    .setDescription(
                        'Your Channel Creation Request Has Been Accepted.',
                    )
                    .addFields({
                        name: '**Channel Link**',
                        value: `<#${C.id}>`,
                    })
                await Organizer.send({ embeds: [replyEmbed] }).catch(() => {})
            })
            .catch(async (err) => {
                const errorEmbed = new EmbedBuilder()
                    .setTitle('❌An Error Occurred')
                    .setColor('Red')
                    .setDescription(
                        `**Couln't Make The Channel , Please Contact Admins**`,
                    )
                Interaction(interaction, errorEmbed, true)

                console.log(err)
            })
    } catch (error) {
        console.log(error)
    }
}

module.exports = { No_Co_Owner_Without_Badge_Day }
