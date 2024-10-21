const {
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    Client,
    UserSelectMenuInteraction,
} = require('discord.js')

let selectedUserFinals = {} // Use an object to store selectedUserFinal for each interaction

module.exports = {
    name: Events.InteractionCreate,
    /**
     *
     * @param {UserSelectMenuInteraction} interaction
     * @param {Client} client
     * @returns
     */
    async execute(interaction, client) {
        if (!interaction.isUserSelectMenu()) return
        if (interaction.customId === 'user_select') {
            const selectedUserId = interaction.values[0]
            const selectedUser = await interaction.guild.members.fetch(
                selectedUserId,
            )
            if (
                selectedUser.roles.cache.has('994997307827294298') ||
                selectedUser.roles.cache.has('1119939892277940234') ||
                selectedUser.roles.cache.has('1000485050489520153')
            ) {
                selectedUserFinals[interaction.user.id] = selectedUserId // Store selectedUserFinal using user id as key
                const modal = new ModalBuilder()
                    .setCustomId('submit_form')
                    .setTitle(`Rating For ${selectedUser.user.displayName}`)

                const raid_leading = new TextInputBuilder()
                    .setCustomId('raid_leading')
                    .setLabel('Raid Leading')
                    .setPlaceholder(
                        "Rate the user's raid leading skills (1-10)",
                    )
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(1)

                const roster_building = new TextInputBuilder()
                    .setCustomId('roster_building')
                    .setLabel('Roster Building')
                    .setPlaceholder(
                        "Rate the user's roster building skills (1-10)",
                    )
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(1)

                const vibe = new TextInputBuilder()
                    .setCustomId('vibe')
                    .setLabel('Vibe')
                    .setPlaceholder("Rate the user's vibe (1-10)")
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(1)

                const fairness = new TextInputBuilder()
                    .setCustomId('fairness')
                    .setLabel('Fairness')
                    .setPlaceholder("Rate the user's fairness (1-10)")
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short)
                    .setMinLength(1)

                const description = new TextInputBuilder()
                    .setCustomId('description')
                    .setLabel('Description')
                    .setPlaceholder(
                        'Please provide any additional comments. Keep in mind that organizers can see this.',
                    )
                    .setRequired(true)
                    .setStyle(TextInputStyle.Paragraph)
                    .setMinLength(1)

                const First = new ActionRowBuilder().addComponents(raid_leading)
                const Second = new ActionRowBuilder().addComponents(
                    roster_building,
                )
                const Third = new ActionRowBuilder().addComponents(vibe)
                const Fourth = new ActionRowBuilder().addComponents(fairness)
                const Fifth = new ActionRowBuilder().addComponents(description)

                modal.addComponents(First, Second, Third, Fourth, Fifth)
                await interaction.showModal(modal)
            } else {
                return interaction.reply({
                    content: 'Target user is not an organizer',
                    ephemeral: true,
                })
            }
        }
    },
}

module.exports.getSelectedUserFinals = () => selectedUserFinals // Export the selectedUserFinals object
