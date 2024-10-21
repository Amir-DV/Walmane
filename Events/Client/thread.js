const {
    Events,
    EmbedBuilder,
    Client,
    ThreadChannel,
    ChannelType,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ComponentType,
} = require('discord.js')

const stringSimilarity = require('string-similarity')

const natural = require('natural')
const tokenizer = new natural.WordTokenizer()
const { LogisticRegressionClassifier } = require('natural')

const WarningList = require('../../Models/warningList')
const Blacklist = require('../../Models/blackList')
const communityRulesModel = require('../../Models/communityRules')

const date = new Date()
let userResponse
let userMention
const threshold = 0.7 // Set a confidence score threshold
const communityRules = [
    'No showing after confirming and being rostered/Insufficient notice of absence - it is expected you give 24 hours notice to the organizer if you will not be able to attend after being rostered and confirming.',
    "Not bidding on obvious upgrades - Unless you specifically mention you're only bidding on certain items and the raid lead agrees, raiders are expected to bid on reasonable upgrades within the run. This includes but is not limited to items that aren't in your absolute final BIS setup. Bidding once also doesn't excuse you, you are expected to bid reasonably at the budget you provided in ⁠✅│verify.",
    'Leaving early without good cause - You should expect a maximum time commitment of 3 to 5 hours of raid time depending on the raid unless otherwise noted by the raid lead. Depending on the severity you can be awarded up to 2 strikes or a ban (context is everything). Exceptions can be made for emergencies but communication is expected within reason. Leaving because you double-booked back-to-back raids is unacceptable (2 strikes).',
    "Confirming and Rescinding - Once you have confirmed your roster spot for one run, you can not then back out because you were rostered in a 'better run' (applies to organizers as well, if not given at least a days notice of being replaced/unrostered).",
]
const scheduledRaidsOffenses = [
    'No-show after confirming',
    'Not bidding on obvious upgrades',
    'Leaving early without good cause',
    'Confirming and rescinding',
]

