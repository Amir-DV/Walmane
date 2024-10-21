const {
    Events,
    ButtonInteraction,

    EmbedBuilder,
    Client,
} = require('discord.js')

//Day Category Functions.

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
            ![
                'rating-verification-confirm',
                'rating-verification-decline',
            ].includes(interaction.customId)
        )
            return

        const Embed = interaction.message.embeds[0]
        const Fields = Embed.fields

        const orgs_rating_ch = interaction.guild.channels.cache.get(
            '1202879136142463016',
        )
        const Index = Fields.indexOf({ name: '🔰 Status' })
        const State = Fields.find((Field) => Field.name === '🔰 Status')

        const Organizer = Fields.find(
            (Field) => Field.name === ':busts_in_silhouette: For User',
        ).value

        //Create Channel Data

        //Create Channel Data Finish
        const embedReply = new EmbedBuilder()
        if (interaction.customId === 'rating-verification-decline') {
            if (State.value === '✅') {
                if (interaction.isRepliable()) {
                    embedReply.setColor('DarkGreen')
                    embedReply.setDescription(
                        "-- This Rating Has Already Been Confirmed , You Can't Decline It Now",
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
                        "-- This Rating Has Already Been Declined , You Can't Decline It Again",
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
                const embed = new EmbedBuilder(Embed).spliceFields(Index, 1, {
                    name: '🔰 Status',
                    value: '❌',
                })

                const msg = await interaction.channel.messages.fetch(
                    `${interaction.message.id}`,
                )
                msg.edit({ embeds: [embed] })
                const embedReply = new EmbedBuilder()
                embedReply.setColor('DarkRed')
                embedReply.setDescription('-- Declined The Rating!')
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
        } else if (interaction.customId === 'rating-verification-confirm') {
            if (State.value === '✅') {
                if (interaction.isRepliable()) {
                    embedReply.setColor('DarkGreen')
                    embedReply.setDescription(
                        "-- This Rating Has Already Been Confirmed , You Can't Confirm It Again",
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
                        "-- This Rating Has Already Been Declined , You Can't Confirm It Now",
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
                const embed2 = new EmbedBuilder(Embed).spliceFields(Index, 1, {
                    name: '🔰 Status',
                    value: '✅',
                })

                const msg = await interaction.channel.messages.fetch(
                    `${interaction.message.id}`,
                )
                msg.edit({ embeds: [embed2] })

                const embed = new EmbedBuilder(Embed).spliceFields(7, 2, {
                    name: 'Original Message',
                    value: `https://discord.com/channels/992300928067698759/1202879006345662524/${interaction.message.id}`,
                })

                orgs_rating_ch.send({
                    content: `||${Organizer}||`,
                    embeds: [embed],
                })
                const embedReply = new EmbedBuilder()
                embedReply.setColor('DarkRed')
                embedReply.setDescription('-- Confirmed The Rating')
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
        }
    },
}
