const { Events } = require('discord.js')

module.exports = {
    name: Events.InteractionCreate,

    execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return

        const command = client.commands.get(interaction.commandName)

        if (!command) {
            interaction.reply({ content: 'Outdated Command' })
        }
        command.execute(interaction, client)
    },
}
