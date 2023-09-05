import type { CommandData } from '@/types.ts';
import { SlashCommandBuilder } from 'discord.js';

export class Command {
	private commandData: CommandData;

	constructor(commandData: CommandData) {
		this.commandData = commandData;
	}

	public get data() {
		return this.commandData.data;
	}

	public get execute() {
		return this.commandData.execute;
	}

	public get disabled() {
		return this.commandData.disabled ?? false;
	}

	public get cooldown() {
		return this.commandData.cooldown ?? 5;
	}

	public build(slashCommandBuilder?: SlashCommandBuilder) {
		return this.commandData.data(slashCommandBuilder ?? new SlashCommandBuilder());
	}
}