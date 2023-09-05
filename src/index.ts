import { Ravegar } from '@/modules/client.ts';
import { GatewayIntentBits, Partials } from 'discord.js';

const client = new Ravegar({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildModeration,
	],
	failIfNotExists: true,
	partials: [
		Partials.Channel,
		Partials.Message,
		Partials.User,
	],
	rest: {
		offset: 0,
	},
	ws: {
		large_threshold: 250,
	},
});

client.MainAsync();