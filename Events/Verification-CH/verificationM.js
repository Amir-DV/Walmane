const {
    Events,
    ModalSubmitInteraction,
    EmbedBuilder,
    Client,
} = require('discord.js')

module.exports = {
    name: Events.InteractionCreate,
    /**
     *
     * @param {ModalSubmitInteraction} interaction
     * @param {Client} client
     * @returns
     */
    async execute(interaction, client) {
        if (!interaction.isModalSubmit()) return

        if (!['decline'].includes(interaction.customId)) return

        await interaction.deferReply({ ephemeral: true })

        const Reason = interaction.fields.getTextInputValue('decline-reason')

        const Embed = interaction.message.embeds[0]
        const Fields = Embed.fields
        const User = Fields.find((Field) => Field.name.includes('Organizer'))
        const Index = Fields.indexOf({ name: 'Confirmed' })
        const Ch_Log = interaction.guild.channels.cache.get(
            '1202976505542615140',
        )
        client.users
            .fetch(`${User.value.substring(2, User.value.length - 1)}`)
            .then(async (user) => {
                const replyEmbed = new EmbedBuilder()
                    .setColor('Grey')
                    .setDescription(
                        'Your Channel Creation Request Has Been Declined.',
                    )
                    .addFields({ name: '**Reason**', value: `${Reason}` })
                await user
                    .send({ embeds: [replyEmbed] })
                    .then((msg) => {
                        const Embed = new EmbedBuilder()
                            .setTitle('💎Channel Create Notification💎')
                            .setDescription(
                                `Sent A Message To <@${user.id}> To Notify Them`,
                            )
                        Ch_Log.send({
                            embeds: [Embed],
                        })
                    })
                    .catch((err) => {
                        const Embed = new EmbedBuilder()
                            .setTitle('💎Channel Create Notification💎')
                            .setDescription(
                                `Couldn't Sent A Message To <@${user.id}> To Notify Them`,
                            )
                        Ch_Log.send({
                            embeds: [Embed],
                        })
                    })
            })

        const replyInteraction = new EmbedBuilder()
            .setColor('DarkGrey')
            .setDescription(`Done`)
        await interaction.followUp({
            embeds: [replyInteraction],
            ephemeral: true,
        })
        const embed = new EmbedBuilder(Embed)
            .spliceFields(Index, 1, {
                name: 'Status',
                value: '❌',
            })
            .addFields({ name: 'Decline Reason', value: `${Reason}` })

        const msg = await interaction.channel.messages.fetch(
            `${interaction.message.id}`,
        )
        msg.edit({ embeds: [embed] })
    },
}