module.exports = {
    name: Events.ThreadCreate,
    once: false,

    /**
     *
     * @param {ThreadChannel} thread
     * @returns
     */
    async execute(thread) {
        if (thread.parent.id === '1139062893573328966') {
            const channel = thread.guild.channels.cache.get(
                '1014042418074624071',
            )
            const Ch_Log = thread.guild.channels.cache.get(
                '1202976505542615140',
            )
            const length = [
                'First Strike',
                'Second Strike',
                'Third Strike',
                'Fourth Strike',
            ]

            //Processing The Text
            const preprocessText = (text) => {
                // Convert text to lowercase
                text = text.toLowerCase()

                // Tokenize the text into individual words
                const words = tokenizer.tokenize(text)

                // Remove punctuation and non-alphanumeric characters
                const cleanedWords = words.map((word) =>
                    word.replace(/[^a-zA-Z0-9]/g, ''),
                )

                // Join the cleaned words back into a single string
                const cleanedText = cleanedWords.join(' ')

                return cleanedText
            }

            const Docs = await communityRulesModel.find({
                guildID: '992300928067698759',
            })

            const doc = Docs.map((doc) => {
                return doc.communityRules
            })

            const preprocessedData = doc.flatMap((ruleSet) => {
                return ruleSet.map(({ text, label }) => {
                    return {
                        text: preprocessText(text),
                        label: label,
                    }
                })
            })

            // Train the classifier
            const classifier = new LogisticRegressionClassifier()
            preprocessedData.forEach((entry) => {
                classifier.addDocument(entry.text, entry.label)
            })
            classifier.train()

            setTimeout(async () => {
                const title = thread.name
                const messages = await thread.messages.fetch({
                    limit: 1,
                    after: 0,
                })
                const message = messages.first()
                const preprocessedTitle = preprocessText(title.toLowerCase())
                const preprocessedDescription = preprocessText(
                    message.content.toLowerCase(),
                )
                const classificationTitle =
                    classifier.getClassifications(preprocessedTitle)
                const classificationDescription = classifier.getClassifications(
                    preprocessedDescription,
                )
                const bestGuessTitle = classificationTitle.reduce(
                    (best, current) =>
                        current.value > best.value ? current : best,
                )
                const bestGuessDescription = classificationDescription.reduce(
                    (best, current) =>
                        current.value > best.value ? current : best,
                )
                const predictedLabelTitle = bestGuessTitle.label
                const confidenceTitle = bestGuessTitle.value

                const predictedLabelDescription = bestGuessDescription.label
                const confidenceDescription = bestGuessDescription.value

                if (message.mentions.users.size > 0) {
                    const mentionedUser = message.mentions.users.first()
                    const mentionedUserID = mentionedUser.id
                    if (confidenceTitle > threshold) {
                        const matches = stringSimilarity.findBestMatch(
                            predictedLabelTitle,
                            scheduledRaidsOffenses,
                        )
                        const matchingIndex = matches.bestMatchIndex
                        // Extract the mentioned user's ID

                        // Issue the warning to the mentioned user
                        // Implement your warning logic here, e.g., send a DM to the user or log the warning

                        const List = await WarningList.find({
                            userId: mentionedUserID,
                        })

                        if (List.length <= 3) {
                            new WarningList({
                                userId: mentionedUserID,
                                guildId: thread.guild.id,
                                moderatorId: thread.ownerId,
                                reason: scheduledRaidsOffenses[matchingIndex],
                                comments: `${
                                    length[List.length]
                                } - https://discord.com/channels/992300928067698759/${
                                    thread.id
                                }`,
                                timestamp: date.toLocaleDateString(),
                            }).save()
                            if (List.length === 3) {
                                new Blacklist({
                                    userId: mentionedUserID,
                                    guildId: thread.guild.id,
                                    reason: 'Maximum Strikes',
                                    comments:
                                        'User Reached Maximum (4) Warnings , And Has Been Automatically Added To The Blacklist',
                                    timestamp: date.toLocaleDateString(),
                                }).save()

                                const embed = new EmbedBuilder()
                                    .setColor('Red')
                                    .setTitle(
                                        '⭕A Strike Has Been Added To The User⭕',
                                    )
                                    .setDescription(
                                        `**Added A Strike To ${mentionedUser}  \n Reason: ${
                                            scheduledRaidsOffenses[
                                                matchingIndex
                                            ]
                                        } \n Comment: ${
                                            length[List.length]
                                        } - https://discord.com/channels/992300928067698759/${
                                            thread.id
                                        } \n \n Also User Was Added To Blacklist Since It Was Their 4th Warning.**`,
                                    )
                                channel.send({
                                    content: `<@${mentionedUserID}> - <@${
                                        thread.ownerId
                                    }> - ${
                                        scheduledRaidsOffenses[matchingIndex]
                                    } - Date Issued: ${date.toLocaleDateString()}`,
                                    embeds: [embed],
                                })

                                let StringData = ' '
                                let number = 1
                                List.map(async (data) => {
                                    StringData =
                                        StringData +
                                        `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                    number += 1
                                })
                                const dmEmbed = new EmbedBuilder()
                                    .setColor('Red')
                                    .setTitle(
                                        '⭕You Have Been Issued A Warning On Wal-Mane⭕',
                                    )
                                    .setDescription(
                                        `**This Is Your Warning ${
                                            List.length + 1
                                        }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                            List.length + 1
                                        }-Reason ${
                                            scheduledRaidsOffenses[
                                                matchingIndex
                                            ]
                                        } -Comment: ${
                                            length[List.length]
                                        } -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. If You Think Your Warning/Blacklist Has Been Done In Error, Please Visit The [Appeal A Warning](https://discord.com/channels/992300928067698759/1008076784660664410) Channel**`,
                                    )
                                mentionedUser
                                    .send({
                                        embeds: [dmEmbed],
                                    })
                                    .then((msg) => {
                                        const Embed = new EmbedBuilder()
                                            .setTitle(
                                                '❌Warning Notification❌',
                                            )
                                            .setDescription(
                                                `Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                            )
                                        Ch_Log.send({
                                            embeds: [Embed],
                                        })
                                    })
                                    .catch((err) => {
                                        const Embed = new EmbedBuilder()
                                            .setTitle(
                                                '❌Warning Notification❌',
                                            )
                                            .setDescription(
                                                `Couldn't Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                            )
                                        Ch_Log.send({
                                            embeds: [Embed],
                                        })
                                    })
                            } else {
                                const embed = new EmbedBuilder()
                                    .setColor('Red')
                                    .setTitle(
                                        '⭕A Strike Has Been Added To The User⭕',
                                    )
                                    .setDescription(
                                        `**Added A Strike To ${mentionedUser}  \n Reason: ${
                                            scheduledRaidsOffenses[
                                                matchingIndex
                                            ]
                                        } \n Comment: ${
                                            length[List.length]
                                        } - https://discord.com/channels/992300928067698759/${
                                            thread.id
                                        }**`,
                                    )
                                channel.send({
                                    content: `<@${mentionedUserID}> - <@${
                                        thread.ownerId
                                    }> - ${
                                        scheduledRaidsOffenses[matchingIndex]
                                    } - Date Issued: ${date.toLocaleDateString()}`,
                                    embeds: [embed],
                                })
                                let StringData = ' '
                                let number = 1
                                List.map(async (data) => {
                                    StringData =
                                        StringData +
                                        `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                    number += 1
                                })
                                const dmEmbed = new EmbedBuilder()
                                    .setColor('Red')
                                    .setTitle(
                                        '⭕You Have Been Issued A Warning On Wal-Mane⭕',
                                    )
                                    .setDescription(
                                        `**This Is Your Warning ${
                                            List.length + 1
                                        }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                            List.length + 1
                                        }-Reason ${
                                            scheduledRaidsOffenses[
                                                matchingIndex
                                            ]
                                        } -Comment: ${
                                            length[List.length]
                                        } -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. If You Think Your Warning/Blacklist Has Been Done In Error, Please Visit The [Appeal A Warning](https://discord.com/channels/992300928067698759/1008076784660664410) Channel**`,
                                    )
                                mentionedUser
                                    .send({
                                        embeds: [dmEmbed],
                                    })
                                    .then((msg) => {
                                        const Embed = new EmbedBuilder()
                                            .setTitle(
                                                '❌Warning Notification❌',
                                            )
                                            .setDescription(
                                                `Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                            )
                                        Ch_Log.send({
                                            embeds: [Embed],
                                        })
                                    })
                                    .catch((err) => {
                                        const Embed = new EmbedBuilder()
                                            .setTitle(
                                                '❌Warning Notification❌',
                                            )
                                            .setDescription(
                                                `Couldn't Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                            )
                                        Ch_Log.send({
                                            embeds: [Embed],
                                        })
                                    })
                            }
                        } else if (List.length >= 4) {
                            const embed = new EmbedBuilder().setColor('Red')
                            setTitle('⭕User Detected On Blacklist⭕'),
                                setDescription(
                                    `**${mentionedUser} Has Reached Maximum Warnings And Is On Blacklist , Can't Add Any More Warnings**`,
                                )
                            thread.send({ embeds: [embed] })
                        }

                        if (List.length === 0) {
                            const Role = thread.guild.roles.cache.find(
                                (role) => role.id === '1036433347280384102',
                            )
                            const roleToUser = thread.guild.members.cache.get(
                                `${mentionedUserID}`,
                            )

                            await roleToUser.roles.add(Role.id)
                        } else if (List.length === 1) {
                            const Role = thread.guild.roles.cache.find(
                                (role) => role.id === '1036544658874044436',
                            )
                            const roleToUser = thread.guild.members.cache.get(
                                `${mentionedUserID}`,
                            )

                            await roleToUser.roles.add(Role.id)
                        }

                        const warningEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('⚠️ Warning Issued')
                            .addFields(
                                {
                                    name: 'User ID',
                                    value: `<@${mentionedUserID}>`,
                                },
                                {
                                    name: 'Reporter',
                                    value: `<@${thread.ownerId}>`,
                                },
                                {
                                    name: 'Time',
                                    value: `<t:${Math.round(
                                        thread.createdTimestamp / 1000,
                                    )}>`,
                                },
                                {
                                    name: 'Offense',
                                    value: `${scheduledRaidsOffenses[matchingIndex]}`,
                                }, // Shortened offense text
                                {
                                    name: 'Action Taken',
                                    value: `${length[List.length]}`,
                                }, // Add action taken here
                                {
                                    name: 'Description',
                                    value: `<@${mentionedUserID}> has been warned for ${scheduledRaidsOffenses[matchingIndex]} by <@${thread.ownerId}>`,
                                },
                            )

                        thread.send({ embeds: [warningEmbed] })
                    } else if (confidenceDescription > threshold) {
                        const matches = stringSimilarity.findBestMatch(
                            predictedLabelDescription,
                            scheduledRaidsOffenses,
                        )
                        const matchingIndex = matches.bestMatchIndex
                        // Extract the mentioned user's ID
                        const mentionedUser = message.mentions.users.first()
                        const mentionedUserID = mentionedUser.id

                        // Issue the warning to the mentioned user
                        // Implement your warning logic here, e.g., send a DM to the user or log the warning

                        const List = await WarningList.find({
                            userId: mentionedUserID,
                        })

                        if (List.length <= 3) {
                            new WarningList({
                                userId: mentionedUserID,
                                guildId: thread.guild.id,
                                moderatorId: thread.ownerId,
                                reason: scheduledRaidsOffenses[matchingIndex],
                                comments: `${
                                    length[List.length]
                                } - https://discord.com/channels/992300928067698759/${
                                    thread.id
                                }`,
                                timestamp: date.toLocaleDateString(),
                            }).save()
                            if (List.length === 3) {
                                new Blacklist({
                                    userId: mentionedUserID,
                                    guildId: thread.guild.id,
                                    reason: 'Maximum Strikes',
                                    comments:
                                        'User Reached Maximum (4) Warnings , And Has Been Automatically Added To The Blacklist',
                                    timestamp: date.toLocaleDateString(),
                                }).save()

                                const embed = new EmbedBuilder()
                                    .setColor('Red')
                                    .setTitle(
                                        '⭕A Strike Has Been Added To The User⭕',
                                    )
                                    .setDescription(
                                        `**Added A Strike To ${mentionedUser}  \n Reason: ${
                                            scheduledRaidsOffenses[
                                                matchingIndex
                                            ]
                                        } \n Comment: ${
                                            length[List.length]
                                        } - https://discord.com/channels/992300928067698759/${
                                            thread.id
                                        } \n \n Also User Was Added To Blacklist Since It Was Their 4th Warning.**`,
                                    )
                                channel.send({
                                    content: `<@${mentionedUserID}> - <@${
                                        thread.ownerId
                                    }> - ${
                                        scheduledRaidsOffenses[matchingIndex]
                                    } - Date Issued: ${date.toLocaleDateString()}`,
                                    embeds: [embed],
                                })

                                let StringData = ' '
                                let number = 1
                                List.map(async (data) => {
                                    StringData =
                                        StringData +
                                        `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                    number += 1
                                })
                                const dmEmbed = new EmbedBuilder()
                                    .setColor('Red')
                                    .setTitle(
                                        '⭕You Have Been Issued A Warning On Wal-Mane⭕',
                                    )
                                    .setDescription(
                                        `**This Is Your Warning ${
                                            List.length + 1
                                        }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                            List.length + 1
                                        }-Reason ${
                                            scheduledRaidsOffenses[
                                                matchingIndex
                                            ]
                                        } -Comment: ${
                                            length[List.length]
                                        } -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. If You Think Your Warning/Blacklist Has Been Done In Error, Please Visit The [Appeal A Warning](https://discord.com/channels/992300928067698759/1008076784660664410) Channel**`,
                                    )
                                mentionedUser
                                    .send({
                                        embeds: [dmEmbed],
                                    })
                                    .then((msg) => {
                                        const Embed = new EmbedBuilder()
                                            .setTitle(
                                                '❌Warning Notification❌',
                                            )
                                            .setDescription(
                                                `Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                            )
                                        Ch_Log.send({
                                            embeds: [Embed],
                                        })
                                    })
                                    .catch((err) => {
                                        const Embed = new EmbedBuilder()
                                            .setTitle(
                                                '❌Warning Notification❌',
                                            )
                                            .setDescription(
                                                `Couldn't Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                            )
                                        Ch_Log.send({
                                            embeds: [Embed],
                                        })
                                    })
                            } else {
                                const embed = new EmbedBuilder()
                                    .setColor('Red')
                                    .setTitle(
                                        '⭕A Strike Has Been Added To The User⭕',
                                    )
                                    .setDescription(
                                        `**Added A Strike To ${mentionedUser}  \n Reason: ${
                                            scheduledRaidsOffenses[
                                                matchingIndex
                                            ]
                                        } \n Comment: ${
                                            length[List.length]
                                        } - https://discord.com/channels/992300928067698759/${
                                            thread.id
                                        }**`,
                                    )
                                channel.send({
                                    content: `<@${mentionedUserID}> - <@${
                                        thread.ownerId
                                    }> - ${
                                        scheduledRaidsOffenses[matchingIndex]
                                    } - Date Issued: ${date.toLocaleDateString()}`,
                                    embeds: [embed],
                                })
                                let StringData = ' '
                                let number = 1
                                List.map(async (data) => {
                                    StringData =
                                        StringData +
                                        `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                    number += 1
                                })
                                const dmEmbed = new EmbedBuilder()
                                    .setColor('Red')
                                    .setTitle(
                                        '⭕You Have Been Issued A Warning On Wal-Mane⭕',
                                    )
                                    .setDescription(
                                        `**This Is Your Warning ${
                                            List.length + 1
                                        }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                            List.length + 1
                                        }-Reason ${
                                            scheduledRaidsOffenses[
                                                matchingIndex
                                            ]
                                        } -Comment: ${
                                            length[List.length]
                                        } -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. If You Think Your Warning/Blacklist Has Been Done In Error, Please Visit The [Appeal A Warning](https://discord.com/channels/992300928067698759/1008076784660664410) Channel**`,
                                    )
                                mentionedUser
                                    .send({
                                        embeds: [dmEmbed],
                                    })
                                    .then((msg) => {
                                        const Embed = new EmbedBuilder()
                                            .setTitle(
                                                '❌Warning Notification❌',
                                            )
                                            .setDescription(
                                                `Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                            )
                                        Ch_Log.send({
                                            embeds: [Embed],
                                        })
                                    })
                                    .catch((err) => {
                                        const Embed = new EmbedBuilder()
                                            .setTitle(
                                                '❌Warning Notification❌',
                                            )
                                            .setDescription(
                                                `Couldn't Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                            )
                                        Ch_Log.send({
                                            embeds: [Embed],
                                        })
                                    })
                            }
                        } else if (List.length >= 4) {
                            const embed = new EmbedBuilder().setColor('Red')
                            setTitle('⭕User Detected On Blacklist⭕'),
                                setDescription(
                                    `**${mentionedUser} Has Reached Maximum Warnings And Is On Blacklist , Can't Add Any More Warnings**`,
                                )
                            thread.send({ embeds: [embed] })
                        }

                        if (List.length === 0) {
                            const Role = thread.guild.roles.cache.find(
                                (role) => role.id === '1036433347280384102',
                            )
                            const roleToUser = thread.guild.members.cache.get(
                                `${mentionedUserID}`,
                            )

                            await roleToUser.roles.add(Role.id)
                        } else if (List.length === 1) {
                            const Role = thread.guild.roles.cache.find(
                                (role) => role.id === '1036544658874044436',
                            )
                            const roleToUser = thread.guild.members.cache.get(
                                `${mentionedUserID}`,
                            )

                            await roleToUser.roles.add(Role.id)
                        }

                        const warningEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('⚠️ Warning Issued')
                            .addFields(
                                {
                                    name: 'User ID',
                                    value: `<@${mentionedUserID}>`,
                                },
                                {
                                    name: 'Reporter',
                                    value: `<@${thread.ownerId}>`,
                                },
                                {
                                    name: 'Time',
                                    value: `<t:${Math.round(
                                        thread.createdTimestamp / 1000,
                                    )}>`,
                                },
                                {
                                    name: 'Offense',
                                    value: `${scheduledRaidsOffenses[matchingIndex]}`,
                                }, // Shortened offense text
                                {
                                    name: 'Action Taken',
                                    value: `${length[List.length]}`,
                                }, // Add action taken here
                                {
                                    name: 'Description',
                                    value: `<@${mentionedUserID}> has been warned for ${scheduledRaidsOffenses[matchingIndex]} by <@${thread.ownerId}>`,
                                },
                            )

                        thread.send({ embeds: [warningEmbed] })
                    } else {
                        const embed = new EmbedBuilder()
                            .setColor('#0099ff')
                            .setTitle('Offense Reason Not Detected')
                            .setDescription(
                                "I couldn't understand the offense reason based on the description provided. Could you please send a brief description of the incident?",
                            )

                        // Send the embed message to the user
                        const sentMessage = await thread.send({
                            embeds: [embed],
                        })
                        const filter = (response) =>
                            response.author.id === thread.ownerId

                        const reasonCollector = thread.createMessageCollector({
                            filter: filter,
                            max: 1,
                        })

                        reasonCollector.on('collect', async (message) => {
                            // Store the response somewhere (e.g., in a database)
                            userResponse = message.content
                            // Handle the response as needed

                            reasonCollector.stop()

                            showDropdownOptions(thread)
                        })

                        // Create a message collector
                        const collector =
                            thread.createMessageComponentCollector({
                                componentType: ComponentType.StringSelect,
                            }) // Time is optional, set to 60 seconds in this example

                        collector.on('collect', async (interaction) => {
                            if (interaction.isStringSelectMenu()) {
                                if (interaction.user.id === thread.ownerId) {
                                    const hasRole =
                                        interaction.member.roles.cache.some(
                                            (role) =>
                                                role.id ===
                                                    '994997307827294298' ||
                                                role.id ===
                                                    '1043857765120090142',
                                        )
                                    if (hasRole) {
                                        const selectedOption =
                                            interaction.values[0]
                                        // Disable the dropdown menu
                                        const Message = interaction.message
                                        Message.delete()
                                        // Create a select menu
                                        const selectMenu =
                                            new ActionRowBuilder().addComponents(
                                                new StringSelectMenuBuilder()
                                                    .setCustomId('offense_dd')
                                                    .setPlaceholder(
                                                        `${selectedOption}`,
                                                    )
                                                    .setDisabled(true)
                                                    .setMaxValues(1)
                                                    .setMinValues(1)
                                                    .setOptions({
                                                        label: `\u200b`,
                                                        value: '\u200b',
                                                    }),
                                            )
                                        interaction.channel.send({
                                            content: 'Option Chosen ✅',
                                            components: [selectMenu],
                                        })

                                        const matches =
                                            stringSimilarity.findBestMatch(
                                                selectedOption,
                                                scheduledRaidsOffenses,
                                            )
                                        const matchingIndex =
                                            matches.bestMatchIndex

                                        const newCommunityRule = {
                                            text: `${userResponse}`,
                                            label: `${communityRules[matchingIndex]}`,
                                        }

                                        await communityRulesModel.findOneAndUpdate(
                                            { guildID: thread.guild.id }, // Query condition
                                            {
                                                $push: {
                                                    communityRules:
                                                        newCommunityRule,
                                                },
                                            }, // Update operation
                                            { new: true, upsert: true }, // Return updated document and create if not found
                                        )
                                        //I Should Add Something On Top Of This
                                        const List = await WarningList.find({
                                            userId: mentionedUserID,
                                        })

                                        if (List.length <= 3) {
                                            new WarningList({
                                                userId: mentionedUserID,
                                                guildId: thread.guild.id,
                                                moderatorId: thread.ownerId,
                                                reason: scheduledRaidsOffenses[
                                                    matchingIndex
                                                ],
                                                comments: `${
                                                    length[List.length]
                                                } - https://discord.com/channels/992300928067698759/${
                                                    thread.id
                                                }`,
                                                timestamp:
                                                    date.toLocaleDateString(),
                                            }).save()
                                            if (List.length === 3) {
                                                new Blacklist({
                                                    userId: mentionedUserID,
                                                    guildId: thread.guild.id,
                                                    reason: 'Maximum Strikes',
                                                    comments:
                                                        'User Reached Maximum (4) Warnings , And Has Been Automatically Added To The Blacklist',
                                                    timestamp:
                                                        date.toLocaleDateString(),
                                                }).save()

                                                const embed = new EmbedBuilder()
                                                    .setColor('Red')
                                                    .setTitle(
                                                        '⭕A Strike Has Been Added To The User⭕',
                                                    )
                                                    .setDescription(
                                                        `**Added A Strike To ${mentionedUser}  \n Reason: ${
                                                            scheduledRaidsOffenses[
                                                                matchingIndex
                                                            ]
                                                        } \n Comment: ${
                                                            length[List.length]
                                                        } - https://discord.com/channels/992300928067698759/${
                                                            thread.id
                                                        } \n \n Also User Was Added To Blacklist Since It Was Their 4th Warning.**`,
                                                    )
                                                channel.send({
                                                    content: `<@${mentionedUserID}> - <@${
                                                        thread.ownerId
                                                    }> - ${
                                                        scheduledRaidsOffenses[
                                                            matchingIndex
                                                        ]
                                                    } - Date Issued: ${date.toLocaleDateString()}`,
                                                    embeds: [embed],
                                                })

                                                let StringData = ' '
                                                let number = 1
                                                List.map(async (data) => {
                                                    StringData =
                                                        StringData +
                                                        `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                                    number += 1
                                                })
                                                const dmEmbed =
                                                    new EmbedBuilder()
                                                        .setColor('Red')
                                                        .setTitle(
                                                            '⭕You Have Been Issued A Warning On Wal-Mane⭕',
                                                        )
                                                        .setDescription(
                                                            `**This Is Your Warning ${
                                                                List.length + 1
                                                            }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                                                List.length + 1
                                                            }-Reason ${
                                                                scheduledRaidsOffenses[
                                                                    matchingIndex
                                                                ]
                                                            } -Comment: ${
                                                                length[
                                                                    List.length
                                                                ]
                                                            } -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. If You Think Your Warning/Blacklist Has Been Done In Error, Please Visit The [Appeal A Warning](https://discord.com/channels/992300928067698759/1008076784660664410) Channel**`,
                                                        )
                                                mentionedUser
                                                    .send({
                                                        embeds: [dmEmbed],
                                                    })
                                                    .then((msg) => {
                                                        const Embed =
                                                            new EmbedBuilder()
                                                                .setTitle(
                                                                    '❌Warning Notification❌',
                                                                )
                                                                .setDescription(
                                                                    `Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                                )
                                                        Ch_Log.send({
                                                            embeds: [Embed],
                                                        })
                                                    })
                                                    .catch((err) => {
                                                        const Embed =
                                                            new EmbedBuilder()
                                                                .setTitle(
                                                                    '❌Warning Notification❌',
                                                                )
                                                                .setDescription(
                                                                    `Couldn't Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                                )
                                                        Ch_Log.send({
                                                            embeds: [Embed],
                                                        })
                                                    })
                                            } else {
                                                const embed = new EmbedBuilder()
                                                    .setColor('Red')
                                                    .setTitle(
                                                        '⭕A Strike Has Been Added To The User⭕',
                                                    )
                                                    .setDescription(
                                                        `**Added A Strike To ${mentionedUser}  \n Reason: ${
                                                            scheduledRaidsOffenses[
                                                                matchingIndex
                                                            ]
                                                        } \n Comment: ${
                                                            length[List.length]
                                                        } - https://discord.com/channels/992300928067698759/${
                                                            thread.id
                                                        }**`,
                                                    )
                                                channel.send({
                                                    content: `<@${mentionedUserID}> - <@${
                                                        thread.ownerId
                                                    }> - ${
                                                        scheduledRaidsOffenses[
                                                            matchingIndex
                                                        ]
                                                    } - Date Issued: ${date.toLocaleDateString()}`,
                                                    embeds: [embed],
                                                })
                                                let StringData = ' '
                                                let number = 1
                                                List.map(async (data) => {
                                                    StringData =
                                                        StringData +
                                                        `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                                    number += 1
                                                })
                                                const dmEmbed =
                                                    new EmbedBuilder()
                                                        .setColor('Red')
                                                        .setTitle(
                                                            '⭕You Have Been Issued A Warning On Wal-Mane⭕',
                                                        )
                                                        .setDescription(
                                                            `**This Is Your Warning ${
                                                                List.length + 1
                                                            }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                                                List.length + 1
                                                            }-Reason ${
                                                                scheduledRaidsOffenses[
                                                                    matchingIndex
                                                                ]
                                                            } -Comment: ${
                                                                length[
                                                                    List.length
                                                                ]
                                                            } -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. If You Think Your Warning/Blacklist Has Been Done In Error, Please Visit The [Appeal A Warning](https://discord.com/channels/992300928067698759/1008076784660664410) Channel**`,
                                                        )
                                                mentionedUser
                                                    .send({
                                                        embeds: [dmEmbed],
                                                    })
                                                    .then((msg) => {
                                                        const Embed =
                                                            new EmbedBuilder()
                                                                .setTitle(
                                                                    '❌Warning Notification❌',
                                                                )
                                                                .setDescription(
                                                                    `Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                                )
                                                        Ch_Log.send({
                                                            embeds: [Embed],
                                                        })
                                                    })
                                                    .catch((err) => {
                                                        const Embed =
                                                            new EmbedBuilder()
                                                                .setTitle(
                                                                    '❌Warning Notification❌',
                                                                )
                                                                .setDescription(
                                                                    `Couldn't Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                                )
                                                        Ch_Log.send({
                                                            embeds: [Embed],
                                                        })
                                                    })
                                            }
                                        } else if (List.length >= 4) {
                                            const embed =
                                                new EmbedBuilder().setColor(
                                                    'Red',
                                                )
                                            setTitle(
                                                '⭕User Detected On Blacklist⭕',
                                            ),
                                                setDescription(
                                                    `**${mentionedUser} Has Reached Maximum Warnings And Is On Blacklist , Can't Add Any More Warnings**`,
                                                )
                                            thread.send({ embeds: [embed] })
                                        }
                                        if (List.length === 0) {
                                            const Role =
                                                thread.guild.roles.cache.find(
                                                    (role) =>
                                                        role.id ===
                                                        '1036433347280384102',
                                                )
                                            const roleToUser =
                                                thread.guild.members.cache.get(
                                                    `${mentionedUserID}`,
                                                )

                                            await roleToUser.roles.add(Role.id)
                                        } else if (List.length === 1) {
                                            const Role =
                                                thread.guild.roles.cache.find(
                                                    (role) =>
                                                        role.id ===
                                                        '1036544658874044436',
                                                )
                                            const roleToUser =
                                                thread.guild.members.cache.get(
                                                    `${mentionedUserID}`,
                                                )

                                            await roleToUser.roles.add(Role.id)
                                        }

                                        const warningEmbed = new EmbedBuilder()
                                            .setColor('#ff0000')
                                            .setTitle('⚠️ Warning Issued')
                                            .addFields(
                                                {
                                                    name: 'User ID',
                                                    value: `<@${mentionedUserID}>`,
                                                },
                                                {
                                                    name: 'Reporter',
                                                    value: `<@${thread.ownerId}>`,
                                                },
                                                {
                                                    name: 'Time',
                                                    value: `<t:${Math.round(
                                                        thread.createdTimestamp /
                                                            1000,
                                                    )}>`,
                                                },
                                                {
                                                    name: 'Offense',
                                                    value: `${scheduledRaidsOffenses[matchingIndex]}`,
                                                }, // Shortened offense text
                                                {
                                                    name: 'Action Taken',
                                                    value: `${
                                                        length[List.length]
                                                    }`,
                                                }, // Add action taken here
                                                {
                                                    name: 'Description',
                                                    value: `<@${mentionedUserID}> has been warned for ${scheduledRaidsOffenses[matchingIndex]} by <@${thread.ownerId}>`,
                                                },
                                            )

                                        thread.send({ embeds: [warningEmbed] })
                                    }
                                }
                            }

                            collector.stop()
                        })
                    }
                } else {
                    if (confidenceTitle > threshold) {
                        const matches = stringSimilarity.findBestMatch(
                            predictedLabelTitle,
                            scheduledRaidsOffenses,
                        )
                        const matchingIndex = matches.bestMatchIndex
                        const noMentionEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('Mention Request')
                            .setDescription(
                                '**Missing Mentions**\nTo process your warning request, please provide the @mention of the user the complaint is against. This is necessary to ensure that the correct individual is identified and that the complaint is addressed appropriately. Without this information, we cannot proceed further. Thank you for your cooperation.',
                            )

                        thread.send({ embeds: [noMentionEmbed] })

                        const filter = (response) =>
                            response.author.id === thread.ownerId &&
                            response.mentions.users.size === 1
                        const collector = thread.createMessageCollector({
                            filter,
                            max: 1,
                        }) // No time limit

                        collector.on('collect', async (response) => {
                            // Extract the mentioned user's ID
                            const mentionedUser =
                                response.mentions.users.first()
                            const mentionedUserID = mentionedUser.id

                            // Issue the warning to the mentioned user
                            // Implement your warning logic here, e.g., send a DM to the user or log the warning

                            const List = await WarningList.find({
                                userId: mentionedUserID,
                            })

                            if (List.length <= 3) {
                                new WarningList({
                                    userId: mentionedUserID,
                                    guildId: thread.guild.id,
                                    moderatorId: thread.ownerId,
                                    reason: scheduledRaidsOffenses[
                                        matchingIndex
                                    ],
                                    comments: `${
                                        length[List.length]
                                    } - https://discord.com/channels/992300928067698759/${
                                        thread.id
                                    }`,
                                    timestamp: date.toLocaleDateString(),
                                }).save()
                                if (List.length === 3) {
                                    new Blacklist({
                                        userId: mentionedUserID,
                                        guildId: thread.guild.id,
                                        reason: 'Maximum Strikes',
                                        comments:
                                            'User Reached Maximum (4) Warnings , And Has Been Automatically Added To The Blacklist',
                                        timestamp: date.toLocaleDateString(),
                                    }).save()

                                    const embed = new EmbedBuilder()
                                        .setColor('Red')
                                        .setTitle(
                                            '⭕A Strike Has Been Added To The User⭕',
                                        )
                                        .setDescription(
                                            `**Added A Strike To ${mentionedUser}  \n Reason: ${
                                                scheduledRaidsOffenses[
                                                    matchingIndex
                                                ]
                                            } \n Comment: ${
                                                length[List.length]
                                            } - https://discord.com/channels/992300928067698759/${
                                                thread.id
                                            } \n \n Also User Was Added To Blacklist Since It Was Their 4th Warning.**`,
                                        )
                                    channel.send({
                                        content: `<@${mentionedUserID}> - <@${
                                            thread.ownerId
                                        }> - ${
                                            scheduledRaidsOffenses[
                                                matchingIndex
                                            ]
                                        } - Date Issued: ${date.toLocaleDateString()}`,
                                        embeds: [embed],
                                    })

                                    let StringData = ' '
                                    let number = 1
                                    List.map(async (data) => {
                                        StringData =
                                            StringData +
                                            `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                        number += 1
                                    })
                                    const dmEmbed = new EmbedBuilder()
                                        .setColor('Red')
                                        .setTitle(
                                            '⭕You Have Been Issued A Warning On Wal-Mane⭕',
                                        )
                                        .setDescription(
                                            `**This Is Your Warning ${
                                                List.length + 1
                                            }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                                List.length + 1
                                            }-Reason ${
                                                scheduledRaidsOffenses[
                                                    matchingIndex
                                                ]
                                            } -Comment: ${
                                                length[List.length]
                                            } -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. If You Think Your Warning/Blacklist Has Been Done In Error, Please Visit The [Appeal A Warning](https://discord.com/channels/992300928067698759/1008076784660664410) Channel**`,
                                        )
                                    mentionedUser
                                        .send({
                                            embeds: [dmEmbed],
                                        })
                                        .then((msg) => {
                                            const Embed = new EmbedBuilder()
                                                .setTitle(
                                                    '❌Warning Notification❌',
                                                )
                                                .setDescription(
                                                    `Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                )
                                            Ch_Log.send({
                                                embeds: [Embed],
                                            })
                                        })
                                        .catch((err) => {
                                            const Embed = new EmbedBuilder()
                                                .setTitle(
                                                    '❌Warning Notification❌',
                                                )
                                                .setDescription(
                                                    `Couldn't Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                )
                                            Ch_Log.send({
                                                embeds: [Embed],
                                            })
                                        })
                                } else {
                                    const embed = new EmbedBuilder()
                                        .setColor('Red')
                                        .setTitle(
                                            '⭕A Strike Has Been Added To The User⭕',
                                        )
                                        .setDescription(
                                            `**Added A Strike To ${mentionedUser}  \n Reason: ${
                                                scheduledRaidsOffenses[
                                                    matchingIndex
                                                ]
                                            } \n Comment: ${
                                                length[List.length]
                                            } - https://discord.com/channels/992300928067698759/${
                                                thread.id
                                            }**`,
                                        )
                                    channel.send({
                                        content: `<@${mentionedUserID}> - <@${
                                            thread.ownerId
                                        }> - ${
                                            scheduledRaidsOffenses[
                                                matchingIndex
                                            ]
                                        } - Date Issued: ${date.toLocaleDateString()}`,
                                        embeds: [embed],
                                    })
                                    let StringData = ' '
                                    let number = 1
                                    List.map(async (data) => {
                                        StringData =
                                            StringData +
                                            `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                        number += 1
                                    })
                                    const dmEmbed = new EmbedBuilder()
                                        .setColor('Red')
                                        .setTitle(
                                            '⭕You Have Been Issued A Warning On Wal-Mane⭕',
                                        )
                                        .setDescription(
                                            `**This Is Your Warning ${
                                                List.length + 1
                                            }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                                List.length + 1
                                            }-Reason ${
                                                scheduledRaidsOffenses[
                                                    matchingIndex
                                                ]
                                            } -Comment: ${
                                                length[List.length]
                                            } -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. If You Think Your Warning/Blacklist Has Been Done In Error, Please Visit The [Appeal A Warning](https://discord.com/channels/992300928067698759/1008076784660664410) Channel**`,
                                        )
                                    mentionedUser
                                        .send({
                                            embeds: [dmEmbed],
                                        })
                                        .then((msg) => {
                                            const Embed = new EmbedBuilder()
                                                .setTitle(
                                                    '❌Warning Notification❌',
                                                )
                                                .setDescription(
                                                    `Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                )
                                            Ch_Log.send({
                                                embeds: [Embed],
                                            })
                                        })
                                        .catch((err) => {
                                            const Embed = new EmbedBuilder()
                                                .setTitle(
                                                    '❌Warning Notification❌',
                                                )
                                                .setDescription(
                                                    `Couldn't Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                )
                                            Ch_Log.send({
                                                embeds: [Embed],
                                            })
                                        })
                                }
                            } else if (List.length >= 4) {
                                const embed = new EmbedBuilder().setColor('Red')
                                setTitle('⭕User Detected On Blacklist⭕'),
                                    setDescription(
                                        `**${mentionedUser} Has Reached Maximum Warnings And Is On Blacklist , Can't Add Any More Warnings**`,
                                    )
                                thread.send({ embeds: [embed] })
                            }
                            if (List.length === 0) {
                                const Role = thread.guild.roles.cache.find(
                                    (role) => role.id === '1036433347280384102',
                                )
                                const roleToUser =
                                    thread.guild.members.cache.get(
                                        `${mentionedUserID}`,
                                    )

                                await roleToUser.roles.add(Role.id)
                            } else if (List.length === 1) {
                                const Role = thread.guild.roles.cache.find(
                                    (role) => role.id === '1036544658874044436',
                                )
                                const roleToUser =
                                    thread.guild.members.cache.get(
                                        `${mentionedUserID}`,
                                    )

                                await roleToUser.roles.add(Role.id)
                            }

                            const warningEmbed = new EmbedBuilder()
                                .setColor('#ff0000')
                                .setTitle('⚠️ Warning Issued')
                                .addFields(
                                    {
                                        name: 'User ID',
                                        value: `<@${mentionedUserID}>`,
                                    },
                                    {
                                        name: 'Reporter',
                                        value: `<@${thread.ownerId}>`,
                                    },
                                    {
                                        name: 'Time',
                                        value: `<t:${Math.round(
                                            thread.createdTimestamp / 1000,
                                        )}>`,
                                    },
                                    {
                                        name: 'Offense',
                                        value: `${scheduledRaidsOffenses[matchingIndex]}`,
                                    }, // Shortened offense text
                                    {
                                        name: 'Action Taken',
                                        value: `${length[List.length]}`,
                                    }, // Add action taken here
                                    {
                                        name: 'Description',
                                        value: `<@${mentionedUserID}> has been warned for ${scheduledRaidsOffenses[matchingIndex]} by <@${thread.ownerId}>`,
                                    },
                                )

                            thread.send({ embeds: [warningEmbed] })

                            collector.stop()
                        })
                    } else if (confidenceDescription > threshold) {
                        const matches = stringSimilarity.findBestMatch(
                            predictedLabelDescription,
                            scheduledRaidsOffenses,
                        )
                        const matchingIndex = matches.bestMatchIndex
                        const noMentionEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('Mention Request')
                            .setDescription(
                                '**Missing Mentions**\nTo process your warning request, please provide the @mention of the user the complaint is against. This is necessary to ensure that the correct individual is identified and that the complaint is addressed appropriately. Without this information, we cannot proceed further. Thank you for your cooperation.',
                            )

                        thread.send({ embeds: [noMentionEmbed] })

                        const filter = (response) =>
                            response.author.id === thread.ownerId &&
                            response.mentions.users.size === 1
                        const collector = thread.createMessageCollector({
                            filter,
                            max: 1,
                        }) // No time limit

                        collector.on('collect', async (response) => {
                            // Extract the mentioned user's ID
                            const mentionedUser =
                                response.mentions.users.first()
                            const mentionedUserID = mentionedUser.id

                            // Issue the warning to the mentioned user
                            // Implement your warning logic here, e.g., send a DM to the user or log the warning

                            const List = await WarningList.find({
                                userId: mentionedUserID,
                            })

                            if (List.length <= 3) {
                                new WarningList({
                                    userId: mentionedUserID,
                                    guildId: thread.guild.id,
                                    moderatorId: thread.ownerId,
                                    reason: scheduledRaidsOffenses[
                                        matchingIndex
                                    ],
                                    comments: `${
                                        length[List.length]
                                    } - https://discord.com/channels/992300928067698759/${
                                        thread.id
                                    }`,
                                    timestamp: date.toLocaleDateString(),
                                }).save()
                                if (List.length === 3) {
                                    new Blacklist({
                                        userId: mentionedUserID,
                                        guildId: thread.guild.id,
                                        reason: 'Maximum Strikes',
                                        comments:
                                            'User Reached Maximum (4) Warnings , And Has Been Automatically Added To The Blacklist',
                                        timestamp: date.toLocaleDateString(),
                                    }).save()

                                    const embed = new EmbedBuilder()
                                        .setColor('Red')
                                        .setTitle(
                                            '⭕A Strike Has Been Added To The User⭕',
                                        )
                                        .setDescription(
                                            `**Added A Strike To ${mentionedUser}  \n Reason: ${
                                                scheduledRaidsOffenses[
                                                    matchingIndex
                                                ]
                                            } \n Comment: ${
                                                length[List.length]
                                            } - https://discord.com/channels/992300928067698759/${
                                                thread.id
                                            } \n \n Also User Was Added To Blacklist Since It Was Their 4th Warning.**`,
                                        )
                                    channel.send({
                                        content: `<@${mentionedUserID}> - <@${
                                            thread.ownerId
                                        }> - ${
                                            scheduledRaidsOffenses[
                                                matchingIndex
                                            ]
                                        } - Date Issued: ${date.toLocaleDateString()}`,
                                        embeds: [embed],
                                    })

                                    let StringData = ' '
                                    let number = 1
                                    List.map(async (data) => {
                                        StringData =
                                            StringData +
                                            `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                        number += 1
                                    })
                                    const dmEmbed = new EmbedBuilder()
                                        .setColor('Red')
                                        .setTitle(
                                            '⭕You Have Been Issued A Warning On Wal-Mane⭕',
                                        )
                                        .setDescription(
                                            `**This Is Your Warning ${
                                                List.length + 1
                                            }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                                List.length + 1
                                            }-Reason ${
                                                scheduledRaidsOffenses[
                                                    matchingIndex
                                                ]
                                            } -Comment: ${
                                                length[List.length]
                                            } -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. If You Think Your Warning/Blacklist Has Been Done In Error, Please Visit The [Appeal A Warning](https://discord.com/channels/992300928067698759/1008076784660664410) Channel**`,
                                        )
                                    mentionedUser
                                        .send({
                                            embeds: [dmEmbed],
                                        })
                                        .then((msg) => {
                                            const Embed = new EmbedBuilder()
                                                .setTitle(
                                                    '❌Warning Notification❌',
                                                )
                                                .setDescription(
                                                    `Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                )
                                            Ch_Log.send({
                                                embeds: [Embed],
                                            })
                                        })
                                        .catch((err) => {
                                            const Embed = new EmbedBuilder()
                                                .setTitle(
                                                    '❌Warning Notification❌',
                                                )
                                                .setDescription(
                                                    `Couldn't Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                )
                                            Ch_Log.send({
                                                embeds: [Embed],
                                            })
                                        })
                                } else {
                                    const embed = new EmbedBuilder()
                                        .setColor('Red')
                                        .setTitle(
                                            '⭕A Strike Has Been Added To The User⭕',
                                        )
                                        .setDescription(
                                            `**Added A Strike To ${mentionedUser}  \n Reason: ${
                                                scheduledRaidsOffenses[
                                                    matchingIndex
                                                ]
                                            } \n Comment: ${
                                                length[List.length]
                                            } - https://discord.com/channels/992300928067698759/${
                                                thread.id
                                            }**`,
                                        )
                                    channel.send({
                                        content: `<@${mentionedUserID}> - <@${
                                            thread.ownerId
                                        }> - ${
                                            scheduledRaidsOffenses[
                                                matchingIndex
                                            ]
                                        } - Date Issued: ${date.toLocaleDateString()}`,
                                        embeds: [embed],
                                    })
                                    let StringData = ' '
                                    let number = 1
                                    List.map(async (data) => {
                                        StringData =
                                            StringData +
                                            `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                        number += 1
                                    })
                                    const dmEmbed = new EmbedBuilder()
                                        .setColor('Red')
                                        .setTitle(
                                            '⭕You Have Been Issued A Warning On Wal-Mane⭕',
                                        )
                                        .setDescription(
                                            `**This Is Your Warning ${
                                                List.length + 1
                                            }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                                List.length + 1
                                            }-Reason ${
                                                scheduledRaidsOffenses[
                                                    matchingIndex
                                                ]
                                            } -Comment: ${
                                                length[List.length]
                                            } -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. If You Think Your Warning/Blacklist Has Been Done In Error, Please Visit The [Appeal A Warning](https://discord.com/channels/992300928067698759/1008076784660664410) Channel**`,
                                        )
                                    mentionedUser
                                        .send({
                                            embeds: [dmEmbed],
                                        })
                                        .then((msg) => {
                                            const Embed = new EmbedBuilder()
                                                .setTitle(
                                                    '❌Warning Notification❌',
                                                )
                                                .setDescription(
                                                    `Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                )
                                            Ch_Log.send({
                                                embeds: [Embed],
                                            })
                                        })
                                        .catch((err) => {
                                            const Embed = new EmbedBuilder()
                                                .setTitle(
                                                    '❌Warning Notification❌',
                                                )
                                                .setDescription(
                                                    `Couldn't Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                )
                                            Ch_Log.send({
                                                embeds: [Embed],
                                            })
                                        })
                                }
                            } else if (List.length >= 4) {
                                const embed = new EmbedBuilder().setColor('Red')
                                setTitle('⭕User Detected On Blacklist⭕'),
                                    setDescription(
                                        `**${mentionedUser} Has Reached Maximum Warnings And Is On Blacklist , Can't Add Any More Warnings**`,
                                    )
                                thread.send({ embeds: [embed] })
                            }

                            if (List.length === 0) {
                                const Role = thread.guild.roles.cache.find(
                                    (role) => role.id === '1036433347280384102',
                                )
                                const roleToUser =
                                    thread.guild.members.cache.get(
                                        `${mentionedUserID}`,
                                    )

                                await roleToUser.roles.add(Role.id)
                            } else if (List.length === 1) {
                                const Role = thread.guild.roles.cache.find(
                                    (role) => role.id === '1036544658874044436',
                                )
                                const roleToUser =
                                    thread.guild.members.cache.get(
                                        `${mentionedUserID}`,
                                    )

                                await roleToUser.roles.add(Role.id)
                            }

                            const warningEmbed = new EmbedBuilder()
                                .setColor('#ff0000')
                                .setTitle('⚠️ Warning Issued')
                                .addFields(
                                    {
                                        name: 'User ID',
                                        value: `<@${mentionedUserID}>`,
                                    },
                                    {
                                        name: 'Reporter',
                                        value: `<@${thread.ownerId}>`,
                                    },
                                    {
                                        name: 'Time',
                                        value: `<t:${Math.round(
                                            thread.createdTimestamp / 1000,
                                        )}>`,
                                    },
                                    {
                                        name: 'Offense',
                                        value: `${scheduledRaidsOffenses[matchingIndex]}`,
                                    }, // Shortened offense text
                                    {
                                        name: 'Action Taken',
                                        value: `${length[List.length]}`,
                                    }, // Add action taken here
                                    {
                                        name: 'Description',
                                        value: `<@${mentionedUserID}> has been warned for ${scheduledRaidsOffenses[matchingIndex]} by <@${thread.ownerId}>`,
                                    },
                                )

                            thread.send({ embeds: [warningEmbed] })

                            collector.stop()
                        })
                    } else {
                        const noMentionEmbed = new EmbedBuilder()
                            .setColor('#ff0000')
                            .setTitle('Mention Request')
                            .setDescription(
                                '**Missing Mentions**\nTo process your warning request, please provide the @mention of the user the complaint is against. This is necessary to ensure that the correct individual is identified and that the complaint is addressed appropriately. Without this information, we cannot proceed further. Thank you for your cooperation.',
                            )

                        thread.send({ embeds: [noMentionEmbed] })

                        const filter = (response) =>
                            response.author.id === thread.ownerId &&
                            response.mentions.users.size === 1
                        const collector = thread.createMessageCollector({
                            filter,
                            max: 1,
                        }) // No time limit

                        let mentionedUser
                        let mentionedUserID
                        collector.on('collect', async (response) => {
                            // Extract the mentioned user's ID
                            mentionedUser = response.mentions.users.first()
                            mentionedUserID = mentionedUser.id

                            collector.stop()

                            const embed = new EmbedBuilder()
                                .setColor('#0099ff')
                                .setTitle('Offense Reason Not Detected')
                                .setDescription(
                                    "I couldn't understand the offense reason based on the description provided. Could you please send a brief description of the incident?",
                                )

                            // Send the embed message to the user
                            const sentMessage = await thread.send({
                                embeds: [embed],
                            })
                            const filter2 = (response) =>
                                response.author.id === thread.ownerId

                            const reasonCollector =
                                thread.createMessageCollector({
                                    filter: filter2,
                                    max: 1,
                                })

                            reasonCollector.on('collect', async (message) => {
                                // Store the response somewhere (e.g., in a database)
                                userResponse = message.content
                                // Handle the response as needed
                                showDropdownOptions(thread)

                                reasonCollector.stop()
                                const collector2 =
                                    thread.createMessageComponentCollector({
                                        componentType:
                                            ComponentType.StringSelect,
                                    }) // Time is optional, set to 60 seconds in this example

                                collector2.on(
                                    'collect',
                                    async (interaction) => {
                                        if (interaction.isStringSelectMenu()) {
                                            if (
                                                interaction.user.id ===
                                                thread.ownerId
                                            ) {
                                                const hasRole =
                                                    interaction.member.roles.cache.some(
                                                        (role) =>
                                                            role.id ===
                                                                '994997307827294298' ||
                                                            role.id ===
                                                                '1043857765120090142',
                                                    )
                                                if (hasRole) {
                                                    const selectedOption =
                                                        interaction.values[0]
                                                    // Disable the dropdown menu
                                                    const Message =
                                                        interaction.message
                                                    Message.delete()
                                                    // Create a select menu
                                                    const selectMenu =
                                                        new ActionRowBuilder().addComponents(
                                                            new StringSelectMenuBuilder()
                                                                .setCustomId(
                                                                    'offense_dd',
                                                                )
                                                                .setPlaceholder(
                                                                    `${selectedOption}`,
                                                                )
                                                                .setDisabled(
                                                                    true,
                                                                )
                                                                .setMaxValues(1)
                                                                .setMinValues(1)
                                                                .setOptions({
                                                                    label: `\u200b`,
                                                                    value: '\u200b',
                                                                }),
                                                        )
                                                    interaction.channel.send({
                                                        content:
                                                            'Option Chosen ✅',
                                                        components: [
                                                            selectMenu,
                                                        ],
                                                    })

                                                    const matches =
                                                        stringSimilarity.findBestMatch(
                                                            selectedOption,
                                                            scheduledRaidsOffenses,
                                                        )
                                                    const matchingIndex =
                                                        matches.bestMatchIndex

                                                    const newCommunityRule = {
                                                        text: `${userResponse}`,
                                                        label: `${communityRules[matchingIndex]}`,
                                                    }

                                                    await communityRulesModel.findOneAndUpdate(
                                                        {
                                                            guildID:
                                                                thread.guild.id,
                                                        }, // Query condition
                                                        {
                                                            $push: {
                                                                communityRules:
                                                                    newCommunityRule,
                                                            },
                                                        }, // Update operation
                                                        {
                                                            new: true,
                                                            upsert: true,
                                                        }, // Return updated document and create if not found
                                                    )
                                                    //I Should Add Something On Top Of This
                                                    const List =
                                                        await WarningList.find({
                                                            userId: mentionedUserID,
                                                        })

                                                    if (List.length <= 3) {
                                                        new WarningList({
                                                            userId: mentionedUserID,
                                                            guildId:
                                                                thread.guild.id,
                                                            moderatorId:
                                                                thread.ownerId,
                                                            reason: scheduledRaidsOffenses[
                                                                matchingIndex
                                                            ],
                                                            comments: `${
                                                                length[
                                                                    List.length
                                                                ]
                                                            } - https://discord.com/channels/992300928067698759/${
                                                                thread.id
                                                            }`,
                                                            timestamp:
                                                                date.toLocaleDateString(),
                                                        }).save()
                                                        if (List.length === 3) {
                                                            new Blacklist({
                                                                userId: mentionedUserID,
                                                                guildId:
                                                                    thread.guild
                                                                        .id,
                                                                reason: 'Maximum Strikes',
                                                                comments:
                                                                    'User Reached Maximum (4) Warnings , And Has Been Automatically Added To The Blacklist',
                                                                timestamp:
                                                                    date.toLocaleDateString(),
                                                            }).save()

                                                            const embed =
                                                                new EmbedBuilder()
                                                                    .setColor(
                                                                        'Red',
                                                                    )
                                                                    .setTitle(
                                                                        '⭕A Strike Has Been Added To The User⭕',
                                                                    )
                                                                    .setDescription(
                                                                        `**Added A Strike To ${mentionedUser}  \n Reason: ${
                                                                            scheduledRaidsOffenses[
                                                                                matchingIndex
                                                                            ]
                                                                        } \n Comment: ${
                                                                            length[
                                                                                List
                                                                                    .length
                                                                            ]
                                                                        } - https://discord.com/channels/992300928067698759/${
                                                                            thread.id
                                                                        } \n \n Also User Was Added To Blacklist Since It Was Their 4th Warning.**`,
                                                                    )
                                                            channel.send({
                                                                content: `<@${mentionedUserID}> - <@${
                                                                    thread.ownerId
                                                                }> - ${
                                                                    scheduledRaidsOffenses[
                                                                        matchingIndex
                                                                    ]
                                                                } - Date Issued: ${date.toLocaleDateString()}`,
                                                                embeds: [embed],
                                                            })

                                                            let StringData = ' '
                                                            let number = 1
                                                            List.map(
                                                                async (
                                                                    data,
                                                                ) => {
                                                                    StringData =
                                                                        StringData +
                                                                        `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                                                    number += 1
                                                                },
                                                            )
                                                            const dmEmbed =
                                                                new EmbedBuilder()
                                                                    .setColor(
                                                                        'Red',
                                                                    )
                                                                    .setTitle(
                                                                        '⭕You Have Been Issued A Warning On Wal-Mane⭕',
                                                                    )
                                                                    .setDescription(
                                                                        `**This Is Your Warning ${
                                                                            List.length +
                                                                            1
                                                                        }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                                                            List.length +
                                                                            1
                                                                        }-Reason ${
                                                                            scheduledRaidsOffenses[
                                                                                matchingIndex
                                                                            ]
                                                                        } -Comment: ${
                                                                            length[
                                                                                List
                                                                                    .length
                                                                            ]
                                                                        } -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. If You Think Your Warning/Blacklist Has Been Done In Error, Please Visit The [Appeal A Warning](https://discord.com/channels/992300928067698759/1008076784660664410) Channel**`,
                                                                    )
                                                            mentionedUser
                                                                .send({
                                                                    embeds: [
                                                                        dmEmbed,
                                                                    ],
                                                                })
                                                                .then((msg) => {
                                                                    const Embed =
                                                                        new EmbedBuilder()
                                                                            .setTitle(
                                                                                '❌Warning Notification❌',
                                                                            )
                                                                            .setDescription(
                                                                                `Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                                            )
                                                                    Ch_Log.send(
                                                                        {
                                                                            embeds: [
                                                                                Embed,
                                                                            ],
                                                                        },
                                                                    )
                                                                })
                                                                .catch(
                                                                    (err) => {
                                                                        const Embed =
                                                                            new EmbedBuilder()
                                                                                .setTitle(
                                                                                    '❌Warning Notification❌',
                                                                                )
                                                                                .setDescription(
                                                                                    `Couldn't Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                                                )
                                                                        Ch_Log.send(
                                                                            {
                                                                                embeds: [
                                                                                    Embed,
                                                                                ],
                                                                            },
                                                                        )
                                                                    },
                                                                )
                                                        } else {
                                                            const embed =
                                                                new EmbedBuilder()
                                                                    .setColor(
                                                                        'Red',
                                                                    )
                                                                    .setTitle(
                                                                        '⭕A Strike Has Been Added To The User⭕',
                                                                    )
                                                                    .setDescription(
                                                                        `**Added A Strike To ${mentionedUser}  \n Reason: ${
                                                                            scheduledRaidsOffenses[
                                                                                matchingIndex
                                                                            ]
                                                                        } \n Comment: ${
                                                                            length[
                                                                                List
                                                                                    .length
                                                                            ]
                                                                        } - https://discord.com/channels/992300928067698759/${
                                                                            thread.id
                                                                        }**`,
                                                                    )
                                                            channel.send({
                                                                content: `<@${mentionedUserID}> - <@${
                                                                    thread.ownerId
                                                                }> - ${
                                                                    scheduledRaidsOffenses[
                                                                        matchingIndex
                                                                    ]
                                                                } - Date Issued: ${date.toLocaleDateString()}`,
                                                                embeds: [embed],
                                                            })
                                                            let StringData = ' '
                                                            let number = 1
                                                            List.map(
                                                                async (
                                                                    data,
                                                                ) => {
                                                                    StringData =
                                                                        StringData +
                                                                        `${number}-Reason: ${data.reason} -Comment: ${data.comments} -Date: ${data.timestamp} \n `
                                                                    number += 1
                                                                },
                                                            )
                                                            const dmEmbed =
                                                                new EmbedBuilder()
                                                                    .setColor(
                                                                        'Red',
                                                                    )
                                                                    .setTitle(
                                                                        '⭕You Have Been Issued A Warning On Wal-Mane⭕',
                                                                    )
                                                                    .setDescription(
                                                                        `**This Is Your Warning ${
                                                                            List.length +
                                                                            1
                                                                        }. Your Warnings And Their Reasons So Far Are As Listed \n \n  ${StringData} ${
                                                                            List.length +
                                                                            1
                                                                        }-Reason ${
                                                                            scheduledRaidsOffenses[
                                                                                matchingIndex
                                                                            ]
                                                                        } -Comment: ${
                                                                            length[
                                                                                List
                                                                                    .length
                                                                            ]
                                                                        } -Date ${date.toLocaleDateString()} \n \n After 4 Warnings You Will Be Blacklisted, Which Will Heavily Impact Your Likelyhood Of being Rostered In The Future. If You Think Your Warning/Blacklist Has Been Done In Error, Please Visit The [Appeal A Warning](https://discord.com/channels/992300928067698759/1008076784660664410) Channel**`,
                                                                    )
                                                            mentionedUser
                                                                .send({
                                                                    embeds: [
                                                                        dmEmbed,
                                                                    ],
                                                                })
                                                                .then((msg) => {
                                                                    const Embed =
                                                                        new EmbedBuilder()
                                                                            .setTitle(
                                                                                '❌Warning Notification❌',
                                                                            )
                                                                            .setDescription(
                                                                                `Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                                            )
                                                                    Ch_Log.send(
                                                                        {
                                                                            embeds: [
                                                                                Embed,
                                                                            ],
                                                                        },
                                                                    )
                                                                })
                                                                .catch(
                                                                    (err) => {
                                                                        const Embed =
                                                                            new EmbedBuilder()
                                                                                .setTitle(
                                                                                    '❌Warning Notification❌',
                                                                                )
                                                                                .setDescription(
                                                                                    `Couldn't Sent A Message To <@${mentionedUserID}> To Notify Them`,
                                                                                )
                                                                        Ch_Log.send(
                                                                            {
                                                                                embeds: [
                                                                                    Embed,
                                                                                ],
                                                                            },
                                                                        )
                                                                    },
                                                                )
                                                        }
                                                    } else if (
                                                        List.length >= 4
                                                    ) {
                                                        const embed =
                                                            new EmbedBuilder().setColor(
                                                                'Red',
                                                            )
                                                        setTitle(
                                                            '⭕User Detected On Blacklist⭕',
                                                        ),
                                                            setDescription(
                                                                `**${mentionedUser} Has Reached Maximum Warnings And Is On Blacklist , Can't Add Any More Warnings**`,
                                                            )
                                                        thread.send({
                                                            embeds: [embed],
                                                        })
                                                    }

                                                    if (List.length === 0) {
                                                        const Role =
                                                            thread.guild.roles.cache.find(
                                                                (role) =>
                                                                    role.id ===
                                                                    '1036433347280384102',
                                                            )
                                                        const roleToUser =
                                                            thread.guild.members.cache.get(
                                                                `${mentionedUserID}`,
                                                            )

                                                        await roleToUser.roles.add(
                                                            Role.id,
                                                        )
                                                    } else if (
                                                        List.length === 1
                                                    ) {
                                                        const Role =
                                                            thread.guild.roles.cache.find(
                                                                (role) =>
                                                                    role.id ===
                                                                    '1036544658874044436',
                                                            )
                                                        const roleToUser =
                                                            thread.guild.members.cache.get(
                                                                `${mentionedUserID}`,
                                                            )

                                                        await roleToUser.roles.add(
                                                            Role.id,
                                                        )
                                                    }

                                                    const warningEmbed =
                                                        new EmbedBuilder()
                                                            .setColor('#ff0000')
                                                            .setTitle(
                                                                '⚠️ Warning Issued',
                                                            )
                                                            .addFields(
                                                                {
                                                                    name: 'User ID',
                                                                    value: `<@${mentionedUserID}>`,
                                                                },
                                                                {
                                                                    name: 'Reporter',
                                                                    value: `<@${thread.ownerId}>`,
                                                                },
                                                                {
                                                                    name: 'Time',
                                                                    value: `<t:${Math.round(
                                                                        thread.createdTimestamp /
                                                                            1000,
                                                                    )}>`,
                                                                },
                                                                {
                                                                    name: 'Offense',
                                                                    value: `${scheduledRaidsOffenses[matchingIndex]}`,
                                                                }, // Shortened offense text
                                                                {
                                                                    name: 'Action Taken',
                                                                    value: `${
                                                                        length[
                                                                            List
                                                                                .length
                                                                        ]
                                                                    }`,
                                                                }, // Add action taken here
                                                                {
                                                                    name: 'Description',
                                                                    value: `<@${mentionedUserID}> has been warned for ${scheduledRaidsOffenses[matchingIndex]} by <@${thread.ownerId}>`,
                                                                },
                                                            )

                                                    thread.send({
                                                        embeds: [warningEmbed],
                                                    })
                                                }
                                            }
                                        }

                                        collector2.stop()
                                    },
                                )
                            })
                        })
                    }
                }
            }, 20000)
        }
    },
}

function showDropdownOptions(thread) {
    // Create a dropdown menu with options

    // Create a select menu
    const selectMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('offense_dd')
            .setPlaceholder('Select an option')
            .addOptions(
                {
                    label: 'No-show after confirming',
                    value: 'No-show after confirming',
                },
                {
                    label: 'Not bidding on obvious upgrades',
                    value: 'Not bidding on obvious upgrades',
                },
                {
                    label: 'Leaving early without good cause',
                    value: 'Leaving early without good cause',
                },
                {
                    label: 'Confirming and rescinding',
                    value: 'Confirming and rescinding',
                },
            ),
    )

    // Send the select menu to the user
    thread.send({
        content: 'Please select an option:',
        components: [selectMenu],
    })
}
