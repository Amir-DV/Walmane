const {
    Events,
    ModalSubmitInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js')

const { getSelectedUserFinals } = require('./ratingprocess-2.js')

module.exports = {
    name: Events.InteractionCreate,
    /**
     *
     * @param {ModalSubmitInteraction} interaction
     * @param {Object} interactionData
     * @returns
     */
    async execute(interaction, interactionData, client) {
        if (!interaction.isModalSubmit()) return

        if (!['submit_form'].includes(interaction.customId)) return
        // interaction.customId.split('_')[0]

        const raid_leading =
            interaction.fields.getTextInputValue('raid_leading')
        const roster_building =
            interaction.fields.getTextInputValue('roster_building')
        const vibe = interaction.fields.getTextInputValue('vibe')
        const fairness = interaction.fields.getTextInputValue('fairness')
        const description = interaction.fields.getTextInputValue('description')
        const selectedUserFinals = getSelectedUserFinals() // Retrieve selectedUserFinals object
        const selectedUserId = selectedUserFinals[interaction.user.id] // Get selectedUserFinal for the current user

        const Values = [raid_leading, roster_building, vibe, fairness]
        if (
            Math.sign(raid_leading) !== 1 ||
            Math.sign(roster_building) !== 1 ||
            Math.sign(vibe) !== 1 ||
            Math.sign(fairness) !== 1
        ) {
            return interaction.reply({
                content:
                    'Error: Invalid input. Please enter numbers between 1 and 10.',
                ephemeral: true,
            })
        }
        const outOfRangeValues = Values.filter(
            (value) => value < 1 || value > 10,
        )

        if (outOfRangeValues.length > 0) {
            return interaction.reply({
                content:
                    'Error: Invalid input. Please enter numbers between 1 and 10.',
                ephemeral: true,
            })
        }

        const submitterId = interaction.user.id
        const calculateStars = (rating) => {
            const fullStars = Math.floor(rating / 2)
            const hasHalfStar = rating % 2 !== 0
            const halfStar = hasHalfStar
                ? '<:half_star:1207773573955981423> '
                : ''
            const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
            const stars =
                '⭐'.repeat(fullStars) + halfStar + ' '.repeat(remainingStars)
            return stars
        }

        const averageScore =
            (parseFloat(raid_leading) +
                parseFloat(roster_building) +
                parseFloat(vibe) +
                parseFloat(fairness)) /
            4
        const averageStars = calculateStars(averageScore)
        // Create the embed message for the submission
        const Row = new ActionRowBuilder().setComponents(
            new ButtonBuilder()
                .setCustomId('rating-verification-confirm')
                .setLabel('Confirm')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('rating-verification-decline')
                .setLabel('Decline')
                .setEmoji('❌')
                .setStyle(ButtonStyle.Primary),
        )

        const submissionEmbed = new EmbedBuilder()
            .setTitle('Organizer Rating Submission')
            .setDescription('A rating submission has been received.')
            .setColor('#4CAF50') // Green color scheme
            .setDescription(`:orange_book: Description \n ${description}`)
            .addFields(
                {
                    name: ':crossed_swords: Raid leading',
                    value: `${raid_leading}/10\n${calculateStars(
                        raid_leading,
                    )}`,
                    inline: true,
                },
                {
                    name: ':building_construction: Roster Building',
                    value: `${roster_building}/10\n${calculateStars(
                        roster_building,
                    )}`,
                    inline: true,
                },
                {
                    name: ':sparkles: Vibe',
                    value: `${vibe}/10\n${calculateStars(vibe)}`,
                    inline: true,
                },
                {
                    name: ':balance_scale: Fairness',
                    value: `${fairness}/10\n${calculateStars(fairness)}`,
                    inline: true,
                },
                { name: '\u200B', value: '\u200B' }, // Empty field for spacing
                {
                    name: ':bar_chart: Average Score',
                    value: `${averageScore.toFixed(2)}/10\n${averageStars}`,
                    inline: true,
                },
                {
                    name: ':busts_in_silhouette: For User',
                    value: `<@${selectedUserId}>`,
                    inline: false,
                },
                {
                    name: ':bust_in_silhouette: Submitted by',
                    value: `<@${submitterId}>`,
                    inline: true,
                },
                {
                    name: '🔰 Status',
                    value: `➖`,
                    inline: false,
                },
            )
            .setTimestamp()

        // Get the specific channel where you want to send the submission
        const channel = interaction.guild.channels.cache.get(
            '1202879006345662524',
        ) // Replace YOUR_CHANNEL_ID with the actual channel ID

        // Send the embed message to the specified channel
        if (channel && channel.isTextBased()) {
            channel.send({
                content: '<@&996424602186174504>',
                embeds: [submissionEmbed],
                components: [Row],
            })
            interaction.reply({
                content: 'Rating submission received. Thank you!',
                ephemeral: true,
            })
        } else {
            console.log('Error: Channel not found or not a text channel.')
        }

        // Reply with a confirmation message
    },
}
