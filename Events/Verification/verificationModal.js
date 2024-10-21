const { Events, ModalSubmitInteraction, EmbedBuilder } = require('discord.js')
const { getSelectedUserFinals } = require('./verificationprocess-3')
const { Interaction } = require('../../Functions/Interaction')

module.exports = {
    name: Events.InteractionCreate,
    /**
     *
     * @param {ModalSubmitInteraction} interaction
     * @returns
     */
    async execute(interaction, client) {
        if (!interaction.isModalSubmit()) return

        if (!['verification-modal'].includes(interaction.customId)) return
        await interaction.deferReply({ ephemeral: true })

        const Role = interaction.guild.roles.cache.find(
            (r) => r.id === '1118034321303928872',
        )
        const CName = interaction.fields.getTextInputValue('characterName')
        const CLogs = interaction.fields.getTextInputValue('characterLogs')
        const Budget = interaction.fields.getTextInputValue('characterBudget')
        const Interests = interaction.fields.getTextInputValue('interest')
        const selectedUserFinals = getSelectedUserFinals() // Retrieve selectedUserFinals object
        const fullData = selectedUserFinals[interaction.user.id] // Get selectedUserFinal for the current user
        const dataArray = fullData.split('=')

        // Destructure the array into variables named appropriately
        const [Class, spec, roleID, emoji] = dataArray

        const characterEmoji = ':bust_in_silhouette:'
        const logsEmoji = ':scroll:'
        const classEmoji = ':shield:'
        const specEmoji = ':fire:'
        const budgetEmoji = ':moneybag:'
        const interestEmoji = ':information_source:'

        if (Math.sign(Budget) !== 1) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌An Error Occurred')
                .setDescription('You Can Only Use Numbers In **Budget** Field')
            await Interaction(interaction, embed, true)
        } else {
            const VerificationChannel = interaction.guild.channels.cache.get(
                '1234801796371972137',
            )
            const specuserRole = interaction.guild.roles.cache.find(
                (r) => r.id === `${roleID}`,
            )
            const embed1 = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Character Information')
                .setDescription(`Information for <@${interaction.user.id}>`)
                .addFields(
                    {
                        name: `${characterEmoji} Character Name`,
                        value: `${CName}`,
                    },
                    {
                        name: `${logsEmoji} Character Logs`,
                        value: `${CLogs}`,
                        inline: true,
                    },
                    {
                        name: `${classEmoji} Class`,
                        value: `${Class}`,
                    },
                    {
                        name: `${specEmoji} Spec`,
                        value: `${spec}`,
                        inline: true,
                    },
                    {
                        name: `${budgetEmoji} Budget`,
                        value: `${Budget}`,
                        inline: false,
                    },
                    {
                        name: `${interestEmoji} Interest`,
                        value: `${Interests}`,
                        inline: false,
                    },
                )
                .setTimestamp()
            await VerificationChannel.send({
                content: `<@${interaction.user.id}>`,
                embeds: [embed1],
            })
            await interaction.member.roles.add(specuserRole)
            await interaction.member.roles.add(Role)
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('✅Successfully Done')
                .setDescription('Your Verification Info Has Been Submited.')
            await interaction.followUp({ embeds: [embed] })
        }
    },
}
