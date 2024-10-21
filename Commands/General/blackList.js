const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    PermissionFlagsBits,
} = require('discord.js')

const Blacklist = require('../../Models/blackList')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription("Add Someone To Blacklist ( It Can't Be Removed )")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription(
                    "Add Someone To Blacklist ( It Can't Be Removed ) ",
                )
                .addUserOption((user) =>
                    user
                        .setName('user')
                        .setDescription('The User You Want To Add To Blacklist')
                        .setRequired(true),
                )
                .addStringOption((reason) =>
                    reason
                        .setName('reason')
                        .setDescription('Title Of Your Reason')
                        .setRequired(true),
                )
                .addStringOption((comment) =>
                    comment
                        .setName('comment')
                        .setDescription('More Info In Details.')
                        .setRequired(true),
                ),
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false })
        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('✅User Added To The Blacklist')

        const errEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('⭕User Detected On Blacklist')

        const subCommand = interaction.options.getSubcommand()

        switch (subCommand) {
            case 'add': {
                const user = interaction.options.getUser('user')
                const reason = interaction.options.getString('reason')
                const comment = interaction.options.getString('comment')
                const List = await Blacklist.find({
                    userId: user.id,
                })
                if (!List?.length) {
                    const date = new Date()
                    new Blacklist({
                        userId: user.id,
                        guildId: interaction.guild.id,
                        reason: reason,
                        comments: comment,
                        timestamp: date.toLocaleDateString(),
                    }).save()
                    embed.setDescription(
                        `**${user} Has Been Added To Blacklist \n Reason: ${reason} \n Comment: ${comment}**`,
                    ),
                        await interaction.followUp({ embeds: [embed] })
                } else {
                    errEmbed.setDescription(
                        `**${user} Is Already On Blacklist , Can't Add Him Again**`,
                    ),
                        await interaction.followUp({ embeds: [embed] })
                }
            }
        }
    },
}
