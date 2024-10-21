const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
} = require('discord.js')

const { Guilds, GuildMembers, GuildMessages, MessageContent } =
    GatewayIntentBits
const { User, Message, GuildMember, ThreadMember, Channel } = Partials

const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages, MessageContent],
    Partials: [User, Message, GuildMember, ThreadMember, Channel],
})

const { loadEvents } = require('./Handlers/eventHandler')
const { loadCommands } = require('./Handlers/commandHandler')
const { errorHandler } = require('./Handlers/errorHandler')

client.commands = new Collection()
client.config = require('./config.json')

client.setMaxListeners(20) // or any other number greater than the current number of listeners

client.login(client.config.token).then(() => {
    loadEvents(client)
    loadCommands(client)
    errorHandler(client)
})
