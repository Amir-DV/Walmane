async function Interaction(interaction, embed, ephemeralBool) {
    try {
        if (interaction.isRepliable()) {
            if (!interaction.replied && !interaction.deferred) {
                return interaction.reply({
                    embeds: [embed],
                    ephemeral: ephemeralBool,
                })
            }

            if (interaction.deferred) {
                return interaction.editReply({ embeds: [embed] })
            }

            // replied && !deferred
            return interaction.followUp({
                embeds: [embed],
                ephemeralBool,
            })
        }
    } catch (error) {
        console.log(error)
    }
}
module.exports = { Interaction }
