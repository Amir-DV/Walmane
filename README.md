# Walmane 🎮✨

Full community management for Walmane Discord, a community related to the World of Warcraft game, helping the daily operation of the Discord server run smoothly.

![MongoDB](https://img.icons8.com/color/48/000000/mongodb.png) ![JavaScript](https://img.icons8.com/color/48/000000/javascript.png) ![Discord](https://img.icons8.com/color/48/000000/discord.png)

## Features

### 1. Warning / Blacklist Function ⚠️
This function has two types: manual and automated.

- **Manual:** If an organizer reports someone for breaking a rule, admins can add a warning.
- **Automated:** When an organizer creates a Discord forum post in a specific forum and mentions the reported user with the reason, the bot automatically issues a warning. If the user isn’t mentioned, the bot will ask for a mention. If the bot can't determine the reason for the report, it will ask the leader for clarification, allowing them to categorize the reason. This learning mechanism enhances the bot's responses for future instances.

Additionally, if a user receives three warnings, they will be automatically banned from the server.

![Warning / Blacklist Function](placeholder.gif)

### 2. Channel Creation System 📅
Organizers require separate channels for each raid. Traditionally, they need to manually request channel creation from Discord server admins. With this system, organizers can click a button to initiate a process where the bot requests the necessary information for channel creation. Once submitted, admins receive the request in a designated channel and can confirm or deny it, streamlining the channel creation process.

![Channel Creation System](placeholder.gif)

### 3. Follow System 🔔
Each channel is gate-locked with specific roles, such as different raid types or days. For example, if a user selects the "Tuesday Raid" role, they will only see raids scheduled for that day. Additionally, users can follow their favorite organizers without needing other roles. When they follow an organizer, they receive a special role that allows access to any channels created by that organizer.

![Follow System](placeholder.gif)

### 4. Rating Setup ⭐
Users often want to provide anonymous feedback about specific organizers. With the rating system, users can click a button to rate an organizer and provide feedback, whether positive or negative. The submission is sent to a channel visible only to admins, who can confirm or deny the rating. Organizers can see the feedback but cannot identify the sender.

![Rating Setup](placeholder.gif)

### 5. Verification System ✅
Users are required to verify their class/spec by answering a series of questions. The verification requests are sent to a channel accessible by admins and organizers, but not the user. There is also a command that users can use to view their latest verification submissions for each of their classes/specs.

![Verification System](placeholder.gif)

### 6. Auto Signup Command ⚡
Normally, users must click a button or react to sign up for events posted by organizers. However, with the Auto Signup command, users can set a specific class/spec tied to a channel. Whenever a new signup is posted in that channel, users are automatically signed up with the class/spec they set earlier.

![Auto Signup Command](placeholder.gif)

### 7. Notify System 📩
When an organizer creates a roster from the signed-up users, the following occurs:
1. All users on the roster receive a DM notification confirming their slot in the raid.
2. If there is a warned user in the roster, the organizer is notified via DM, with the reasons for the warning included.

![Notify System](placeholder.gif)

### 8. Scheduled Message System ⏰
This function connects to a Google Spreadsheet, allowing organizers to schedule messages. Messages and their scheduled times are stored in the spreadsheet, and the bot sends those messages to a designated channel at the specified times.

## Note
All features are integrated with MongoDB, which serves as the database for storing warnings and other essential data.

## Contact Me
Feel free to reach out on Discord: [Iviolet](https://discordapp.com/users/856956452740792320) 💬
