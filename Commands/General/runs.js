const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    ChannelType,
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('runs')
        .setDescription(
            'Will Show All Runs Of An Organizer That Are Set As Active.',
        )
        .addUserOption((user) =>
            user
                .setName('user')
                .setDescription('The Organizer That You Want To See His Runs')
                .setRequired(true),
        )
        .setDMPermission(false),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true })

        const embed = new EmbedBuilder().setColor('Green')

        const user = interaction.options.getUser('user')
        const Organizer = await interaction.guild.members.fetch(user.id)
        if (
            Organizer.roles.cache.has('994997307827294298') ||
            Organizer.roles.cache.has('1119939892277940234')
        ) {
            const OrganizerEmoji = Array.from(Organizer.nickname)[0]
            const Emoji = interaction.guild.roles.cache.find(
                (role) =>
                    role.name.includes('Badge') &&
                    role.name.includes(`${OrganizerEmoji}`),
            )
            if (Emoji) {
                if (interaction.member.roles.cache.has(Emoji.id)) {
                    const Channels = await interaction.guild.channels.fetch()
                    const allChannels = Channels.filter(
                        (c) =>
                            c.type === ChannelType.GuildText &&
                            c.name.includes(`${OrganizerEmoji}`),
                    )

                    const Orgname = Organizer.nickname.substring(1)
                    if (allChannels.size === 0) {
                        embed.setTitle(`No Run Detected For ${Orgname}'s`)
                        await interaction.followUp({ embeds: [embed] })
                    } else {
                        embed.setTitle(`${Orgname}'s Runs✅`)

                        embed.setDescription(
                            `${allChannels.map(
                                (channel) =>
                                    `[${channel.name}](https://discord.com/channels/992300928067698759/${channel.id})\n`,
                            )}`,
                        )
                        await interaction.followUp({ embeds: [embed] })
                    }
                } else {
                    embed.setDescription(
                        `You Don't Have That Organizer Badge , Follow Them First`,
                    )
                    await interaction.followUp({ embeds: [embed] })
                }
            } else {
                embed.setDescription('That Organizer Does Not Have A Badge')
                await interaction.followUp({ embeds: [embed] })
            }
        } else {
            embed.setDescription(
                'That User Doesnt Have <@&994997307827294298> || <@&1119939892277940234> Role',
            )
            await interaction.followUp({ embeds: [embed] })
        }
    },
}
