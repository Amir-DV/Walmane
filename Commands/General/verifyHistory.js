const {
  SlashCommandBuilder,
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  ComponentType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify_log")
    .setDescription("Get your latest verification form of each spec/class")
    .setDMPermission(false),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */

  async execute(interaction, client) {
    await interaction.deferReply({
      ephemeral: true,
    });
    await interaction.editReply({
      content: "This process takes a while , please be patient :)",
    });
    const verificationChannel = interaction.guild.channels.cache.get(
      "1234801796371972137"
    );
    let messages = new Map();
    let lastMessageId = null;

    do {
      // Fetch messages, starting from the last message ID fetched (or null for the first request)
      const options = { limit: 100, before: lastMessageId };
      const fetchedMessages = await verificationChannel.messages.fetch(options);

      // Add fetched messages to the map
      fetchedMessages.forEach((message) => {
        messages.set(message.id, message);
      });

      // Set the ID of the last fetched message for the next iteration
      lastMessageId = fetchedMessages.lastKey();
    } while (lastMessageId);

    const userMentionedMessages = new Map(
      [...messages].filter(
        ([id, message]) =>
          message.mentions.users.has(interaction.user.id) &&
          message.embeds.length > 0
      )
    );

    if (userMentionedMessages.size > 0) {
      // Here you can process the messages as needed
      // For example, you can log them, reply with them, etc.
      // Array to store unique embeds based on Class and Spec

      const uniqueEmbeds = [];
      userMentionedMessages.forEach((message) => {
        // Iterate over each embed in the message
        message.embeds.forEach((embed) => {
          // Access and log the full data of the embed
          const classValue = embed.fields.find(
            (field) => field.name === ":shield: Class"
          ).value;
          const specValue = embed.fields.find(
            (field) => field.name === ":fire: Spec"
          ).value;

          // Check if the combination of Class and Spec already exists in uniqueEmbeds
          const existingEmbedIndex = uniqueEmbeds.findIndex(
            (item) => item.class === classValue && item.spec === specValue
          );
          if (existingEmbedIndex === -1) {
            // If the combination doesn't exist, add the embed to uniqueEmbeds
            uniqueEmbeds.push({
              class: classValue,
              spec: specValue,
              embed: embed,
              timestamp: message.createdTimestamp, // Store the timestamp of the message
            });
          } else {
            // If the combination already exists, compare the timestamps and keep the most recent one

            if (
              message.createdTimestamp >
              uniqueEmbeds[existingEmbedIndex].timestamp
            ) {
              uniqueEmbeds[existingEmbedIndex] = {
                class: classValue,
                spec: specValue,
                embed: embed,
                timestamp: message.createdTimestamp,
              };
            }
          }
        });
      });

      uniqueEmbeds.sort((a, b) => b.timestamp - a.timestamp);

      if (uniqueEmbeds.length > 1) {
        const dropdownOptions = uniqueEmbeds.map((embed, index) => ({
          label: `${embed.class} - ${embed.spec}`,
          value: index.toString(), // Use the index as the value
        }));

        // Create the dropdown menu
        const dropdownMenu = new StringSelectMenuBuilder()
          .setCustomId("select_embed")
          .setPlaceholder("Select another class/spec")
          .addOptions(dropdownOptions);

        // Create an action row with the dropdown menu
        const actionRow = new ActionRowBuilder().addComponents(dropdownMenu);

        // Reply to the user with the dropdown menu
        await interaction.followUp({
          content: "Select an embed:",
          components: [actionRow],
          ephemeral: true,
        });

        const collector = interaction.channel.createMessageComponentCollector({
          componentType: ComponentType.StringSelect,
          max: uniqueEmbeds.length,
        });
        collector.on("collect", async (interaction) => {
          if (interaction.customId !== "select_embed") return;

          try {
            const index = parseInt(interaction.values[0]);
            const selectedEmbed = uniqueEmbeds[index];

            await interaction.reply({
              embeds: [selectedEmbed.embed],
              ephemeral: true,
            });
          } catch (error) {
            console.error("Error processing interaction:", error);
            collector.stop();
          }
        });

        collector.on("end", async (collected, reason) => {
          if (reason === "limit") {
            await interaction.followUp({
              content: `Maximum amount of interactions passed. \nAmount : ${uniqueEmbeds.length} \nIf you wanna see your verifications , execute the command again`,
              ephemeral: true,
            });
          }
        });
      } else if (uniqueEmbeds.length === 1) {
        // If there's only one unique embed, send it directly
        await interaction.followUp({
          embeds: [uniqueEmbeds[0].embed],
          ephemeral: true,
        });
      }
    } else {
      // If no messages mentioning the user are found, reply with an embed
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("No Messages Found")
        .setDescription(
          "No messages were found mentioning you in the specified channel."
        );

      interaction.followUp({ embeds: [embed], ephemeral: true });
    }
  },
};
