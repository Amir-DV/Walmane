const { model, Schema } = require('mongoose')

let communityRules = new Schema({
    guildID: String,
    communityRules: [
        {
            text: String,
            label: String,
        },
    ],
})
module.exports = model('Community', communityRules)
