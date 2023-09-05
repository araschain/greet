import { Event } from '@/classes/event.ts';
import { Welcome } from '@/commands/moderation/login.ts';
import { eventLog } from '@/modules/variables.ts';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Guild, type GuildMember } from 'discord.js';

export default new Event({
	category: 'guildMemberAdd',

	async execute(member) {
		const welcomeData = new Welcome(`${member.guild.id}.login`);
		const channelData = welcomeData.channel;
		const messageData = welcomeData.message;

		if (member.user.bot) return;

		if (welcomeData.isActive() && channelData && messageData) {
			if (channelData.id !== 'Dircet Message') {
				await GuildMessage(member, channelData.id, messageData.content, member.guild);
			}
			else {
				await DircetMessage(member, messageData.content, member.guild.name);
			}
		}
	},
});

async function DircetMessage(member: GuildMember, content: string, guildName: string) {
	try {
		const finalBtn = new ActionRowBuilder<ButtonBuilder>()
			.setComponents(
				new ButtonBuilder()
					.setCustomId('disabled')
					.setDisabled(true)
					.setLabel(`${guildName} sunucusundan gönderildi.`)
					.setStyle(ButtonStyle.Secondary),
			);

		const replacedMessage = content
			.replaceAll('{member}', `<@${member.id}>`)
			.replaceAll('{member.displayName}', member.user.displayName)
			.replaceAll('{globalName}', member.user.username)
			.replaceAll(/<@[!&]?\d+>/, '');

		await member.send({ content: replacedMessage, components: [finalBtn] }); return;
	}
	catch {
		eventLog.warn('User\'s dm is closed.'); return;
	}
}

async function GuildMessage(member: GuildMember, channelId: string, content: string, guild: Guild) {
	try {
		const channel = await guild.channels.fetch(channelId);
		const replacedMessage = content
			.replaceAll('{member}', `<@${member.id}>`)
			.replaceAll('{member.displayName}', member.user.displayName)
			.replaceAll('{globalName}', member.user.username)
			.replaceAll(/<@[!&]?\d+>/, '');

		if (channel && channel.type === ChannelType.GuildText) {
			await channel.send({ content: replacedMessage });
		}
	}
	catch (error) {
		eventLog.warn(error);
	}
}