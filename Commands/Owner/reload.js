const {
    Client,
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
} = require('discord.js')
const { loadCommands } = require('../../Handlers/commandHandler')
const { loadEvents } = require('../../Handlers/eventHandler')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reload Your Commands Or Events')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('commands')
                .setDescription('Reload Your Commands'),
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('events').setDescription('Reload Your Events'),
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    /**
     *
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (interaction.user.id !== '856956452740792320')
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            'This Command Is Only For The Bot Owner',
                        ),
                ],
                ephemeral: true,
            })
        const subCommand = interaction.options.getSubcommand()
        const Embed = new EmbedBuilder()
            .setTitle('💻 Developer')
            .setColor('Aqua')

        switch (subCommand) {
            case 'commands':
                {
                    loadCommands(client)
                    interaction.reply({
                        embeds: [
                            Embed.setDescription('✅ All Commands Reloaded'),
                        ],
                    })
                    console.log(
                        `${interaction.user.username} Has Reloaded The Commands!`,
                    )
                }
                break
            case 'events':
                {
                    loadEvents(client)
                    interaction.reply({
                        embeds: [
                            Embed.setDescription('✅ All Events Reloaded'),
                        ],
                    })
                    console.log(
                        `${interaction.user.username} Has Reloaded The Events!`,
                    )
                }
                break
        }
    },
}
