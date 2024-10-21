const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('followers')
        .setDescription(
            'Will Show Total Followers Of An Organizer / Or Will Show A Leaderboard',
        )
        .addUserOption((user) =>
            user
                .setName('user')
                .setDescription(
                    'The Organizer That You Want To See His Followers.',
                )
                .setRequired(false),
        )
        .setDMPermission(false),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false })

        const embed = new EmbedBuilder().setColor('Green')
        const user = interaction.options.getUser('user')
        await interaction.guild.roles.fetch()

        if (user) {
            const Organizer = await interaction.guild.members.fetch(user.id)
            if (!Organizer.roles.cache.has('994997307827294298')) {
                embed.setTitle(`Couldn't detect an organizer `)
                interaction.followUp({ embeds: [embed], ephemeral: true })
            } else {
                const OrganizerEmoji = Array.from(Organizer.nickname)[0]
                const Emoji = interaction.guild.roles.cache.find(
                    (role) =>
                        role.name.includes('Badge') &&
                        role.name.includes(`${OrganizerEmoji}`),
                )
                if (Emoji) {
                    const Followers = Emoji.members.size
                    const Name = Organizer.nickname || Organizer.user.username
                    embed.setTitle(`${Name}'s Followers`)
                    embed.setDescription(`Current Followers: ${Followers}`)
                    interaction.followUp({ embeds: [embed], ephemeral: true })
                } else {
                    embed.setColor('RANDOM')
                    embed.setDescription(
                        'That Organizer Is Not The In Follow System.',
                    )
                    interaction.followUp({ embeds: [embed], ephemeral: true })
                }
            }
        } else {
            interaction
                .followUp('Wait For The Command To Reply')
                .then(async (msg) => {
                    const Roles = interaction.guild.roles.cache.filter((r) =>
                        r.name.includes('Badge'),
                    )
                    let RoleArr = []
                    Roles.forEach((roles) => {
                        RoleArr.push({
                            name: `${roles.name.slice(
                                0,
                                roles.name.indexOf(' '),
                            )}`,
                            value: `${roles.members.size}`,
                        })
                    })

                    const AllList = RoleArr.sort((a, b) => b.value - a.value)
                    const Followers = AllList.slice(0, 10)

                    const FollowersList = Followers.map(
                        (Data) => `\n${Data.name} : ${Data.value}`,
                    )
                    embed.setTitle('TOP Followed Organizers')
                    embed.setDescription(`**${FollowersList}**`)
                    await msg.edit({ embeds: [embed] })
                })
        }
    },
}
