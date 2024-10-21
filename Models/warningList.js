const { model, Schema } = require('mongoose');

let warningSchema = new Schema({
	userId: String,
	guildId: String,
	moderatorId: String,
	reason: String,
	comments: String,
	timestamp: String,
});
module.exports = model('WarningList', warningSchema);
