const {
    Events,
    ButtonInteraction,
    ActionRowBuilder,
    EmbedBuilder,
    Client,
    StringSelectMenuBuilder,
    ComponentType,
    UserSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js')

//Day Category Functions.

module.exports = {
    name: Events.InteractionCreate,
    /**
     *
     * @param {ButtonInteraction} interaction,
     * @param {Client} client
     * @returns
     */
    async execute(interaction, client) {
        if (!interaction.isButton()) return

        if (!['chcreate_25', 'chcreate_10'].includes(interaction.customId))
            return

        const Row = new ActionRowBuilder().setComponents(
            new ButtonBuilder()
                .setCustomId('ch-verification-confirm')
                .setStyle(ButtonStyle.Primary)
                .setLabel('Confirm')
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId('ch-verification-decline')
                .setStyle(ButtonStyle.Primary)
                .setLabel('Decline')
                .setEmoji('❌'),
        )
        const logChannel = interaction.guild.channels.cache.get(
            '1130855694539706509',
        )
        if (interaction.customId === 'chcreate_25') {
            // Start a thread in the same channel
            const thread = await interaction.channel.threads.create({
                name: `${interaction.user.displayName}`,
            })

            const lastMessage = await interaction.channel.messages.fetch({
                limit: 1,
            })
            const messageToDelete = lastMessage.first()

            // Delete the message
            await messageToDelete.delete()

            const channelSelectMenu = new ActionRowBuilder().setComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('category_select')
                    .setPlaceholder('Select a category')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .setOptions(
                        {
                            label: 'Tuesday GDKPS',
                            value: '993562796811894805',
                            emoji: '✨',
                        },
                        {
                            label: 'Wednesday GDKPS',
                            value: '993562603550937109',
                            emoji: '✨',
                        },
                        {
                            label: 'Thursday GDKPS',
                            value: '993562529915736184',
                            emoji: '✨',
                        },
                        {
                            label: 'Friday GDKPS',
                            value: '994786448836395008',
                            emoji: '✨',
                        },
                        {
                            label: 'Saturday GDKPS',
                            value: '993562477746982998',
                            emoji: '✨',
                        },
                        {
                            label: 'Sunday GDKPS',
                            value: '993562497640583248',
                            emoji: '✨',
                        },
                        {
                            label: 'Monday GDKPS',
                            value: '993562828101402624',
                            emoji: '✨',
                        },
                    ),
            )

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Choose a Category')
                .setDescription(
                    'Please select a category from the dropdown menu below.',
                )

            // Send the embed message with the ChannelSelectMenu
            const sentMessageCategory = await thread.send({
                content: `<@${interaction.user.id}>`,
                embeds: [embed],
                components: [channelSelectMenu],
            })

            // Create a collector to listen for the select menu interaction

            const categoryCollector = thread.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
            })

            categoryCollector.on('collect', async (selectMenuInteraction) => {
                if (selectMenuInteraction.customId !== 'category_select') return

                // Handle the selected value
                // Do something with the selected value
                const selectedCategoryID = selectMenuInteraction.values[0]

                const selectedOption =
                    selectMenuInteraction.component.options.find(
                        (option) => option.value === selectedCategoryID,
                    )

                const catselectedLabel = selectedOption
                    ? selectedOption.label
                    : 'No category selected'

                await sentMessageCategory.delete()
                const disableCategorySelector =
                    new ActionRowBuilder().setComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('category_select_off')
                            .setDisabled(true)
                            .setPlaceholder(`${catselectedLabel}`)
                            .setOptions({
                                label: `\u200b`,
                                value: '\u200b',
                            }),
                    )

                await thread.send({
                    content: 'Category chosen ✅',
                    components: [disableCategorySelector],
                })
                // Stop the collector
                categoryCollector.stop()

                const raidSelectMenu = new ActionRowBuilder().setComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('raid_select')
                        .setPlaceholder('Select a raid')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setOptions(
                            {
                                label: 'BWD',
                                value: 'BWD',
                                emoji: '🗻',
                            },
                            {
                                label: 'BOT',
                                value: 'BOT',
                                emoji: '🐉',
                            },
                            {
                                label: 'TFW',
                                value: 'TFW',
                                emoji: '🌀',
                            },
                            {
                                label: 'FL',
                                value: 'FL',
                                emoji: '🌋',
                            },
                            {
                                label: 'DS',
                                value: 'DS',
                                emoji: '🔮',
                            },
                            {
                                label: 'WT',
                                value: 'WT',
                                emoji: '🌍',
                            },
                        ),
                )
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Choose a raid')
                    .setDescription(
                        'Please select a raid from the dropdown menu below.',
                    )

                // Send the embed message with the ChannelSelectMenu
                const sentMessageRaid = await thread.send({
                    embeds: [embed],
                    components: [raidSelectMenu],
                })

                // Create a collector to listen for the select menu interaction

                const raidCollector = thread.createMessageComponentCollector({
                    componentType: ComponentType.StringSelect,
                })

                raidCollector.on('collect', async (selectMenuInteraction) => {
                    if (selectMenuInteraction.customId !== 'raid_select') return

                    // Handle the selected value
                    // Do something with the selected value
                    const selectedRaid = selectMenuInteraction.values[0]

                    const selectedOption =
                        selectMenuInteraction.component.options.find(
                            (option) => option.value === selectedRaid,
                        )

                    const selectedLabel = selectedOption
                        ? selectedOption.label + selectedOption.emoji.name
                        : 'No raid selected'

                    await sentMessageRaid.delete()
                    const disableRaidSelector =
                        new ActionRowBuilder().setComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('raid_select_off')
                                .setDisabled(true)
                                .setPlaceholder(`${selectedLabel}`)
                                .setOptions({
                                    label: `\u200b`,
                                    value: '\u200b',
                                }),
                        )

                    await thread.send({
                        content: 'Raid chosen ✅',
                        components: [disableRaidSelector],
                    })
                    // Stop the collector
                    raidCollector.stop()

                    const periodSelectMenu = new StringSelectMenuBuilder()
                        .setCustomId('period_select')
                        .setPlaceholder('Select a period')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setOptions(
                            {
                                label: 'AM',
                                value: 'AM',
                                emoji: '⏰',
                            },
                            {
                                label: 'PM',
                                value: 'PM',
                                emoji: '⏰',
                            },
                        )
                    const hourSelectMenu = new StringSelectMenuBuilder()
                        .setCustomId('hour_select')
                        .setPlaceholder('Select an hour')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setOptions(
                            {
                                label: '1',
                                value: '1',
                                emoji: '⏳',
                            },
                            {
                                label: '2',
                                value: '2',
                                emoji: '⏳',
                            },
                            {
                                label: '3',
                                value: '3',
                                emoji: '⏳',
                            },
                            {
                                label: '4',
                                value: '4',
                                emoji: '⏳',
                            },
                            {
                                label: '5',
                                value: '5',
                                emoji: '⏳',
                            },
                            {
                                label: '6',
                                value: '6',
                                emoji: '⏳',
                            },
                            {
                                label: '7',
                                value: '7',
                                emoji: '⏳',
                            },
                            {
                                label: '8',
                                value: '8',
                                emoji: '⏳',
                            },
                            {
                                label: '9',
                                value: '9',
                                emoji: '⏳',
                            },
                            {
                                label: '10',
                                value: '10',
                                emoji: '⏳',
                            },
                            {
                                label: '11',
                                value: '11',
                                emoji: '⏳',
                            },
                            {
                                label: '12',
                                value: '12',
                                emoji: '⏳',
                            },
                        )

                    const minuteSelectMenu = new StringSelectMenuBuilder()
                        .setCustomId('minute_select')
                        .setPlaceholder('Select a minute')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setOptions(
                            {
                                label: '15',
                                value: '15',
                                emoji: '⏳',
                            },
                            {
                                label: '30',
                                value: '30',
                                emoji: '⏳',
                            },
                            {
                                label: '45',
                                value: '40',
                                emoji: '⏳',
                            },
                            {
                                label: '00',
                                value: '00',
                                emoji: '⏳',
                            },
                        )

                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Choose a time period')
                        .setDescription(
                            'Please select a time period from the dropdown menu below.',
                        )

                    const FirstRow = new ActionRowBuilder().setComponents(
                        periodSelectMenu,
                    )
                    const SecondRow = new ActionRowBuilder().setComponents(
                        hourSelectMenu,
                    )
                    const ThirdRow = new ActionRowBuilder().setComponents(
                        minuteSelectMenu,
                    )
                    // Send the embed message with the ChannelSelectMenu
                    const sentMessageTime = await thread.send({
                        embeds: [embed],
                        components: [FirstRow, SecondRow, ThirdRow],
                    })

                    let selectedPeriod = null,
                        selectedHour = null,
                        selectedMinute = null

                    const timeCollector =
                        thread.createMessageComponentCollector({
                            componentType: ComponentType.StringSelect,
                        })

                    timeCollector.on(
                        'collect',
                        async (selectMenuInteraction) => {
                            const customId = selectMenuInteraction.customId
                            if (customId === 'period_select') {
                                selectedPeriod = selectMenuInteraction.values[0]
                                selectMenuInteraction.reply({
                                    content: 'Your selection has been saved.',
                                    ephemeral: true, // This makes the message ephemeral
                                })
                            } else if (customId === 'hour_select') {
                                selectedHour = selectMenuInteraction.values[0]
                                selectMenuInteraction.reply({
                                    content: 'Your selection has been saved.',
                                    ephemeral: true, // This makes the message ephemeral
                                })
                            } else if (customId === 'minute_select') {
                                selectedMinute = selectMenuInteraction.values[0]
                                selectMenuInteraction.reply({
                                    content: 'Your selection has been saved.',
                                    ephemeral: true, // This makes the message ephemeral
                                })
                            }

                            if (
                                selectedPeriod !== null &&
                                selectedHour !== null &&
                                selectedMinute !== null
                            ) {
                                await sentMessageTime.delete()
                                const disableTimeSelector =
                                    new ActionRowBuilder().setComponents(
                                        new StringSelectMenuBuilder()
                                            .setCustomId('time_select_off')
                                            .setDisabled(true)
                                            .setPlaceholder(
                                                `${selectedHour}:${selectedMinute} ${selectedPeriod} ⏰`,
                                            )
                                            .setOptions({
                                                label: `\u200b`,
                                                value: '\u200b',
                                            }),
                                    )

                                await thread.send({
                                    content: 'Time chosen ✅',
                                    components: [disableTimeSelector],
                                })
                                timeCollector.stop()

                                const coOwnerSelectMenu =
                                    new ActionRowBuilder().setComponents(
                                        new UserSelectMenuBuilder()
                                            .setCustomId('coowner_select')
                                            .setPlaceholder('Select a Co-Owner')
                                            .setMinValues(1)
                                            .setMaxValues(1),
                                    )
                                const embed = new EmbedBuilder()
                                    .setColor('#0099ff')
                                    .setTitle('Choose a Co-Owner')
                                    .setDescription(
                                        "Please select a Co-Owner from the dropdown menu below. \n[If you don't want to choose one simply wait 30 seconds :D]",
                                    )

                                // Send the embed message with the ChannelSelectMenu
                                const sentMessageCoOwner = await thread.send({
                                    embeds: [embed],
                                    components: [coOwnerSelectMenu],
                                })

                                // Create a collector to listen for the select menu interaction

                                const CoOwnerCollector =
                                    thread.createMessageComponentCollector({
                                        componentType: ComponentType.UserSelect,
                                        time: 30000,
                                    })

                                CoOwnerCollector.on(
                                    'collect',
                                    async (selectMenuInteraction) => {
                                        const CoownerReal =
                                            await interaction.guild.members.fetch(
                                                selectMenuInteraction.values[0],
                                            )
                                        const CoownerLast =
                                            CoownerReal.roles.cache.has(
                                                '1043857765120090142',
                                            )
                                        if (CoownerLast === false) {
                                            return selectMenuInteraction.reply({
                                                content:
                                                    'You can only choose a Co-Owner from users with Organizer-Help role.',
                                            })
                                        } else {
                                            const selectedcoOwnerID =
                                                selectMenuInteraction.values[0]

                                            await sentMessageCoOwner.delete()
                                            const disableCoOwnerSelector =
                                                new ActionRowBuilder().setComponents(
                                                    new StringSelectMenuBuilder()
                                                        .setCustomId(
                                                            'coOwner_select_off',
                                                        )
                                                        .setDisabled(true)
                                                        .setPlaceholder(
                                                            `<@${selectedcoOwnerID}>`,
                                                        )
                                                        .setOptions({
                                                            label: `\u200b`,
                                                            value: '\u200b',
                                                        }),
                                                )

                                            await thread.send({
                                                content: 'Co-Owner chosen ✅',
                                                components: [
                                                    disableCoOwnerSelector,
                                                ],
                                            })
                                            const embed = new EmbedBuilder()
                                                .setColor('#0099ff')
                                                .setTitle('Summery')
                                                .setDescription(
                                                    'Here is the summary of your choices:',
                                                )
                                                .addFields(
                                                    {
                                                        name: ':sparkles: Category',
                                                        value: `<#${selectedCategoryID}>/${selectedCategoryID}`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: ':crossed_swords: Raid',
                                                        value: `${selectedRaid}-25`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: ':alarm_clock: Time Period',
                                                        value: `${selectedHour}:${selectedMinute} ${selectedPeriod}`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: ':busts_in_silhouette: Co-Owner',
                                                        value: `<@${selectedcoOwnerID}>`,
                                                        inline: true,
                                                    },
                                                )
                                                .setFooter({ text: '😋' })

                                            // Send the embed message
                                            selectMenuInteraction.reply({
                                                embeds: [embed],
                                            })

                                            const embed1 = new EmbedBuilder()
                                                .setColor('#0099ff')
                                                .setTitle('Channel Request')
                                                .addFields(
                                                    {
                                                        name: ':sparkles: Category',
                                                        value: `${catselectedLabel}/${selectedCategoryID}`,
                                                    },
                                                    {
                                                        name: ':crossed_swords: Raid',
                                                        value: `${selectedRaid}-25`,
                                                    },
                                                    {
                                                        name: ':alarm_clock: Time Period',
                                                        value: `${selectedHour}:${selectedMinute} ${selectedPeriod}`,
                                                    },
                                                    {
                                                        name: ':busts_in_silhouette: Co-Owner',
                                                        value: `<@${selectedcoOwnerID}>`,
                                                    },
                                                    {
                                                        name: '👤 Organizer',
                                                        value: `<@${interaction.user.id}>`,
                                                    },
                                                    {
                                                        name: 'Status',
                                                        value: '➖',
                                                    },
                                                )
                                                .setFooter({ text: '😋' })
                                            logChannel.send({
                                                content: `<@&996424602186174504>`,
                                                embeds: [embed1],
                                                components: [Row],
                                            })

                                            CoOwnerCollector.stop()

                                            setTimeout(async () => {
                                                await thread.delete()
                                            }, 30000)
                                        }
                                    },
                                )

                                CoOwnerCollector.on(
                                    'end',
                                    async (collected, reason) => {
                                        if (reason === 'time') {
                                            await sentMessageCoOwner.delete()
                                            const disableCoOwnerSelector =
                                                new ActionRowBuilder().setComponents(
                                                    new StringSelectMenuBuilder()
                                                        .setCustomId(
                                                            'coOwner_select_off',
                                                        )
                                                        .setDisabled(true)
                                                        .setPlaceholder(
                                                            `No Co-Owner`,
                                                        )
                                                        .setOptions({
                                                            label: `\u200b`,
                                                            value: '\u200b',
                                                        }),
                                                )

                                            await thread.send({
                                                content: 'Co-Owner chosen ✅',
                                                components: [
                                                    disableCoOwnerSelector,
                                                ],
                                            })

                                            const embed = new EmbedBuilder()
                                                .setColor('#0099ff')
                                                .setTitle('Summery')
                                                .setDescription(
                                                    'Here is the summary of your choices:',
                                                )
                                                .addFields(
                                                    {
                                                        name: ':sparkles: Category',
                                                        value: `<#${selectedCategoryID}>/${selectedCategoryID}`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: ':crossed_swords: Raid',
                                                        value: `${selectedRaid}`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: ':alarm_clock: Time Period',
                                                        value: `${selectedHour}:${selectedMinute} ${selectedPeriod}`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: ':busts_in_silhouette: Co-Owner',
                                                        value: `No One`,
                                                        inline: true,
                                                    },
                                                )
                                                .setFooter({ text: '😋' })

                                            // Send the embed message
                                            thread.send({
                                                embeds: [embed],
                                            })

                                            const embed1 = new EmbedBuilder()
                                                .setColor('#0099ff')
                                                .setTitle('Channel Request')
                                                .addFields(
                                                    {
                                                        name: ':sparkles: Category',
                                                        value: `${catselectedLabel}/${selectedCategoryID}`,
                                                    },
                                                    {
                                                        name: ':crossed_swords: Raid',
                                                        value: `${selectedRaid}-25`,
                                                    },
                                                    {
                                                        name: ':alarm_clock: Time Period',
                                                        value: `${selectedHour}:${selectedMinute} ${selectedPeriod}`,
                                                    },
                                                    {
                                                        name: '👤 Organizer',
                                                        value: `<@${interaction.user.id}>`,
                                                    },
                                                    {
                                                        name: ':busts_in_silhouette: Co-Owner',
                                                        value: `No One`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: 'Status',
                                                        value: '➖',
                                                    },
                                                )
                                                .setFooter({ text: '😋' })
                                            logChannel.send({
                                                content: `<@&996424602186174504>`,
                                                embeds: [embed1],
                                                components: [Row],
                                            })

                                            setTimeout(async () => {
                                                await thread.delete()
                                            }, 30000)
                                        }
                                    },
                                )
                            }
                        },
                    )
                })
            })
        } else if (interaction.customId === 'chcreate_10') {
            // Start a thread in the same channel
            const thread = await interaction.channel.threads.create({
                name: `${interaction.user.displayName}`,
            })

            const lastMessage = await interaction.channel.messages.fetch({
                limit: 1,
            })
            const messageToDelete = lastMessage.first()

            // Delete the message
            await messageToDelete.delete()

            const channelSelectMenu = new ActionRowBuilder().setComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('category_select')
                    .setPlaceholder('Select a category')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .setOptions(
                        {
                            label: 'Tuesday GDKPS',
                            value: '993562796811894805',
                            emoji: '✨',
                        },
                        {
                            label: 'Wednesday GDKPS',
                            value: '993562603550937109',
                            emoji: '✨',
                        },
                        {
                            label: 'Thursday GDKPS',
                            value: '993562529915736184',
                            emoji: '✨',
                        },
                        {
                            label: 'Friday GDKPS',
                            value: '994786448836395008',
                            emoji: '✨',
                        },
                        {
                            label: 'Saturday GDKPS',
                            value: '993562477746982998',
                            emoji: '✨',
                        },
                        {
                            label: 'Sunday GDKPS',
                            value: '993562497640583248',
                            emoji: '✨',
                        },
                        {
                            label: 'Monday GDKPS',
                            value: '993562828101402624',
                            emoji: '✨',
                        },
                    ),
            )

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Choose a Category')
                .setDescription(
                    'Please select a category from the dropdown menu below.',
                )

            // Send the embed message with the ChannelSelectMenu
            const sentMessageCategory = await thread.send({
                content: `<@${interaction.user.id}>`,
                embeds: [embed],
                components: [channelSelectMenu],
            })

            // Create a collector to listen for the select menu interaction

            const categoryCollector = thread.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
            })

            categoryCollector.on('collect', async (selectMenuInteraction) => {
                if (selectMenuInteraction.customId !== 'category_select') return

                // Handle the selected value
                // Do something with the selected value
                const selectedCategoryID = selectMenuInteraction.values[0]

                const selectedOption =
                    selectMenuInteraction.component.options.find(
                        (option) => option.value === selectedCategoryID,
                    )

                const catselectedLabel = selectedOption
                    ? selectedOption.label
                    : 'No category selected'

                await sentMessageCategory.delete()
                const disableCategorySelector =
                    new ActionRowBuilder().setComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('category_select_off')
                            .setDisabled(true)
                            .setPlaceholder(`${catselectedLabel}`)
                            .setOptions({
                                label: `\u200b`,
                                value: '\u200b',
                            }),
                    )

                await thread.send({
                    content: 'Category chosen ✅',
                    components: [disableCategorySelector],
                })
                // Stop the collector
                categoryCollector.stop()

                const raidSelectMenu = new ActionRowBuilder().setComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('raid_select')
                        .setPlaceholder('Select a raid')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setOptions(
                            {
                                label: 'BWD',
                                value: 'BWD',
                                emoji: '🗻',
                            },
                            {
                                label: 'BOT',
                                value: 'BOT',
                                emoji: '🐉',
                            },
                            {
                                label: 'TFW',
                                value: 'TFW',
                                emoji: '🌀',
                            },
                            {
                                label: 'FL',
                                value: 'FL',
                                emoji: '🌋',
                            },
                            {
                                label: 'DS',
                                value: 'DS',
                                emoji: '🔮',
                            },
                            {
                                label: 'WT',
                                value: 'WT',
                                emoji: '🌍',
                            },
                        ),
                )
                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Choose a raid')
                    .setDescription(
                        'Please select a raid from the dropdown menu below.',
                    )

                // Send the embed message with the ChannelSelectMenu
                const sentMessageRaid = await thread.send({
                    embeds: [embed],
                    components: [raidSelectMenu],
                })

                // Create a collector to listen for the select menu interaction

                const raidCollector = thread.createMessageComponentCollector({
                    componentType: ComponentType.StringSelect,
                })

                raidCollector.on('collect', async (selectMenuInteraction) => {
                    if (selectMenuInteraction.customId !== 'raid_select') return

                    // Handle the selected value
                    // Do something with the selected value
                    const selectedRaid = selectMenuInteraction.values[0]

                    const selectedOption =
                        selectMenuInteraction.component.options.find(
                            (option) => option.value === selectedRaid,
                        )

                    const selectedLabel = selectedOption
                        ? selectedOption.label + selectedOption.emoji.name
                        : 'No raid selected'

                    await sentMessageRaid.delete()
                    const disableRaidSelector =
                        new ActionRowBuilder().setComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('raid_select_off')
                                .setDisabled(true)
                                .setPlaceholder(`${selectedLabel}`)
                                .setOptions({
                                    label: `\u200b`,
                                    value: '\u200b',
                                }),
                        )

                    await thread.send({
                        content: 'Raid chosen ✅',
                        components: [disableRaidSelector],
                    })
                    // Stop the collector
                    raidCollector.stop()

                    const periodSelectMenu = new StringSelectMenuBuilder()
                        .setCustomId('period_select')
                        .setPlaceholder('Select a period')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setOptions(
                            {
                                label: 'AM',
                                value: 'AM',
                                emoji: '⏰',
                            },
                            {
                                label: 'PM',
                                value: 'PM',
                                emoji: '⏰',
                            },
                        )
                    const hourSelectMenu = new StringSelectMenuBuilder()
                        .setCustomId('hour_select')
                        .setPlaceholder('Select an hour')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setOptions(
                            {
                                label: '1',
                                value: '1',
                                emoji: '⏳',
                            },
                            {
                                label: '2',
                                value: '2',
                                emoji: '⏳',
                            },
                            {
                                label: '3',
                                value: '3',
                                emoji: '⏳',
                            },
                            {
                                label: '4',
                                value: '4',
                                emoji: '⏳',
                            },
                            {
                                label: '5',
                                value: '5',
                                emoji: '⏳',
                            },
                            {
                                label: '6',
                                value: '6',
                                emoji: '⏳',
                            },
                            {
                                label: '7',
                                value: '7',
                                emoji: '⏳',
                            },
                            {
                                label: '8',
                                value: '8',
                                emoji: '⏳',
                            },
                            {
                                label: '9',
                                value: '9',
                                emoji: '⏳',
                            },
                            {
                                label: '10',
                                value: '10',
                                emoji: '⏳',
                            },
                            {
                                label: '11',
                                value: '11',
                                emoji: '⏳',
                            },
                            {
                                label: '12',
                                value: '12',
                                emoji: '⏳',
                            },
                        )

                    const minuteSelectMenu = new StringSelectMenuBuilder()
                        .setCustomId('minute_select')
                        .setPlaceholder('Select a minute')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setOptions(
                            {
                                label: '15',
                                value: '15',
                                emoji: '⏳',
                            },
                            {
                                label: '30',
                                value: '30',
                                emoji: '⏳',
                            },
                            {
                                label: '45',
                                value: '40',
                                emoji: '⏳',
                            },
                            {
                                label: '00',
                                value: '00',
                                emoji: '⏳',
                            },
                        )

                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Choose a time period')
                        .setDescription(
                            'Please select a time period from the dropdown menu below.',
                        )

                    const FirstRow = new ActionRowBuilder().setComponents(
                        periodSelectMenu,
                    )
                    const SecondRow = new ActionRowBuilder().setComponents(
                        hourSelectMenu,
                    )
                    const ThirdRow = new ActionRowBuilder().setComponents(
                        minuteSelectMenu,
                    )
                    // Send the embed message with the ChannelSelectMenu
                    const sentMessageTime = await thread.send({
                        embeds: [embed],
                        components: [FirstRow, SecondRow, ThirdRow],
                    })

                    let selectedPeriod = null,
                        selectedHour = null,
                        selectedMinute = null

                    const timeCollector =
                        thread.createMessageComponentCollector({
                            componentType: ComponentType.StringSelect,
                        })

                    timeCollector.on(
                        'collect',
                        async (selectMenuInteraction) => {
                            const customId = selectMenuInteraction.customId
                            if (customId === 'period_select') {
                                selectedPeriod = selectMenuInteraction.values[0]
                                selectMenuInteraction.reply({
                                    content: 'Your selection has been saved.',
                                    ephemeral: true, // This makes the message ephemeral
                                })
                            } else if (customId === 'hour_select') {
                                selectedHour = selectMenuInteraction.values[0]
                                selectMenuInteraction.reply({
                                    content: 'Your selection has been saved.',
                                    ephemeral: true, // This makes the message ephemeral
                                })
                            } else if (customId === 'minute_select') {
                                selectedMinute = selectMenuInteraction.values[0]
                                selectMenuInteraction.reply({
                                    content: 'Your selection has been saved.',
                                    ephemeral: true, // This makes the message ephemeral
                                })
                            }

                            if (
                                selectedPeriod !== null &&
                                selectedHour !== null &&
                                selectedMinute !== null
                            ) {
                                await sentMessageTime.delete()
                                const disableTimeSelector =
                                    new ActionRowBuilder().setComponents(
                                        new StringSelectMenuBuilder()
                                            .setCustomId('time_select_off')
                                            .setDisabled(true)
                                            .setPlaceholder(
                                                `${selectedHour}:${selectedMinute} ${selectedPeriod} ⏰`,
                                            )
                                            .setOptions({
                                                label: `\u200b`,
                                                value: '\u200b',
                                            }),
                                    )

                                await thread.send({
                                    content: 'Time chosen ✅',
                                    components: [disableTimeSelector],
                                })
                                timeCollector.stop()

                                const coOwnerSelectMenu =
                                    new ActionRowBuilder().setComponents(
                                        new UserSelectMenuBuilder()
                                            .setCustomId('coowner_select')
                                            .setPlaceholder('Select a Co-Owner')
                                            .setMinValues(1)
                                            .setMaxValues(1),
                                    )
                                const embed = new EmbedBuilder()
                                    .setColor('#0099ff')
                                    .setTitle('Choose a Co-Owner')
                                    .setDescription(
                                        "Please select a Co-Owner from the dropdown menu below. \n[If you don't want to choose one simply wait 30 seconds :D]",
                                    )

                                // Send the embed message with the ChannelSelectMenu
                                const sentMessageCoOwner = await thread.send({
                                    embeds: [embed],
                                    components: [coOwnerSelectMenu],
                                })

                                // Create a collector to listen for the select menu interaction

                                const CoOwnerCollector =
                                    thread.createMessageComponentCollector({
                                        componentType: ComponentType.UserSelect,
                                        time: 30000,
                                    })

                                CoOwnerCollector.on(
                                    'collect',
                                    async (selectMenuInteraction) => {
                                        const CoownerReal =
                                            await interaction.guild.members.fetch(
                                                selectMenuInteraction.values[0],
                                            )
                                        const CoownerLast =
                                            CoownerReal.roles.cache.has(
                                                '1043857765120090142',
                                            )
                                        if (CoownerLast === false) {
                                            return selectMenuInteraction.reply({
                                                content:
                                                    'You can only choose a Co-Owner from users with Organizer-Help role.',
                                            })
                                        } else {
                                            const selectedcoOwnerID =
                                                selectMenuInteraction.values[0]

                                            await sentMessageCoOwner.delete()
                                            const disableCoOwnerSelector =
                                                new ActionRowBuilder().setComponents(
                                                    new StringSelectMenuBuilder()
                                                        .setCustomId(
                                                            'coOwner_select_off',
                                                        )
                                                        .setDisabled(true)
                                                        .setPlaceholder(
                                                            `<@${selectedcoOwnerID}>`,
                                                        )
                                                        .setOptions({
                                                            label: `\u200b`,
                                                            value: '\u200b',
                                                        }),
                                                )

                                            await thread.send({
                                                content: 'Co-Owner chosen ✅',
                                                components: [
                                                    disableCoOwnerSelector,
                                                ],
                                            })
                                            const embed = new EmbedBuilder()
                                                .setColor('#0099ff')
                                                .setTitle('Summery')
                                                .setDescription(
                                                    'Here is the summary of your choices:',
                                                )
                                                .addFields(
                                                    {
                                                        name: ':sparkles: Category',
                                                        value: `<#${selectedCategoryID}>/${selectedCategoryID}`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: ':crossed_swords: Raid',
                                                        value: `${selectedRaid}-10`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: ':alarm_clock: Time Period',
                                                        value: `${selectedHour}:${selectedMinute} ${selectedPeriod}`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: ':busts_in_silhouette: Co-Owner',
                                                        value: `<@${selectedcoOwnerID}>`,
                                                        inline: true,
                                                    },
                                                )
                                                .setFooter({ text: '😋' })

                                            // Send the embed message
                                            selectMenuInteraction.reply({
                                                embeds: [embed],
                                            })

                                            const embed1 = new EmbedBuilder()
                                                .setColor('#0099ff')
                                                .setTitle('Channel Request')
                                                .addFields(
                                                    {
                                                        name: ':sparkles: Category',
                                                        value: `${catselectedLabel}/${selectedCategoryID}`,
                                                    },
                                                    {
                                                        name: ':crossed_swords: Raid',
                                                        value: `${selectedRaid}-10`,
                                                    },
                                                    {
                                                        name: ':alarm_clock: Time Period',
                                                        value: `${selectedHour}:${selectedMinute} ${selectedPeriod}`,
                                                    },
                                                    {
                                                        name: ':busts_in_silhouette: Co-Owner',
                                                        value: `<@${selectedcoOwnerID}>`,
                                                    },
                                                    {
                                                        name: '👤 Organizer',
                                                        value: `<@${interaction.user.id}>`,
                                                    },
                                                    {
                                                        name: 'Status',
                                                        value: '➖',
                                                    },
                                                )
                                                .setFooter({ text: '😋' })
                                            logChannel.send({
                                                content: `<@&996424602186174504>`,
                                                embeds: [embed1],
                                                components: [Row],
                                            })

                                            CoOwnerCollector.stop()

                                            setTimeout(async () => {
                                                await thread.delete()
                                            }, 30000)
                                        }
                                    },
                                )

                                CoOwnerCollector.on(
                                    'end',
                                    async (collected, reason) => {
                                        if (reason === 'time') {
                                            await sentMessageCoOwner.delete()
                                            const disableCoOwnerSelector =
                                                new ActionRowBuilder().setComponents(
                                                    new StringSelectMenuBuilder()
                                                        .setCustomId(
                                                            'coOwner_select_off',
                                                        )
                                                        .setDisabled(true)
                                                        .setPlaceholder(
                                                            `No Co-Owner`,
                                                        )
                                                        .setOptions({
                                                            label: `\u200b`,
                                                            value: '\u200b',
                                                        }),
                                                )

                                            await thread.send({
                                                content: 'Co-Owner chosen ✅',
                                                components: [
                                                    disableCoOwnerSelector,
                                                ],
                                            })

                                            const embed = new EmbedBuilder()
                                                .setColor('#0099ff')
                                                .setTitle('Summery')
                                                .setDescription(
                                                    'Here is the summary of your choices:',
                                                )
                                                .addFields(
                                                    {
                                                        name: ':sparkles: Category',
                                                        value: `<#${selectedCategoryID}>/${selectedCategoryID}`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: ':crossed_swords: Raid',
                                                        value: `${selectedRaid}-10`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: ':alarm_clock: Time Period',
                                                        value: `${selectedHour}:${selectedMinute} ${selectedPeriod}`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: ':busts_in_silhouette: Co-Owner',
                                                        value: `No One`,
                                                        inline: true,
                                                    },
                                                )
                                                .setFooter({ text: '😋' })

                                            // Send the embed message
                                            thread.send({
                                                embeds: [embed],
                                            })

                                            const embed1 = new EmbedBuilder()
                                                .setColor('#0099ff')
                                                .setTitle('Channel Request')
                                                .addFields(
                                                    {
                                                        name: ':sparkles: Category',
                                                        value: `${catselectedLabel}/${selectedCategoryID}`,
                                                    },
                                                    {
                                                        name: ':crossed_swords: Raid',
                                                        value: `${selectedRaid}-10`,
                                                    },
                                                    {
                                                        name: ':alarm_clock: Time Period',
                                                        value: `${selectedHour}:${selectedMinute} ${selectedPeriod}`,
                                                    },
                                                    {
                                                        name: '👤 Organizer',
                                                        value: `<@${interaction.user.id}>`,
                                                    },
                                                    {
                                                        name: ':busts_in_silhouette: Co-Owner',
                                                        value: `No One`,
                                                        inline: true,
                                                    },
                                                    {
                                                        name: 'Status',
                                                        value: '➖',
                                                    },
                                                )
                                                .setFooter({ text: '😋' })
                                            logChannel.send({
                                                content: `<@&996424602186174504>`,
                                                embeds: [embed1],
                                                components: [Row],
                                            })

                                            setTimeout(async () => {
                                                await thread.delete()
                                            }, 30000)
                                        }
                                    },
                                )
                            }
                        },
                    )
                })
            })
        }
    },
}
