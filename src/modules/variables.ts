import { Logger } from '@/classes/logger.ts';
import config from '@/config.json';
import { Locale, REST } from 'discord.js';

export const rest = new REST({ version: '10' }).setToken(config.discord.token);

export const clientLog = new Logger('Client');
export const commandLog = new Logger('Command');
export const eventLog = new Logger('Event');

export const commadsDir = './src/commands';
export const eventsDir = './src/events';

export let isReady = false;

export function setReady() {
	return isReady = true;
}

export const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$/ig;
export const urlPhotoRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*\.(?:png|jpg|jpeg|webp))(?:\?[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)?$/ig;
export const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/ig;

export const defaultLanguage = Locale.Turkish;