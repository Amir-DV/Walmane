const { EmbedBuilder } = require('discord.js')

async function errorHandler(client) {
    const guild = await client.guilds.fetch('992300928067698759')
    const channel = await guild.channels.fetch('1042083293065121882')

    process.on('unhandledRejection', async (reason, p) => {
        const errorMessage =
            reason instanceof Error ? reason.stack : reason.toString()

        const errEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('💀 New Error [ Unhandled Rejection/Catch ]')
            .setTimestamp()
            .setFooter({ text: 'Anti-Crash System' })
            .setDescription(
                `An Error Just Occurred In The Bot Console!! \n\n**ERROR:**\n\n\`\`\`${errorMessage}\`\`\``,
            )

        channel.send({ embeds: [errEmbed] })
    })

    process.on('uncaughtException', (error) => {
        const errorMessage =
            error instanceof Error ? error.stack : error.toString()

        const errEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('💀 New Error [ Uncaught Exception/Catch ]')
            .setTimestamp()
            .setFooter({ text: 'Anti-Crash System' })
            .setDescription(
                `An Error Just Occurred In The Bot Console!! \n\n**ERROR:**\n\n\`\`\`${errorMessage}\`\`\``,
            )

        channel.send({ embeds: [errEmbed] })
    })

    process.on('uncaughtExceptionMonitor', (error) => {
        const errorMessage =
            error instanceof Error ? error.stack : error.toString()

        const errEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('💀 New Error [ Uncaught Exception/Catch (MONITOR) ]')
            .setTimestamp()
            .setFooter({ text: 'Anti-Crash System' })
            .setDescription(
                `An Error Just Occurred In The Bot Console!! \n\n**ERROR:**\n\n\`\`\`${errorMessage}\`\`\``,
            )

        channel.send({ embeds: [errEmbed] })
    })
}

module.exports = { errorHandler }
