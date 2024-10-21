const { model, Schema } = require('mongoose');

let blacklistSchema = new Schema({
	userId: String,
	guildId: String,
	reason: String,
	comments: String,
	timestamp: String,
});
module.exports = model('Blacklist', blacklistSchema);
