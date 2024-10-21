const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    ChannelType,
    StringSelectMenuBuilder,
    ActionRowBuilder,
    EmbedBuilder,
} = require('discord.js')

const autoSignupModel = require('../../Models/autoSignup') // Adjust the path as necessary
const mongoose = require('mongoose')

function chunkArray(array, size) {
    const result = []
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size))
    }
    return result
}

const ClassSpecRoles = {
    DK: [
        { spec: 'Blood_DPS', emoji: '<:DeathKnight:1138946141933805609>' },
        { spec: 'Unholy_DPS', emoji: '<:DeathKnight:1138946141933805609>' },
        { spec: 'Frost_DPS', emoji: '<:DeathKnight:1138946141933805609>' },
        { spec: 'Blood_Tank', emoji: '<:DeathKnight:1138946141933805609>' }, // Tank As CLASS
        { spec: 'Unholy_Tank', emoji: '<:DeathKnight:1138946141933805609>' }, // Tank As CLASS
        { spec: 'Frost_Tank', emoji: '<:DeathKnight:1138946141933805609>' }, // Tank As CLASS
    ],
    Druid: [
        { spec: 'Feral', emoji: '<:Druid:996464966062309377>' },
        { spec: 'Balance', emoji: '<:Druid:996464966062309377>' },
        { spec: 'Restoration', emoji: '<:Druid:996464966062309377>' },
        { spec: 'Guardian', emoji: '<:Druid:996464966062309377>' }, // Tank As CLASS
    ],
    Hunter: [
        { spec: 'Beastmastery', emoji: '<:hunter:996464967941357588>' },
        { spec: 'Survival', emoji: '<:hunter:996464967941357588>' },
        { spec: 'Marksmanship', emoji: '<:hunter:996464967941357588>' },
    ],
    Mage: [
        { spec: 'Arcane', emoji: '<:mages:996464546527055922>' },
        { spec: 'Fire', emoji: '<:mages:996464546527055922>' },
        { spec: 'Frost', emoji: '<:mages:996464546527055922>' },
    ],
    Paladin: [
        { spec: 'Holy1', emoji: '<:paladin:996464545201651712>' },
        { spec: 'Retribution', emoji: '<:paladin:996464545201651712>' },
        { spec: 'Protection1', emoji: '<:paladin:996464545201651712>' }, // Tank As CLASS
    ],
    Priest: [
        { spec: 'Smite', emoji: '<:priest:996464544094367754>' },
        { spec: 'Shadow', emoji: '<:priest:996464544094367754>' },
        { spec: 'Holy', emoji: '<:priest:996464544094367754>' },
        { spec: 'Discipline', emoji: '<:priest:996464544094367754>' },
    ],
    Rogue: [
        { spec: 'Assassination', emoji: '<:rogue:996464543079342120>' },
        { spec: 'Subtlety', emoji: '<:rogue:996464543079342120>' },
        { spec: 'Combat', emoji: '<:rogue:996464543079342120>' },
    ],
    Shaman: [
        { spec: 'Restoration1', emoji: '<:shaman:996464540885717002>' },
        { spec: 'Elemental', emoji: '<:shaman:996464540885717002>' },
        { spec: 'Enhancement', emoji: '<:shaman:996464540885717002>' },
    ],
    Warlock: [
        { spec: 'Demonology', emoji: '<:warlock:996464539841331250>' },
        { spec: 'Affliction', emoji: '<:warlock:996464539841331250>' },
        { spec: 'Destruction', emoji: '<:warlock:996464539841331250>' },
    ],
    Warrior: [
        { spec: 'Fury', emoji: '<:warrior:996464538746626188>' },
        { spec: 'Arms', emoji: '<:warrior:996464538746626188>' },
        { spec: 'Protection', emoji: '<:warrior:996464538746626188>' }, // Tank As CLASS
    ],
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autosignup')
        .setDescription('Auto Signup To Your Favourite Organizer Run')
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription(
                    'Add an autosignup event for one of your characters',
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription(
                    'Remove an autosignup event for one of your characters that is already added on the list',
                )
                .addStringOption((option) =>
                    option
                        .setName('id')
                        .setDescription(
                            'The ID of the autosignup event to remove',
                        )
                        .setRequired(true),
                ),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('show')
                .setDescription('show all of your characters on the list'),
        ),
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true })

        const subcommand = interaction.options.getSubcommand()

        if (subcommand === 'add') {
            const classes = Object.keys(ClassSpecRoles)
            const classOptions = classes.map((className) => ({
                label: className,
                value: className,
                emoji: `${ClassSpecRoles[className][0].emoji}`,
            }))
            const classSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('auto_class_select')
                .setPlaceholder('Select your class')
                .addOptions(classOptions)
            const classSelectRow = new ActionRowBuilder().addComponents(
                classSelectMenu,
            )

            await interaction.followUp({
                content: 'Please select your class:',
                components: [classSelectRow],
            })

            const filter = (interaction) =>
                interaction.isMessageComponent() &&
                interaction.customId === 'auto_class_select'
            const collector =
                interaction.channel.createMessageComponentCollector({
                    filter,
                })

            collector.on('collect', async (interaction) => {
                let selectedClass = interaction.values[0]
                collector.stop()

                const specs = ClassSpecRoles[selectedClass]
                const specOptions = specs.map((spec) => ({
                    label: spec.spec,
                    value: spec.spec,
                    emoji: spec.emoji,
                }))
                const specSelectMenu = new StringSelectMenuBuilder()
                    .setCustomId('auto_spec_select')
                    .setPlaceholder('Select your specialization')
                    .addOptions(specOptions)
                const specSelectRow = new ActionRowBuilder().addComponents(
                    specSelectMenu,
                )

                await interaction.reply({
                    content: 'Please select your specialization:',
                    components: [specSelectRow],
                    ephemeral: true,
                })

                const specCollectorFilter = (interaction) =>
                    interaction.isMessageComponent() &&
                    interaction.customId === 'auto_spec_select'
                const specCollector =
                    interaction.channel.createMessageComponentCollector({
                        filter: specCollectorFilter,
                    })

                specCollector.on('collect', async (interaction) => {
                    const selectedSpec = interaction.values[0]
                    specCollector.stop()

                    const allowedCategoryIDs = [
                        '993562796811894805',
                        '993562603550937109',
                        '993562529915736184',
                        '994786448836395008',
                        '993562477746982998',
                        '993562497640583248',
                        '993562828101402624',
                    ] // Add more category IDs as needed
                    const guild = interaction.guild
                    const channels = guild.channels.cache.filter(
                        (channel) =>
                            channel.type === ChannelType.GuildText &&
                            allowedCategoryIDs.includes(channel.parentId),
                    )

                    const chunkedChannels = chunkArray(
                        Array.from(channels.values()),
                        25,
                    )
                    // Create select options for the filtered text channels
                    for (const channelsChunk of chunkedChannels) {
                        const channelOptions = channelsChunk.map((channel) => ({
                            label: channel.name,
                            value: channel.id,
                        }))

                        const channelSelectMenu = new StringSelectMenuBuilder()
                            .setCustomId('auto_channel_select')
                            .setPlaceholder('Select the channel')
                            .addOptions(channelOptions)
                        const channelSelectRow =
                            new ActionRowBuilder().addComponents(
                                channelSelectMenu,
                            )

                        // Send a message asking the user to select a channel
                        await interaction.followUp({
                            content:
                                'Please select the channel where you want to set up the autosignup event:',
                            components: [channelSelectRow],
                            ephemeral: true,
                        })

                        const channelCollectorFilter = (interaction) =>
                            interaction.isMessageComponent() &&
                            interaction.customId === 'auto_channel_select'
                        const channelCollector =
                            interaction.channel.createMessageComponentCollector(
                                {
                                    filter: channelCollectorFilter,
                                },
                            )
                        channelCollector.on('collect', async (interaction) => {
                            const selectedChannel = interaction.values[0]
                            channelCollector.stop()

                            // Step 4: Check for duplicates
                            const duplicate = await autoSignupModel.findOne({
                                userId: interaction.user.id,
                                class: selectedClass,
                                spec: selectedSpec,
                                channelId: selectedChannel,
                            })

                            if (
                                [
                                    'Blood_Tank',
                                    'Unholy_Tank',
                                    'Frost_Tank',
                                    'Guardian',
                                    'Protection1',
                                    'Protection',
                                ].includes(selectedSpec)
                            ) {
                                selectedClass = 'Tank'
                            }
                            if (duplicate) {
                                await interaction.reply({
                                    content:
                                        'You already have an autosignup event with this class and spec for the selected channel.',
                                    ephemeral: true,
                                })
                                return
                            }

                            const autoSignup = new autoSignupModel({
                                userId: interaction.user.id,
                                channelId: selectedChannel,
                                class: selectedClass,
                                spec: selectedSpec,
                            })

                            await autoSignup.save()
                            await interaction.reply({
                                content:
                                    'Your autosignup event has been successfully set up!',
                                ephemeral: true,
                            })
                        })
                    }
                })
            })
        } else if (subcommand === 'remove') {
            // This is where you will handle the 'remove' subcommand logic
            const eventId = interaction.options.getString('id')

            if (!mongoose.Types.ObjectId.isValid(eventId)) {
                await interaction.followUp({
                    content:
                        'The provided ID is not a valid autosignup event ID.',
                    ephemeral: true,
                })
                return
            }
            const event = await autoSignupModel.findById(eventId)

            if (!event) {
                await interaction.followUp({
                    content: 'No autosignup event found with that ID.',
                    ephemeral: true,
                })
                return
            }

            if (event.userId !== interaction.user.id) {
                await interaction.followUp({
                    content: 'You can only remove your own autosignup events.',
                    ephemeral: true,
                })
                return
            }

            await autoSignupModel.findByIdAndDelete(eventId)

            await interaction.followUp({
                content: 'Autosignup event successfully removed.',
                ephemeral: true,
            })
        } else if (subcommand === 'show') {
            // This is where you will handle the 'show' subcommand logic
            const userId = interaction.user.id
            const autoSignups = await autoSignupModel.find({ userId })

            if (!autoSignups.length) {
                await interaction.followUp({
                    content: 'You have no autosignup events saved.',
                    ephemeral: true,
                })
                return
            }

            const embed = new EmbedBuilder()
                .setTitle('Your Autosignup Events')
                .setColor('#00FF00')
                .setDescription(
                    'Here are your currently saved autosignup events:',
                )
                .setTimestamp()
                .setFooter({
                    text: 'Use the provided ID to remove an event later.',
                })

            autoSignups.forEach((signup, index) => {
                let classData
                for (const [className, specs] of Object.entries(
                    ClassSpecRoles,
                )) {
                    classData = specs.find((s) => s.spec === signup.spec)
                    if (classData) {
                        classData = { className, ...classData }
                        break
                    }
                }
                embed.addFields({
                    name: 'Event ID',
                    value: signup._id.toString(),
                    inline: true,
                })
                embed.addFields({
                    name: 'Class',
                    value: `${classData.emoji} ${classData.className}`,
                    inline: true,
                })
                embed.addFields({
                    name: 'Spec',
                    value: classData.spec,
                    inline: true,
                })
                embed.addFields({
                    name: 'Channel',
                    value: `<#${signup.channelId}>`,
                    inline: true,
                })
                embed.addFields({
                    name: '\u200B', // Zero-width space for spacing between groups
                    value: '\u200B',
                    inline: false,
                })
            })

            await interaction.followUp({
                embeds: [embed],
                ephemeral: true,
            })
        }
    },
}
