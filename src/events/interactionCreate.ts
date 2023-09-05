import { Event } from '@/classes/event.ts';
import config from '@/config.json';
import type { Ravegar } from '@/modules/client.ts';
import { embed, unix } from '@/utils/builder.ts';
import { ApplicationCommandType, Collection } from 'discord.js';

const cooldownedUsers: Collection<string, number> = new Collection();

export default new Event({
	category: 'interactionCreate',

	async execute(interaction) {
		const embedBuilder = () => embed(interaction);

		if (!interaction.guild) return;

		const client = interaction.client as Ravegar;

		if (interaction.isChatInputCommand()) {
			if (interaction.commandType === ApplicationCommandType.ChatInput) {
				const userKey = `${interaction.user.id}${interaction.guild.id}`;
				const cooldownTime = cooldownedUsers.get(userKey);
				const currentDate = parseInt(`${Date.now() / 1000}`);

				if (cooldownTime) {
					const isExpired = cooldownTime <= currentDate;
					const remainingSeconds = cooldownTime - currentDate;
					const nextSeconds = Date.now() + remainingSeconds;
					const remainingTime = unix(nextSeconds);

					if (!isExpired) {
						const finalEmbed = embedBuilder()
							.setTitle('İşlem iptal edildi.')
							.setDescription(`> Uygulama komudunu ${remainingTime} tekrar deneyiniz.`);

						await interaction.reply({ embeds: [finalEmbed], fetchReply: true }); return;
					}
				}

				const command = client.commands.get(interaction.commandName);

				if (command) {
					if (command.disabled && !config.developers.includes(interaction.user.id)) {
						const finalEmbed = embedBuilder()
							.setTitle('İşlem iptal edildi.')
							.setDescription('> Uygulama komudu bir sebepten dolayı kullanıma kapalıdır.');

						await interaction.reply({ embeds: [finalEmbed], fetchReply: true }); return;
					}

					await command.execute(interaction);
					cooldownedUsers.set(userKey, command.cooldown + currentDate);
				}
			}
		}
	},
});