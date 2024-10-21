const {
    Events,
    ButtonInteraction,
    ActionRowBuilder,
    EmbedBuilder,
    Client,
    UserSelectMenuBuilder,
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

        if (interaction.customId === 'submit_rating') {
            // Create the select menu
            const selectMenu = new UserSelectMenuBuilder()
                .setCustomId('user_select')
                .setPlaceholder('Select a user')
                .setMaxValues(1)
                .setMinValues(1)

            // Create a new action row with the select menu
            const selectRow = new ActionRowBuilder().setComponents(selectMenu)

            // Create the ephemeral embed message
            const ephemeralEmbed = new EmbedBuilder()
                .setTitle('Organizers Rating Submission')
                .setDescription(
                    'Please select a user from the dropdown menu below to rate.',
                )
                .setColor('#7289DA')
                .setTimestamp()

            // Send the ephemeral embed message with the select menu
            interaction.reply({
                ephemeral: true,
                embeds: [ephemeralEmbed],
                components: [selectRow],
            })
        }
    },
}
