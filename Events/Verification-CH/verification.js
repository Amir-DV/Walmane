const {
    Events,
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    Client,
} = require('discord.js')

//Day Category Functions.

const {
    Co_Owner_With_Badge_Day,
} = require('../../Functions/Channel-Create/Day-Category/Co-Owner-With-Badge-Day')
const {
    Co_Owner_Without_Badge_Day,
} = require('../../Functions/Channel-Create/Day-Category/Co-Owner-Without-Badge-Day')
const {
    No_Co_Owner_With_Badge_Day,
} = require('../../Functions/Channel-Create/Day-Category/No-Co-Owner-With-Badge-Day')
const {
    No_Co_Owner_Without_Badge_Day,
} = require('../../Functions/Channel-Create/Day-Category/No-Co-Owner-Without-Badge-Day')
module.exports = {
    name: Events.InteractionCreate,
    /**
     *
     * @param {ButtonInteraction} interaction
     * @param {Client} client
     * @returns
     */
    async execute(interaction, client) {
        if (!interaction.isButton()) return

        if (
            !['ch-verification-confirm', 'ch-verification-decline'].includes(
                interaction.customId,
            )
        )
            return

        const Embed = interaction.message.embeds[0]
        const Fields = Embed.fields
        const State = Fields.find((Field) => Field.name === 'Status')

        //Create Channel Data

        const categoryField = Fields.find((Field) =>
            Field.name.includes('Category'),
        ).value
        const raidField = Fields.find((Field) =>
            Field.name.includes('Raid'),
        ).value
        const timeField = Fields.find((Field) =>
            Field.name.includes('Time Period'),
        ).value
        const coOwnerField = Fields.find((Field) =>
            Field.name.includes('Co-Owner'),
        )
        const organizerField = Fields.find((Field) =>
            Field.name.includes('Organizer'),
        ).value

        //Splitting raidField To Get Raid Name And Size Seperetely
        const raidfieldParts = raidField.split('-')
        const raidName = raidfieldParts[0].toLowerCase()
        const raidSize = raidfieldParts[1]

        //Splitting timeField To Get Hour:Minute Period
        const timefieldParts = timeField.split(':')
        const hour = timefieldParts[0]
        const minuteAndPeriod = timefieldParts[1].split(' ')
        let minute = minuteAndPeriod[0]
        minute = minute === '00' ? '' : minute
        const period = minuteAndPeriod[1][0]

        //Splitting categoryField To Get Category Name (EX: Tuesday) And categoryID
        const categoryfieldParts = categoryField.split('/')
        const dayroleName = categoryfieldParts[0].split(' ')[0]
        const categoryID = categoryfieldParts[1]

        const shortDay = dayroleName.substring(0, 2)
        const dayRoleID = interaction.guild.roles.cache.find(
            (role) => role.name === `${dayroleName}`,
        ).id
        const everyDayRoleID = interaction.guild.roles.cache.find(
            (role) => role.id === '1160318436082208859',
        ).id
        const organizerID = organizerField.match(/\d+/)[0]
        const coOwnerID =
            coOwnerField.value === 'No One'
                ? undefined
                : coOwnerField.value.match(/\d+/)[0]

        const Organizer = await interaction.guild.members.fetch(
            `${organizerID}`,
        )
        let badgeRoleID
        let OrganizerEmoji
        let OrgName
        const emojiRegex = /\p{Emoji}/u
        if (emojiRegex.test(Organizer.nickname.split(/.*?/u)[0]) === true) {
            OrganizerEmoji = Organizer.nickname.split(/.*?/u)[0]
            const badgeRole = interaction.guild.roles.cache.find(
                (role) =>
                    role.name.includes('Badge') &&
                    role.name.includes(`${OrganizerEmoji}`),
            )
            if (badgeRole !== undefined || null) {
                badgeRoleID = badgeRole.id
            }
            OrgName =
                Organizer.nickname.substring(1) ||
                Organizer.user.username.substring(1)
        } else {
            OrgName =
                Organizer.nickname.substring(0) ||
                Organizer.user.username.substring(0)
        }

        const blacklistRoleID = interaction.guild.roles.cache.find(
            (role) => role.id === '1110470834021212182',
        ).id

        const emojiMap = {
            bwd: '🗻',
            bot: '🐉',
            tfw: '🌀',
            fl: '🌋',
            ds: '🔮',
            wt: '🌍',
        }
        const roleMap = {
            bwd: '1234618322595614751',
            bot: '1234618013148512297',
            tfw: '1234618294242377759',
            fl: '1234618155255463937',
            ds: '1234618483866599475',
            wt: '1237702575894167622',
        }

        const Emoji = emojiMap[raidName.toLowerCase()]
        const raidRole = roleMap[raidName.toLowerCase()]

        const raidRoleID = interaction.guild.roles.cache.find(
            (role) => role.id === raidRole,
        ).id
        //Create Channel Data Finish
        const embedReply = new EmbedBuilder()
        if (interaction.customId === 'ch-verification-decline') {
            if (State.value === '✅') {
                if (interaction.isRepliable()) {
                    embedReply.setColor('DarkGreen')
                    embedReply.setDescription(
                        "-- This Channel Has Already Been Confirmed , You Can't Decline It Now",
                    )
                    if (!interaction.replied && !interaction.deferred) {
                        return interaction.reply({
                            embeds: [embedReply],
                            ephemeral: true,
                        })
                    }

                    if (interaction.deferred) {
                        return interaction.editReply({ embeds: [embedReply] })
                    }

                    // replied && !deferred
                    return interaction.followUp({
                        embeds: [embedReply],
                        ephemeral: true,
                    })
                }
            } else if (State.value === '❌') {
                if (interaction.isRepliable()) {
                    const embedReply = new EmbedBuilder()
                    embedReply.setColor('DarkRed')
                    embedReply.setDescription(
                        "-- This Channel Has Already Been Declined , You Can't Decline It Again",
                    )
                    if (!interaction.replied && !interaction.deferred) {
                        return interaction.reply({
                            embeds: [embedReply],
                            ephemeral: true,
                        })
                    }

                    if (interaction.deferred) {
                        return interaction.editReply({ embeds: [embedReply] })
                    }

                    // replied && !deferred
                    return interaction.followUp({
                        embeds: [embedReply],
                        ephemeral: true,
                    })
                }
            } else {
                const modal = new ModalBuilder()
                    .setCustomId('decline')
                    .setTitle('❌Decline Form')

                const declineReason = new TextInputBuilder()
                    .setCustomId('decline-reason')
                    .setLabel('Decline Reason')
                    .setPlaceholder(
                        'Provide The Reason Why You Declining The Request ( Org Will Be Notified ).',
                    )
                    .setRequired(true)
                    .setStyle(TextInputStyle.Paragraph)
                    .setMinLength(1)

                const First = new ActionRowBuilder().addComponents(
                    declineReason,
                )

                modal.addComponents(First)
                await interaction.showModal(modal)
            }
        } else if (interaction.customId === 'ch-verification-confirm') {
            if (State.value === '✅') {
                if (interaction.isRepliable()) {
                    embedReply.setColor('DarkGreen')
                    embedReply.setDescription(
                        "-- This Channel Has Already Been Confirmed , You Can't Confirm It Again",
                    )
                    if (!interaction.replied && !interaction.deferred) {
                        return interaction.reply({
                            embeds: [embedReply],
                            ephemeral: true,
                        })
                    }

                    if (interaction.deferred) {
                        return interaction.editReply({ embeds: [embedReply] })
                    }

                    // replied && !deferred
                    return interaction.followUp({
                        embeds: [embedReply],
                        ephemeral: true,
                    })
                }
            } else if (State.value === '❌') {
                if (interaction.isRepliable()) {
                    const embedReply = new EmbedBuilder()
                    embedReply.setColor('DarkRed')
                    embedReply.setDescription(
                        "-- This Channel Has Already Been Declined , You Can't Decline It Now",
                    )
                    if (!interaction.replied && !interaction.deferred) {
                        return interaction.reply({
                            embeds: [embedReply],
                            ephemeral: true,
                        })
                    }

                    if (interaction.deferred) {
                        return interaction.editReply({ embeds: [embedReply] })
                    }

                    // replied && !deferred
                    return interaction.followUp({
                        embeds: [embedReply],
                        ephemeral: true,
                    })
                }
            } else {
                switch (coOwnerID) {
                    case undefined:
                        {
                            switch (badgeRoleID) {
                                case undefined:
                                    {
                                        No_Co_Owner_Without_Badge_Day(
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
                                        )
                                    }
                                    break
                                default: {
                                    No_Co_Owner_With_Badge_Day(
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
                                        badgeRoleID,
                                        Embed,
                                        Emoji,
                                        raidRoleID,
                                    )
                                }
                            }
                        }
                        break
                    default: {
                        const CoownerRealID = (
                            await interaction.guild.members.fetch(coOwnerID)
                        ).id

                        switch (badgeRoleID) {
                            case undefined:
                                {
                                    Co_Owner_Without_Badge_Day(
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
                                        CoownerRealID,
                                        Embed,
                                        Emoji,
                                        raidRoleID,
                                    )
                                }
                                break
                            default: {
                                Co_Owner_With_Badge_Day(
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
                                    CoownerRealID,
                                    badgeRoleID,
                                    Embed,
                                    Emoji,
                                    raidRoleID,
                                )
                            }
                        }
                    }
                }
            }
        }
    },
}
