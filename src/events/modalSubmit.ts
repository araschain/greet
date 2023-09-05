import { Event } from '@/classes/event.ts';
import { Welcome } from '@/commands/moderation/login.ts';
import { eventLog } from '@/modules/variables.ts';
import colors from 'ansi-colors';
import axios from 'axios';
import { EmbedBuilder, codeBlock } from 'discord.js';

export default new Event({
	category: 'interactionCreate',

	async execute(interaction) {

		if (interaction.isModalSubmit()) {
			await interaction.deferUpdate();

			const message = interaction.message;
			if (!message || !message.embeds || !message.embeds[0]) return;

			if (interaction.customId === 'welcome_message') {
				try {
					const welcomeData = new Welcome(`${interaction.guildId}.login`);
					const input = interaction.fields.getTextInputValue('input');

					const blackListWords: string[] = (await axios.get('https://raw.githubusercontent.com/ooguz/turkce-kufur-karaliste/master/karaliste.json', { timeout: 5000 })).data;
					let isBadWord = false;

					for (const blackWord of [...blackListWords, '@everyone', '@here', '@']) {
						if (input.includes(blackWord)) {
							isBadWord = true; continue;
						}
					}

					if (isBadWord) {
						const finalEmbed = new EmbedBuilder(message.embeds[0].data)
							.setTitle('İşlem iptal edildi.')
							.setDescription('❌ **|** Düzenlemek istediğiniz ileti içerisinde, `küfür`, `argo` kullanımı veya `hakaret` gibi unsurlar bulunmaktadır. Lütfen bu tür ifadelerden kaçının.')
							.addFields(
								{
									name: 'İptal edilen karşılama mesajı:',
									value: codeBlock('ansi', colors.blue(`${input.replaceAll(/\{(.*?)\}/g, colors.yellow('{$1}'))}`)),
								},
							);

						message.edit({ embeds: [finalEmbed] }).catch(() => undefined); return;
					}

					const finalEmbed = new EmbedBuilder(message.embeds[0].data)
						.setTitle('İşlem başarılı oldu.')
						.addFields(
							{
								name: 'Ayarlanan karşılama mesajı:',
								value: codeBlock('ansi', colors.blue(`${input.replaceAll(/\{(.*?)\}/g, colors.yellow('{$1}'))}`)),
							},
						);

					welcomeData.setMessage(input);
					message.edit({ embeds: [finalEmbed] }).catch(() => undefined); return;
				}
				catch (err) {
					eventLog.warn(`${err}`); return;
				}
			}
		}
	}
});