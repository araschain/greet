import { Event } from '@/classes/event.ts';
import { setReady } from '@/modules/variables.ts';
import { ActivityType } from 'discord.js';

import db from 'croxydb';

export default new Event({
	category: 'ready',
	once: true,

	async execute(client) {

		db.setReadable(true);
		setReady();
		client.user.setPresence({ activities: [{ name: 'ravegar', state: 'discord.gg/altyapilar', type: ActivityType.Custom }] });
	},
});