const {
    Events,
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    Client,
    PermissionFlagsBits,
    ChannelType,
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
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
                'sunday',
                'monday',
                '1212101463233265724',
            ].includes(interaction.customId)
        )
            return
        await interaction.deferReply({ ephemeral: true })

        const memberRoles = interaction.member.roles

        if (interaction.customId === '1212101463233265724') {
            const popupRole = interaction.guild.roles.cache.find(
                (role) => role.id === interaction.customId,
            )
            const haspopupRole = memberRoles.cache.find(
                (r) => r.id === interaction.customId,
            )
            if (haspopupRole) {
                await memberRoles.remove(popupRole.id)

                successInteraction(
                    interaction,
                    `You Successfully Removed These Roles <@&${popupRole.id}>`,
                )
            } else {
                await memberRoles.add(popupRole.id)
                successInteraction(
                    interaction,
                    `You Successfully Gained These Roles <@&${popupRole.id}>`,
                )
            }
        } else {
            const Role = interaction.guild.roles.cache.find(
                (role) => role.name.toLowerCase() === interaction.customId,
            )
            const hasRole = memberRoles.cache.find(
                (r) => r.name.toLowerCase() === interaction.customId,
            )
            if (hasRole) {
                await memberRoles.remove(Role.id)

                successInteraction(
                    interaction,
                    `You Successfully Removed These Roles <@&${Role.id}>`,
                )
            } else {
                await memberRoles.add(Role.id)
                successInteraction(
                    interaction,
                    `You Successfully Gained These Roles <@&${Role.id}>`,
                )
            }
        }
    },
}

function successInteraction(interaction, description) {
    interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setColor('Green')
                .setDescription(` - ${description}`),
        ],
    })
}
