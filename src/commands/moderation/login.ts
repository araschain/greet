import { Command } from '@/classes/command.ts';
import { disabledButtons, embed, replace, unix } from '@/utils/builder.ts';
import colors from 'ansi-colors';
import db from 'croxydb';
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChannelType, ComponentType, ModalBuilder, PermissionsBitField, TextChannel, TextInputBuilder, TextInputStyle, codeBlock, type ModalActionRowComponentBuilder } from 'discord.js';

export default new Command({
	data: (builder) => builder
		.setName('karşıla')
		.setDescription('Kullanıcıları sunucuya katıldıklarında onları karşılyabilirsiniz.')
		.addSubcommand((input) => input
			.setName('kanalayarla')
			.setDescription('Kullanıcıları karşılamak için kullanılacak kanalı belirleyin.')
			.addChannelOption((channel) => channel
				.setName('kanal')
				.setDescription('Bir kanal etiketleyin.')
				.setRequired(true)
				.addChannelTypes(ChannelType.GuildText),
			),
		)
		.addSubcommand((input) => input
			.setName('mesajözelleştir')
			.setDescription('Karşılama mesajlarını kişisel tercihlerinize göre özelleştirin.'),
		)
		.addSubcommand((input) => input
			.setName('doğrudanmesaj')
			.setDescription('Kullanıcıları karşılamak için doğrudan mesajları kullanıp kullanmayacağınızı ayarlayabilirsiniz.'),
		)
		.addSubcommand((input) => input
			.setName('ayarlarıgöster')
			.setDescription('Karşılama sistemi ayarlarını inceleyin.'),
		)
		.addSubcommand((input) => input
			.setName('çalışıyor')
			.setDescription('Karşılama sisteminin çalışıp çalışmayacağına karar verin.')
			.addBooleanOption((option) => option.setName('mantık').setDescription('Sistemin çalışıp çalışmayacağını belirleyin.').setRequired(true)),
		)
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
		.setDMPermission(false),

	async execute(interaction) {
		const embedBuilder = () => embed(interaction);
		const waitingEmbed = embedBuilder().setDescription(
			'• Karşılama sistemi çağırılıyor, bu biraz zaman alabilir.',
		);

		const message = await interaction.reply({ embeds: [waitingEmbed], fetchReply: true });
		const subCommand = interaction.options.getSubcommand();
		const welcomeData = new Welcome(`${interaction.guildId}.login`);

		switch (subCommand) {
		case 'kanalayarla': {
			if (welcomeData.isActive()) {
				const finalEmbed = embedBuilder()
					.setTitle('İşlem iptal edildi.')
					.setDescription('❌ **|** Karşılama sistemi özelleştirilirken, ilk adım olarak pasif duruma getirmelisin.');

				message.edit({ embeds: [finalEmbed] }).catch(() => undefined); return;
			}

			const channelData = welcomeData.channel;
			const channel = interaction.options.getChannel('kanal', true) as TextChannel;

			if (channelData && channelData.id === channel.id) {
				const finalEmbed = embedBuilder()
					.setTitle('İşlem iptal edildi.')
					.setDescription(
						'❌ **|** Yeni belirlemek istediğiniz kanal, mevcut kanal ile aynı olmamalıdır.',
					);

				message.edit({ embeds: [finalEmbed] }).catch(() => undefined); return;
			}

			const finalEmbed = embedBuilder()
				.setTitle('İşlem başarılı oldu.')
				.setDescription(
					replace('✅ **|** Yeni giriş kanalı, başarıyla <#{0}> olarak ayarlandı.', [channel.id]),
				);

			welcomeData.setChannel(channel);
			message.edit({ embeds: [finalEmbed] }).catch(() => undefined); return;
		}

		case 'mesajözelleştir': {
			if (welcomeData.isActive()) {
				const finalEmbed = embedBuilder()
					.setTitle('İşlem iptal edildi.')
					.setDescription('❌ **|** Karşılama sistemi özelleştirilirken, ilk adım olarak pasif duruma getirmelisin.');

				message.edit({ embeds: [finalEmbed] }).catch(() => undefined); return;
			}

			const finalEmbed = embedBuilder()
				.setTitle('İşlem bekleniyor.')
				.setDescription('ℹ️ **|** Karşılama mesajları için kullandığınız her kelime kayıt altına alınmaktadır. Bu kapsamda, `küfür`, `argo` ve `hakaret` gibi ifadelerin kullanımı durumunda yaptırım uygulama hakkını saklı tutmaktayız.')
				.setFields([
					{
						name: 'Kullanabileceğiniz değişkenler:',
						value: codeBlock('ansi', [
							`${colors.yellow('{member}')} ${colors.white('🠊')} ${colors.blue('Kullanıcıyı etiketler.')}`,
							`${colors.yellow('{member.displayName}')} ${colors.white('🠊')} ${colors.blue('Kullanıcının normal ismini gösterir.')}`,
							`${colors.yellow('{member.globalName}')} ${colors.white('🠊')} ${colors.blue('Kullanıcının global ismini gösterir.')}`,
						].map((m, index) => `${colors.red(`${index + 1}.`)} ${m}`).join('\n')),
					},
				]);

			const finalBtn = new ActionRowBuilder<ButtonBuilder>()
				.setComponents(
					new ButtonBuilder()
						.setCustomId(`welcomeMessageBtn_${interaction.user.id}`)
						.setLabel('Mesaj düzenleyicisini aç.')
						.setEmoji({ id: '1144609820897452147' })
						.setStyle(ButtonStyle.Secondary),
				);

			message.edit({ embeds: [finalEmbed], components: [finalBtn] }).catch(() => undefined);

			const filter = (i: ButtonInteraction) => i.message.id === message.id && i.user.id === interaction.user.id;
			const collector = message.createMessageComponentCollector({ time: 15_000, componentType: ComponentType.Button, filter, max: 1 });

			collector.on('collect', async (i) => {
				const actionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>();

				const modal = new ModalBuilder()
					.setTitle(interaction.client.user.username)
					.setCustomId('welcome_message');

				const textInput = new TextInputBuilder()
					.setCustomId('input')
					.setLabel('Karşılama mesajınızı yazınız:')
					.setPlaceholder('> {member} sunucuya giriş yaptı.')
					.setStyle(TextInputStyle.Paragraph);

				actionRow.setComponents(textInput);
				modal.setComponents(actionRow);

				await i.showModal(modal);
			});

			collector.once('end', () => {
				message.edit({ components: [disabledButtons(finalBtn)] }).catch(() => undefined); return;
			});

			return;
		}

		case 'doğrudanmesaj': {
			if (welcomeData.isActive()) {
				const finalEmbed = embedBuilder()
					.setTitle('İşlem iptal edildi.')
					.setDescription('❌ **|** Karşılama sistemi özelleştirilirken, ilk adım olarak pasif duruma getirmelisin.');

				message.edit({ embeds: [finalEmbed] }).catch(() => undefined); return;
			}

			const channelData = welcomeData.channel;

			if (channelData && channelData.id === 'Dircet Message') {
				const finalEmbed = embedBuilder()
					.setTitle('İşlem iptal edildi.')
					.setDescription('❌ **|** Kullanıcılar zaten özel mesajlar aracılığıyla karşılanmaktadır.');

				message.edit({ embeds: [finalEmbed] }).catch(() => undefined); return;
			}

			const finalEmbed = embedBuilder()
				.setTitle('İşlem başarılı oldu.')
				.setDescription('✅ **|** Artık kullanıcılar, `Doğrudan Mesajlar` aracılığıyla karşılanacak.');

			welcomeData.setChannel('Dircet Message');
			message.edit({ embeds: [finalEmbed] }).catch(() => undefined); return;
		}

		case 'ayarlarıgöster': {
			let loginChannelType, loginChannelId, loginChannelTime;
			let loginMessageTime;

			const loginChannelData = welcomeData.data?.channel;
			const loginMessageData = welcomeData.data?.message;

			if (loginChannelData && loginChannelData.id === 'Dircet Message') {
				loginChannelType = 'Doğrudan Mesajlar';
				loginChannelId = '000000000000000000';
				loginChannelTime = loginChannelData.timestamp;
			}
			else if (loginChannelData && typeof loginChannelData.id === 'string') {
				loginChannelType = 'Metin Kanalı';
				loginChannelId = loginChannelData.id;
				loginChannelTime = loginChannelData.timestamp;
			}
			else {
				loginChannelType = undefined;
				loginChannelId = undefined;
				loginChannelTime = undefined;
			}

			if (loginMessageData && loginMessageData.content.length >= 5) {
				loginMessageTime = loginMessageData.timestamp;
			}
			else {
				loginMessageTime = undefined;
			}

			const finalBtns = new ActionRowBuilder<ButtonBuilder>()
				.setComponents(
					new ButtonBuilder()
						.setCustomId('resetAll')
						.setDisabled(!db.has(`${interaction.guildId}.login`))
						.setEmoji({ id: '1144607071044649070' })
						.setLabel('Verileri temizle.')
						.setStyle(ButtonStyle.Danger),
					new ButtonBuilder()
						.setCustomId('showMessage')
						.setDisabled(!db.has(`${interaction.guildId}.login.message`))
						.setEmoji({ id: '1144609820897452147' })
						.setLabel('Karşılama mesajını göster ve düzenle.')
						.setStyle(ButtonStyle.Secondary),
				);

			const finalEmbed = embedBuilder()
				.setDescription('• Bunu biliyor muydunuz? Sistemin işlevselliğini kapatmanız durumunda bile, önceden ayarladığınız tüm veriler silinmez.')
				.setFields([
					{
						name: 'Kanal ayarı:',
						value: [
							`\`-\` Tipi: \`${loginChannelType}\``,
							`\`-\` ID'si: \`${loginChannelId}\``,
							`\`-\` Tarih: ${loginChannelTime ? unix(loginChannelTime) : '`' + loginChannelTime + '`'}`,
						].join('\n'),
					},
					{
						name: 'Mesaj ayarı:',
						value: [
							`\`-\` Tarih: ${loginMessageTime ? unix(loginMessageTime) : '`' + loginMessageTime + '`' }`,
						].join('\n'),
					},
					{
						name: 'Sistem aktif mi?',
						value: [
							`${welcomeData.isActive() ? 'Evet' : 'Hayır'}, sistem şu anda ${welcomeData.isActive() ? '`etkin` durumda.' : '`devre dışı.`'}`,
						].join('\n'),
					},
				]);

			message.edit({ embeds: [finalEmbed], components: [finalBtns] }).catch(() => undefined);

			const filter = (i: ButtonInteraction) => i.message.id === message.id && i.user.id === interaction.user.id;
			const collector = message.createMessageComponentCollector({ time: 15_000, componentType: ComponentType.Button, filter, max: 1 });

			collector.on('collect', async (i) => {
				if (i.customId === 'resetAll') {
					i.deferUpdate();
					welcomeData.deleteAll();

					await message.edit({
						embeds: [
							embedBuilder()
								.setTitle('İşlem başarılı oldu.')
								.setDescription('✅ **|** Karşılama veritabanı başarıyla sıfırlandı.'),
						],
						components: [disabledButtons(finalBtns)],
					}); return;
				}
				else if (i.customId === 'showMessage') {
					i.deferUpdate();

					await message.edit({
						embeds: [
							embedBuilder()
								.setDescription(codeBlock('ansi', colors.blue(`${welcomeData.message?.content.replaceAll(/\{(.*?)\}/g, colors.yellow('{$1}'))}`))),
						],
						components: [disabledButtons(finalBtns)],
					}); return;
				}
			});

			collector.once('end', () => {
				message.edit({ components: [disabledButtons(finalBtns)] }).catch(() => undefined); return;
			});

			return;
		}

		case 'çalışıyor': {
			const active = interaction.options.getBoolean('mantık', true);
			const welcomeActive = welcomeData.isActive();

			if (active && welcomeActive) {
				const finalEmbed = embedBuilder()
					.setTitle('İşlem iptal edildi.')
					.setDescription('❌ **|** Karşılama sistemi zaten etkinleştirilmiş durumda.');

				message.edit({ embeds: [finalEmbed] }).catch(() => undefined); return;
			}

			if (!active && !welcomeActive) {
				const finalEmbed = embedBuilder()
					.setTitle('İşlem iptal edildi.')
					.setDescription('❌ **|** Karşılama sistemi zaten devre dışı bırakılmış.');

				message.edit({ embeds: [finalEmbed] }).catch(() => undefined); return;
			}

			if (!welcomeData.channel) {
				const finalEmbed = embedBuilder()
					.setTitle('İşlem iptal edildi.')
					.setDescription('❌ **|** Sistemin düzgün çalışabilmesi için bir kanal belirtmeniz gerekmektedir.');

				message.edit({ embeds: [finalEmbed] }).catch(() => undefined); return;
			}


			if (active) {
				welcomeData.setActive();
				welcomeData.message ?? welcomeData.setMessage();
			}
			else {
				welcomeData.setDeactive();
			}

			const finalEmbed = embedBuilder()
				.setTitle('İşlem başarılı oldu.')
				.setDescription(`✅ **|** ${active ? 'Karşılama sistemi başarıyla etkinleştirildi.' : 'Karşılama sistemi başarıyla devre dışı bırakıldı.'}`);

			message.edit({ embeds: [finalEmbed] }).catch(() => undefined); return;
		}
		}
	},
});

