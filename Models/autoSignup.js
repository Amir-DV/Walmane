const { model, Schema } = require('mongoose')

let autoSignup = new Schema({
    userId: String, // User ID of the participant
    channelId: String, // Targeted channel id
    class: String,
    spec: String,
})

module.exports = model('autoSignup', autoSignup)
