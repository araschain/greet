import type { Replace, ReplacerValue } from '@/types.ts';
import { ActionRowBuilder, ButtonBuilder, Colors, EmbedBuilder, time, type Interaction, type TimestampStylesString } from 'discord.js';

export function embed(interaction: Interaction) {
	return new EmbedBuilder()
		.setColor(Colors.DarkButNotBlack)
		.setAuthor({ name: `${interaction.user.displayName} (@${interaction.user.username})`, iconURL: interaction.user.displayAvatarURL() })
		.setTimestamp()
		.setFooter({ text: `${interaction.client.user.username} ©️ 2023`, iconURL: interaction.client.user.displayAvatarURL() });
}

export function unix(date: number, style?: TimestampStylesString) {
	const unixTimestamp = parseInt(`${date / 1000}`);

	return time(unixTimestamp, style ?? 'R');
}

export const trim = (str: string, max: number) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);

export function replace<Format extends string, Values extends ReplacerValue[]>(
	format: Format,
	values: [...Values],
): Replace<Format, Values> {
	return format.replace(/\{(\d+)\}/g, (_, index: number) => {
		const data = values[index] as ReplacerValue | undefined;
		return data !== undefined ? `${data}` : `{${index}}`;
	}) as Replace<Format, Values>;
}

export function disabledButtons(component: ActionRowBuilder<ButtonBuilder>) {
	component.components.forEach((button) => button.setDisabled(true));

	return component;
}