export class Welcome {
	public data: { channel: { id: string | 'Dircet Message'; timestamp: number; } | undefined; message: { content: string; timestamp: number; } | undefined; active: boolean };
	private key: string;
	private active: boolean;

	constructor(key: string) {
		this.data = db.get(key);
		this.active = db.get(`${key}.active`) ?? false;
		this.key = key;
	}

	public get channel() {
		const channelData: { id: string; timestamp: number } | undefined = db.get(`${this.key}.channel`);

		if (!channelData) {
			return undefined;
		}

		return channelData;
	}

	public get message() {
		const messageData: { content: string; timestamp: number } | undefined = db.get(`${this.key}.message`);

		if (!messageData) {
			return undefined;
		}

		return messageData;
	}

	public isActive() {
		const activeData: boolean = db.has(`${this.key}.active`) ?? false;

		return activeData;
	}

	public setChannel(channel: TextChannel | 'Dircet Message') {
		if (typeof channel === 'string') {
			db.set(`${this.key}.channel`, { id: channel, timestamp: Date.now() }); return true;
		}

		db.set(`${this.key}.channel`, { id: channel.id, timestamp: Date.now() }); return true;
	}

	public setMessage(content?: string) {
		db.set(`${this.key}.message`, { content: content ?? '> {member} sunucuya giriş yaptı.', timestamp: Date.now() });

		return true;
	}

	public setActive(): boolean {
		if (this.channel) {
			this.active = true;
			db.set(`${this.key}.active`, this.active);

			return true;
		}

		return false;
	}

	public setDeactive(): boolean {
		this.active = false;
		db.delete(`${this.key}.active`, true);

		return true;
	}

	public deleteAll(): boolean {
		if (this.data) {
			db.delete(this.key, true); return true;
		}
		else {
			return true;
		}
	}
}

