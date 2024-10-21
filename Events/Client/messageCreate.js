const {
  Events,
  EmbedBuilder,
  Message,
  Client,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const autoSignupModel = require("../../Models/autoSignup"); // Adjust the path as necessary
const rosterinfoModel = require("../../Models/rosterinfoDB");
const axios = require("axios").default;
const { raidhelperAPI } = require("../../config.json");
const panelDB = require("../../Models/panel");

const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const serviceAccountAuth = new JWT({
  // env var values here are copied from service account credentials generated by google
  // see "Authentication" section in docs for more info
  email: "walmanesheet@optimal-tide-371213.iam.gserviceaccount.com",
  key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCizLBQXhGsgJBn\nnvBy1gHNpH1BR6nYTHOK7u8TY6LEJyu9Zjo/QG0Z+eLMnyhp9E9+7UQkyPcev+fO\n7RTkBPvPDuO9Yen5f7mdZkIZdL9ZNzKprMgAYFPYw7Rd2BbBCQ/3uiXaVWItjPnF\n/IEX4RB0i/9yp+kSyIoetbMOWZ3LSi6SdKojp+CJWhfrLRH/osAs469g6IrY+i2z\nX1GhL3v1rdJSw/qBW0XR9ASA0me3Pa9iv84pCkFTwEGQMgJNVvB5HScBWpWQEClh\nsv1591h7usYmvFr0ZT2Xb2qzoSMqx7uaf5vhHeknGnz/91k1qvd1DJQyJVJ4USuQ\n4eNWERQxAgMBAAECggEAELC1PUINpA6or1ToQA+wbuOnmz0UfLpGyLY7ALUA64T8\nCx57R3+Mh+KaZcHF8Anl6gR7bV2El0yToH9mGkPoCHf1cXWjugpmDkzc5zT0xpnd\n+e7+sKovgmw69jmIiKkMD+jPx2jkSDj5JPsAhaETca1mJpwwDRbN8TzN0wFtR9lk\n24tDOkLcqExdUqoY6P5olEKqdchy1YOdaqFBa1Td/mfeEsqV9Q10NZgnOARmvGjG\nQS1BSaoBHceCYILBl86/WsIBKT1Jn1ILkC5bl/Iw1pJcUHqRaHKT0Vidu+DD5jIb\n99Vap8dyG+uoiBIiR7DqR34ru3Wbquw3WhOikgwruQKBgQDQPjL/HWsA/EDWCtMn\nhhSCcF/dPIQVn2Rn4f4+Jm26n/ekhs2o6ARg3UuvVvEBie6mviPquiOa0K4/UX2F\nHxBgbG9lEJ7cRoHwkjZT+M6BdpMAE8WwwrhOaWvOkOJqSvr/M47lAGKZP0sjYxIm\n11Ml5tQyO5/kcfGM8CLK5NooeQKBgQDIIonyLaBuXTzIT+Mhm/HJ0ygxPujsWd+U\nBO8EXACxAxzUiGqOq6ypH/I7rTjAcTIlgIf2bhDe4c4jmiYKyao030WRKTdUqCaV\nztP07eyOnff3HfIv+4YvMrjgE22d+KCc4A2U3zG6CHs/UGP2NT417aDrj988NyNz\nlLsNFLzLeQKBgH+8J3vlh6VrFjo1GaC81gfM9oC2hi7dPrGaJmHpIJXBWh5Jsg1R\nhJ4GIE7Ffb/746/UIiPxWbW1G60rR1tI2rrKyOmtcESd20a96SVJESLIoRMDDdiH\nGJbAg6iJpticdank7ln6CoEGGgjy1EeO/SnalX7apBF08z4Ibs8V4dvBAoGBAL6w\niheCedYuaHfEBnpDiAHxe95QPsbUaz8x5DuXHeGLQbEPudfuozkSA0/xIJ3cPReW\ne/XFsbVsGWm6unyU4eQ2yKYjS2ESRpF+3F4HRNoukdGXaudlFNlrztNSL6PQ/df7\nc3VhpJPI+QW+p0A0Qu5HWIiaMO3C67h5AjDYjXqhAoGBAM+f0HmqSP9ZjY5izzsE\nrt3YQ5QBKCFsOt21blOY9P0oJRJMObWytsL24u5Ytrtiy9GARCIJUj69D3Sva5rL\n7vGj+onGQZJgacNZGvQhc03T/XgdF1ivt5X7FV5VtM4CvggfWlLN0OANiOXEnRM3\nglQgUiOPvN2D0vE6YcRg04Bq\n-----END PRIVATE KEY-----\n",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const doc = new GoogleSpreadsheet(
  "1Y48exFu2csCHsNyLHyxL6blKNLaulhMvuP57U69PQNQ",
  serviceAccountAuth
);

module.exports = {
  name: Events.MessageCreate,
  once: false,

  /**
   *
   * @param {Message} message
   * @param {Client} client
   * @returns
   */
  async execute(message, client) {
    const paneldbDATA = await panelDB.find({
      guildID: message.guild.id,
    });
    const nestedstickyChannelIds = paneldbDATA.map((data) => {
      return data.stickyChannelIds;
    });

    if (nestedstickyChannelIds.length !== 0) {
      const stickyChannelIds = nestedstickyChannelIds.flat();
      if (stickyChannelIds.includes(message.channel.id)) {
        if (message.author.bot) return;
        const fetchedMessages = await message.channel.messages.fetch();
        const stickyMessage = fetchedMessages.find(
          (m) => m.author.id === client.user.id
        );

        const organizerID = stickyMessage.embeds[0].footer.text;
        await doc.loadInfo();
        const featuredSheet = doc.sheetsById[1883244075];
        await featuredSheet.loadCells("A1:M30");
        const Columns = [
          "B",
          "C",
          "D",
          "E",
          "F",
          "G",
          "H",
          "I",
          "J",
          "K",
          "L",
          "M",
        ];

        let columnNum;
        let orgID;
        for (let i = 0; i < 12; i++) {
          const organizerData = featuredSheet.getCellByA1(
            `${Columns[i]}2`
          ).value;
          const organizerdataSplit = organizerData.split("-");
          orgID = organizerdataSplit[1];
          columnNum = i;

          if (orgID === organizerID) break;
        }
        const embedPanel = new EmbedBuilder()
          .setTitle(
            `${featuredSheet.getCellByA1(`${Columns[columnNum]}3`).value}`
          )
          .setDescription(
            `${featuredSheet.getCellByA1(`${Columns[columnNum]}4`).value}`
          )
          .setFooter({ text: `${organizerID}` });

        let Row = new ActionRowBuilder();
        let c = 1;
        for (let e = 6; e <= 13; ) {
          const buttonName = featuredSheet.getCellByA1(
            `${Columns[columnNum]}${e}`
          ).value;
          e++;
          const buttonData = featuredSheet.getCellByA1(
            `${Columns[columnNum]}${e}`
          ).value;

          if (buttonName && buttonData) {
            Row.addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `${buttonName
                    .replace(/\s+/g, "")
                    .toLowerCase()}_${orgID}_${c}`
                )
                .setLabel(`${buttonName}`)
                .setStyle(ButtonStyle.Primary)
            );
          }
          c++;
          e++;
        }

        if (stickyMessage) {
          stickyMessage
            .delete()
            .then(() => {
              message.channel.send({ embeds: [embedPanel], components: [Row] });
            })
            .catch(() => {});
        } else {
          // Force send a new message.
          message.channel.send({ embeds: [embedPanel], components: [Row] });
        }
      }
    }

    if (
      message.author.bot &&
      message.author.id === "579155972115660803" &&
      message.embeds[0]
    ) {
      const Embed = message.embeds[0];
      if (!Embed.footer) {
        const autoSignupEntries = await autoSignupModel.find({
          channelId: message.channel.id,
        });

        if (autoSignupEntries.length > 0) {
          const Url = `https://raid-helper.dev/api/v2/events/${message.id}/signups`;

          autoSignupEntries.forEach((entry, index) => {
            setTimeout(async () => {
              await axios.post(
                Url,
                {
                  userId: entry.userId,
                  className: entry.class,
                  specName: entry.spec,
                  notify: true,
                  reason: "Automated Signup",
                  isFake: false,
                },
                {
                  headers: {
                    Authorization: raidhelperAPI,
                    "Content-Type": "application/json; charset=utf-8",
                  },
                }
              );
            }, index * 5000); // Increment the delay for each iteration
          });
        }
      } else if (
        message.embeds[0] &&
        message.embeds[0].footer &&
        message.embeds[0].footer.text.includes(
          "Click the buttons below to confirm or cancel your attendance."
        )
      ) {
        // const Mentioned = message.mentions.users
        // const guild = message.guild
        // const roleIds = [
        //     '1040522391337578496',
        //     '1040524241499586620',
        //     '1040523872103051304',
        //     '1040524071047274536',
        //     '1040524630823284766',
        // ] // Replace with the role IDs you want to check
        // for (const user of Mentioned.values()) {
        //     const member = await guild.members.fetch(user.id)
        //     const roles = member.roles.cache
        //     const hasRole = roleIds.some((roleId) => roles.has(roleId))
        //     if (hasRole) {
        //         const orgID = message.embeds[0].fields[
        //             message.embeds[0].length - 1
        //         ].value.substring(
        //             data.indexOf('@') + 1,
        //             data.lastIndexOf('>'),
        //         )
        //         const rosterInfo = new rosterinfoModel({
        //             userId: user.id,
        //             date: new Date(), // Example: current date
        //             time: '12:00 PM', // Example: specific time
        //             organizer: orgID, // Example: organizer's name
        //             roles: '',
        //             details: 'Additional details about the raid',
        //             eventLink:
        //                 'Link to the corresponding event on Discord',
        //         })
        //         await rosterInfo.save()
        //     }
        // }
      }
    }

    if (message.channel.id === "1009579259309871134") {
      const Embed = message.embeds[0];
      if (
        Embed &&
        Embed.title &&
        Embed.title === "Notification received!" &&
        !Embed.description.includes(":Absence:")
      ) {
        const reasonIndex = Embed.description.indexOf("reason:");
        const reason = Embed.description
          .substring(reasonIndex + "reason:".length)
          .trim();

        const EmbedField = Embed.fields[0].value;
        const urlRegex = /\bhttps?:\/\/[^\s)]+/gi;
        const urls = Embed.description.match(urlRegex);
        const url = urls[0];
        const RosterID = url.split("/");
        const ID = RosterID[RosterID.length - 1];
        const CHID = RosterID[RosterID.length - 2];

        const Ch_Log = message.guild.channels.cache.get("1202976505542615140");
        await message.guild.channels.fetch(CHID).then((channel) => {
          channel.messages
            .fetch({
              around: `${ID}`,
              limit: 1,
            })
            .then(async (Msg) => {
              const fetchedMsg = Msg.first();
              const RosterEmbed = fetchedMsg.embeds[0];

              const userID = EmbedField.substring(
                EmbedField.indexOf("@") + 1,
                EmbedField.lastIndexOf(">")
              );
              let RL = RosterEmbed.fields[RosterEmbed.fields.length - 1].value;
              RL = RL.substring(RL.indexOf("@") + 1, RL.lastIndexOf(">"));
              client.users.fetch(`${RL}`).then((user) => {
                const NewEmbed = new EmbedBuilder()
                  .setTitle("⚠️Cancel Notification⚠️")
                  .setDescription(
                    `<@${userID}> has canceled on your [roster](${url}) for the following reasons: \n\n\n**${reason}**`
                  )
                  .setColor("NotQuiteBlack");
                user
                  .send({ embeds: [NewEmbed] })
                  .then((msg) => {
                    const Embed = new EmbedBuilder()
                      .setTitle("⚠️Cancel Notification Log⚠️")
                      .setDescription(
                        `Sent A Message To <@${RL}> To Notify Them`
                      );
                    Ch_Log.send({
                      embeds: [Embed],
                    });
                  })
                  .catch((err) => {
                    const Embed = new EmbedBuilder()
                      .setTitle("⚠️Cancel Notification Log⚠️")
                      .setDescription(
                        `Couldn't Sent A Message To <@${RL}> To Notify Them`
                      );
                    Ch_Log.send({
                      embeds: [Embed],
                    });
                  });
              });
            });
        });
      }
    } else {
      if (!message.author.bot) {
        if (
          message.mentions.everyone === true ||
          message.content.includes("<@&996462693680676895>") ||
          message.content.includes("<@&996462733132316853>") ||
          message.content.includes("<@&996462794201370775>") ||
          message.content.includes("<@&996462845191524382>") ||
          message.content.includes("<@&996462899935592619>") ||
          message.content.includes("<@&996462947255730256>") ||
          message.content.includes("<@&996462956739039372>")
        ) {
          if (message.member.roles.cache.has("996424602186174504")) return;
          else {
            const LogChannel = message.guild.channels.cache.get(
              "1013814233340850297"
            );
            const embed = new EmbedBuilder();
            embed.setTitle("❌You Crossed The Rules");
            embed.setDescription(
              "You Pinged A **Day Role** Or **EVERYONE/HERE** In Wal-Mane Server. \n As It Is Already Told , Dont Use This Ping Anymore \n Please Check [Pinging Rules](https://discord.com/channels/992300928067698759/1000774459092906054) In [Wal-Mane](https://discord.gg/walmane) Discord."
            );
            message.author
              .send({ embeds: [embed] })
              .then((msg) => {
                const Embed = new EmbedBuilder()
                  .setTitle("⚠️Improper Pings Notification Log⚠️")
                  .setDescription(
                    `Issue : Using **DAY/EVERYONE/HERE** Ping \n User : <@${message.author.id}> \n Channel : <#${message.channel.id}> \n Message Link : [Message](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`
                  );
                Ch_Log.send({
                  embeds: [Embed],
                });
              })
              .catch((err) => {});
          }
        } else if (message.channel.id === "1036666803549638787") {
          const OldNickname =
            message.member.nickname || message.member.displayName;
          const regexExp =
            /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;

          if (message.content.length >= 1 && message.content.length <= 32) {
            if (regexExp.test(message.content)) {
              message.reply(
                `Your Selected Nickname Contains An Emoji Which We Do Not Accept`
              );
            } else {
              message.member.setNickname(message.content);
              message.reply(
                `Your Nickname Has Been Changed From **"${OldNickname}"** To **"${message.content}"** `
              );
            }
          } else {
            message.reply(
              `Your Selected Nickname Should Be Within 1 > 32 Characters Long`
            );
          }
        }
      }
    }
  },
};