const {
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    StringSelectMenuInteraction,
} = require('discord.js')

let selectedUserFinals = {} // Use an object to store selectedUserFinal for each interaction

module.exports = {
    name: Events.InteractionCreate,
    /**
     *
     * @param {StringSelectMenuInteraction} interaction
     * @returns
     */
    async execute(interaction, client) {
        if (!interaction.isStringSelectMenu()) return
        if (!['spec_select'].includes(interaction.customId)) return

        const specName = interaction.values[0] // Get the selected class name
        const className =
            interaction.message.components[0].components[0].placeholder

        const ClassSpecRoles = {
            'Death Knight': [
                {
                    spec: 'Blood',
                    role: '1117116433575460884',
                    emoji: '<:DeathKnight:1138946141933805609>',
                },
                {
                    spec: 'Frost',
                    role: '1117069240147648522',
                    emoji: '<:DeathKnight:1138946141933805609>',
                },
                {
                    spec: 'Unholy',
                    role: '1117068593708937387',
                    emoji: '<:DeathKnight:1138946141933805609>',
                },
            ],
            Druid: [
                {
                    spec: 'Balance',
                    role: '1117069905951473684',
                    emoji: '<:Druid:996464966062309377>',
                },
                {
                    spec: 'Feral',
                    role: '1117069854017597550',
                    emoji: '<:Druid:996464966062309377>',
                },
                {
                    spec: 'Guardian',
                    role: '1118445924608389210',
                    emoji: '<:Druid:996464966062309377>',
                },
                {
                    spec: 'Restoration',
                    role: '1117069929162756108',
                    emoji: '<:Druid:996464966062309377>',
                },
            ],
            Hunter: [
                {
                    spec: 'Beast Mastery',
                    role: '1118446764547129364',
                    emoji: '<:hunter:996464967941357588>',
                },
                {
                    spec: 'Marksmanship',
                    role: '1117069968761176165',
                    emoji: '<:hunter:996464967941357588>',
                },
                {
                    spec: 'Survival',
                    role: '1117070009290731531',
                    emoji: '<:hunter:996464967941357588>',
                },
            ],
            Mage: [
                {
                    spec: 'Arcane',
                    role: '1117070030044155904',
                    emoji: '<:mages:996464546527055922>',
                },
                {
                    spec: 'Fire',
                    role: '1117070067692212224',
                    emoji: '<:mages:996464546527055922>',
                },
                {
                    spec: 'Frost',
                    role: '1130980285656342629',
                    emoji: '<:mages:996464546527055922>',
                },
            ],
            Paladin: [
                {
                    spec: 'Holy',
                    role: '1117070082124828702',
                    emoji: '<:paladin:996464545201651712>',
                },
                {
                    spec: 'Protection',
                    role: '1117070167227252756',
                    emoji: '<:paladin:996464545201651712>',
                },
                {
                    spec: 'Retribution',
                    role: '1117070111292010507',
                    emoji: '<:paladin:996464545201651712>',
                },
            ],
            Priest: [
                {
                    spec: 'Discipline',
                    role: '1117070212127272991',
                    emoji: '<:priest:996464544094367754>',
                },
                {
                    spec: 'Holy',
                    role: '1130557635641483435',
                    emoji: '<:priest:996464544094367754>',
                },
                {
                    spec: 'Shadow',
                    role: '1117070298022432768',
                    emoji: '<:priest:996464544094367754>',
                },
            ],
            Rogue: [
                {
                    spec: 'Assassination',
                    role: '1117070320306769960',
                    emoji: '<:rogue:996464543079342120>',
                },
                {
                    spec: 'Outlaw',
                    role: '1117070429610319902',
                    emoji: '<:rogue:996464543079342120>',
                },
                {
                    spec: 'Subtlety',
                    role: '1130974872600854649',
                    emoji: '<:rogue:996464543079342120>',
                },
            ],
            Shaman: [
                {
                    spec: 'Elemental',
                    role: '1117070519871746048',
                    emoji: '<:shaman:996464540885717002>',
                },
                {
                    spec: 'Enhancement',
                    role: '1117070491128184832',
                    emoji: '<:shaman:996464540885717002>',
                },
                {
                    spec: 'Restoration',
                    role: '1117070449352904764',
                    emoji: '<:shaman:996464540885717002>',
                },
            ],
            Warlock: [
                {
                    spec: 'Affliction',
                    role: '1117070551459057824',
                    emoji: '<:warlock:996464539841331250>',
                },
                {
                    spec: 'Demonology',
                    role: '1117070586829602877',
                    emoji: '<:warlock:996464539841331250>',
                },
                {
                    spec: 'Destruction',
                    role: '1159537871628275793',
                    emoji: '<:warlock:996464539841331250>',
                },
            ],
            Warrior: [
                {
                    spec: 'Arms',
                    role: '1118446410354933840',
                    emoji: '<:warrior:996464538746626188>',
                },
                {
                    spec: 'Fury',
                    role: '1117070643096203324',
                    emoji: '<:warrior:996464538746626188>',
                },
                {
                    spec: 'Protection',
                    role: '1117070678995259473',
                    emoji: '<:warrior:996464538746626188>',
                },
            ],
        }

        const classData = ClassSpecRoles[className]
        const specData = classData.find((spec) => spec.spec === specName)
        const roleID = specData.role
        const emoji = specData.emoji
        selectedUserFinals[
            interaction.user.id
        ] = `${className}=${specData.spec}=${roleID}=${emoji}` // Store selectedUserFinal using user id as key

        // console.log(
        //     `You Chose ${className}${specData.spec} -- ${roleID} -- ${emoji}`,
        // )

        const modal = new ModalBuilder()
            .setCustomId('verification-modal')
            .setTitle(`Verification Form`)

        const characterName = new TextInputBuilder()
            .setCustomId('characterName')
            .setLabel('Character Name')
            .setPlaceholder('Your character name')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)

        const characterLogs = new TextInputBuilder()
            .setCustomId('characterLogs')
            .setLabel('Character Logs')
            .setPlaceholder('Your Character Logs')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)

        const characterBudget = new TextInputBuilder()
            .setCustomId('characterBudget')
            .setLabel('Character Budget')
            .setPlaceholder('Your Character Budget ')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)

        const Interest = new TextInputBuilder()
            .setCustomId('interest')
            .setLabel('Interest')
            .setPlaceholder('Items you are interested in')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)

        const First = new ActionRowBuilder().addComponents(characterName)
        const Second = new ActionRowBuilder().addComponents(characterLogs)
        const Third = new ActionRowBuilder().addComponents(characterBudget)
        const Fourth = new ActionRowBuilder().addComponents(Interest)

        modal.addComponents(First, Second, Third, Fourth)
        await interaction.showModal(modal)
    },
}

module.exports.getSelectedUserFinals = () => selectedUserFinals // Export the selectedUserFinals object
