const { model, Schema } = require('mongoose')

let rosteredRaidSchema = new Schema({
    userId: String, // User ID of the participant
    date: Date, // Date of the raid
    time: String, // Time of the raid
    organizer: String, // Organizer of the raid
    roles: [String], // Array of roles assigned to the participant (e.g., Tank, Healer, DPS)
    details: String, // Additional details about the raid
    eventLink: String, // Link to the corresponding event on Discord
})

module.exports = model('RosteredRaid', rosteredRaidSchema)
