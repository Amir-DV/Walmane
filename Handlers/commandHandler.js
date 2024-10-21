function loadCommands(client) {
	const ascii = require('ascii-table');
	const fs = require('fs');
	const table = new ascii().setHeading('Commands', 'Status');

	let commandsArray = [];
	const commandFolder = fs.readdirSync('./Commands');
	for (const folder of commandFolder) {
		const commandFiles = fs
			.readdirSync(`./Commands/${folder}`)
			.filter((file) => file.endsWith('.js'));

		for (const file of commandFiles) {
			const commandFile = require(`../Commands/${folder}/${file}`);
			delete require.cache[require.resolve(`../Commands/${folder}/${file}`)];
			client.commands.delete(commandFile.data.name);
			client.commands.set(commandFile.data.name, commandFile);

			commandsArray.push(commandFile.data.toJSON());
			table.addRow(file, 'Loaded✅');
			continue;
		}
	}
	client.application.commands.set(commandsArray);
	return console.log(table.toString(), '\nLoaded Commands');
}

module.exports = { loadCommands };
