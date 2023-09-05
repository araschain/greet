import { clientLog, commadsDir, commandLog, eventLog, eventsDir, rest } from '@/modules/variables.ts';
import { Client, Collection, Routes } from 'discord.js';

import type { Command } from '@/classes/command.ts';
import type { Event } from '@/classes/event.ts';
import messages from '@/config/messages.json';
import type { CommandImport, EventImport } from '@/types.ts';

import config from '@/config.json';
import { replace } from '@/utils/builder.ts';
import { readdir } from 'fs/promises';

export class Ravegar extends Client {
	public commands: Collection<string, Command> = new Collection();
	public events: Collection<string, Event[]> = new Collection();

	public async MainAsync() {
		try {
			await this.reloadEvents();
			await this.reloadCommands();

			await this.login(config.discord.token);

			clientLog.info('Bot has successfully logged into Discord.');
		}
		catch (err) {
			clientLog.info('Bot could not log into Discord for some reason.', err);
		}
	}

	public async reloadCommands() {
		const fileInputs = await readdir(commadsDir, { withFileTypes: true });
		const commandFolders = fileInputs.filter((input) => input.isDirectory());

		if (!fileInputs.length || !commandFolders.length) return commandLog.warn(messages.noFile);

		for (const folder of commandFolders) {
			const folderDir = await readdir(`${commadsDir}/${folder.name}`, { withFileTypes: true });
			const tsFiles = folderDir.filter((input) => input.name.endsWith('.ts') && !input.name.endsWith('.d.ts') && input.isFile());

			if (!folderDir.length) return commandLog.warn(messages.noFile);
			if (!tsFiles.length) return commandLog.warn(messages.noFile);

			for (const file of tsFiles) {
				const commandFile: CommandImport = await import(`../commands/${folder.name}/${file.name}`);

				if (!('default' in commandFile)) return commandLog.warn(messages.notClass);

				const { default: command } = commandFile;

				this.commands.set(command.build().name, command);
				commandLog.info(replace(messages.commands.loading, [folder.name, file.name]));
			}
		}

		const commands = this.commands.toJSON().map((command) => command.build());

		await rest.put(Routes.applicationCommands(config.discord.id), {
			body: commands,
		});
	}

	public async reloadEvents() {
		const fileInputs = await readdir(eventsDir, { withFileTypes: true });
		const eventFiles = fileInputs.filter((input) => input.isFile());

		if (!fileInputs.length || !eventFiles.length) return commandLog.warn(messages.noFile);

		const tsFiles = eventFiles.filter((input) => input.name.endsWith('.ts') && !input.name.endsWith('.d.ts'));

		if (!tsFiles.length) return commandLog.warn(messages.noFile);

		for (const file of tsFiles) {
			const eventFile: EventImport = await import(`../events/${file.name}`);

			if (!('default' in eventFile)) return commandLog.warn(messages.notClass);

			const { default: event } = eventFile;
			const category = this.events.get(event.category) ?? [];

			this.events.set(event.category, [ ...category, event ]);
			eventLog.info(replace(messages.events.loading, [file.name, event.category]));
		}

		this.events.reduce<Event[]>((total, category) => [...total, ...category], []).map(event => {
			if (event.disabled) return;

			this[event.once ? 'once' : 'on'](event.category, (...args) => {
				event.execute(...args);
			});

		});

	}
}