const { model, Schema } = require("mongoose");

let organizerPanel = new Schema({
  guildID: String,
  stickyChannelIds: [String],
});

module.exports = model("organizerPanel", organizerPanel);
