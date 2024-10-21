const {
    SlashCommandBuilder,
    Client,
    EmbedBuilder,
    ChatInputCommandInteraction,
    PermissionFlagsBits,
} = require('discord.js')

const WarningList = require('../../Models/warningList')
const Blacklist = require('../../Models/blackList')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warning')
        .setDescription(
            'Add/Remove Warning Of A User, Or Show A List Of Warnings Of A User.',
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription('Add A  Warning Strike To A User')
                .addUserOption((user) =>
                    user
                        .setName('user')
                        .setDescription('The User You Want To Add Strike')
                        .setRequired(true),
                )
                .addUserOption((moderator) =>
                    moderator
                        .setName('moderator')
                        .setDescription('The Person Who Asks For The Warning')
                        .setRequired(true),
                )
                .addStringOption((reason) =>
                    reason
                        .setName('reason')
                        .setDescription('Title Of Your Reason')
                        .setRequired(true)
                        .addChoices(
                            { name: 'cheap', value: 'Cheap' },
                            { name: 'flakey', value: 'Flakey' },
                            { name: 'ghosted', value: 'Ghosted' },
                            { name: 'rat', value: 'Rat' },
                            {
                                name: 'too_low_performance',
                                value: 'Too Low Performance',
                            },
                            { name: 'other', value: 'Other' },
                        ),
                )
                .addStringOption((comment) =>
                    comment
                        .setName('comment')
                        .setDescription('More Info In Details.')
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription('Remove A Strike From A User')
                .addStringOption((warning_id) =>
                    warning_id
                        .setName('warning_id')
                        .setDescription('Warning Id Of The Strike To Remove')
                        .setRequired(true),
                ),
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false })

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('⭕A Strike Has Been Added To The User⭕')

        const dmEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('⭕You Have Been Issued A Warning On Wal-Mane⭕')
        const subCommand = interaction.options.getSubcommand()
        const Ch_Log = interaction.guild.channels.cache.get(
            '1202976505542615140',
        )

        switch (subCommand) {
            case 'add':
                {
                    const user = interaction.options.getUser('user')
                    const moderator = interaction.options.getUser('moderator')
                    const reason = interaction.options.getString('reason')
                    const comment = interaction.options.getString('comment')
                    const date = new Date()

                    const List = await WarningList.find({
                        userId: user.id,
                    })
                    if (List.length <= 3) {
                        new WarningList({
                            userId: user.id,
                            guildId: interaction.guild.id,
                            moderatorId: moderator.id,
                            reason: reason,
                            comments: comment,
                            timestamp: date.toLocaleDateString(),
                        }).save()
                        if (List.length === 3) {
                            const Owner = client.users.cache.get(`${user.id}`)
                            new Blacklist({
                                userId: user.id,
                                guildId: interaction.guild.id,
                                reason: 'Maximum Strikes',
                                comments:
                                    'User Reached Maximum (4) Warnings , And Has Been Automatically Added To The Blacklist',
                                timestamp: date.toLocaleDateString(),
                            }).save()
                            embed.setDescription(
                                `**Added A Strike To ${user}  \n Reason: ${reason} \n Comment: ${comment} \n \n Also User Was Added To Blacklist Since It Was Their 4th Warning.**`,
                            ),
                                interaction.followUp({ embeds: [embed] })

                            let StringData = ' '
                            let number = 1
                            List.map(async (data) => {
                                StringData =
                                    StringData +
                                    `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                number += 1
                            })
                            dmEmbed.setDescription(
                                `**This Is Your Warning ${
                                    List.length + 1
                                }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                    List.length + 1
                                }-Reason ${reason} -Comment: ${comment} -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. If You Think Your Warning/Blacklist Has Been Done In Error, Please Visit The [Appeal A Warning](https://discord.com/channels/992300928067698759/1008076784660664410) Channel**`,
                            )
                            Owner.send({
                                embeds: [dmEmbed],
                            })
                                .then((msg) => {
                                    const Embed = new EmbedBuilder()
                                        .setTitle('❌Warning Notification❌')
                                        .setDescription(
                                            `Sent A Message To <@${user.id}> To Notify Them`,
                                        )
                                    Ch_Log.send({
                                        embeds: [Embed],
                                    })
                                })
                                .catch((err) => {
                                    const Embed = new EmbedBuilder()
                                        .setTitle('❌Warning Notification❌')
                                        .setDescription(
                                            `Couldn't Sent A Message To <@${user.id}> To Notify Them`,
                                        )
                                    Ch_Log.send({
                                        embeds: [Embed],
                                    })
                                })
                        } else {
                            const Owner = client.users.cache.get(`${user.id}`)
                            embed.setDescription(
                                `**Added A Strike To ${user}  \n Reason: ${reason} \n Comment: ${comment}**`,
                            ),
                                interaction.followUp({ embeds: [embed] })

                            const DMEmbed = new EmbedBuilder()
                            let StringData = ' '
                            let number = 1
                            List.map(async (data) => {
                                StringData =
                                    StringData +
                                    `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                number += 1
                            })
                            DMEmbed.setDescription(
                                `**This Is Your Warning ${
                                    List.length + 1
                                }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                    List.length + 1
                                }-Reason ${reason} -Comment: ${comment} -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. These warnings are archived/sometimes not sent right away. Please make an appeal ticket in https://discord.com/channels/992300928067698759/1138537358208286823 to clear it if it is passed the 3 week date or you believe it was given in error**`,
                            )
                            Owner.send({
                                embeds: [DMEmbed],
                            })
                                .then((msg) => {
                                    const Embed = new EmbedBuilder()
                                        .setTitle('❌Warning Notification❌')
                                        .setDescription(
                                            `Sent A Message To <@${user.id}> To Notify Them`,
                                        )
                                    Ch_Log.send({
                                        embeds: [Embed],
                                    })
                                })
                                .catch((err) => {
                                    const Embed = new EmbedBuilder()
                                        .setTitle('❌Warning Notification❌')
                                        .setDescription(
                                            `Couldn't Sent A Message To <@${user.id}> To Notify Them`,
                                        )
                                    Ch_Log.send({
                                        embeds: [Embed],
                                    })
                                })
                        }
                    } else if (List.length >= 4) {
                        embed.setTitle('⭕User Detected On Blacklist⭕'),
                            embed.setDescription(
                                `**${user} Has Reached Maximum Warnings And Is On Blacklist , Can't Add Any More Warnings**`,
                            ),
                            interaction.followUp({ embeds: [embed] })
                    }
                }
                break
            default: {
                const warnId = interaction.options.getString('warning_id')
                const List = await WarningList.findById(warnId)
                if (!List) {
                    embed.setTitle('⭕Nothing Found⭕'),
                        embed.setDescription(
                            `**Warning Id Provided Is Not Valid. Please Try Again**`,
                        ),
                        interaction.followUp({ embeds: [embed] })
                } else {
                    const user = interaction.guild.members.cache.get(
                        List.userId,
                    )
                    await WarningList.findByIdAndDelete(warnId)
                    embed.setTitle('Removed Successfully✅'),
                        embed.setColor('Green'),
                        embed.setDescription(
                            `**Remove A Strike From ${user} By  The Id Of : ${warnId} \n**`,
                        ),
                        interaction.followUp({ embeds: [embed] })
                }
            }
        }
    },
}
