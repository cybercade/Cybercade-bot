import { Category } from '@discordx/utilities'
import { ButtonInteraction, CommandInteraction, EmbedBuilder, GuildMember, Message, VoiceBasedChannel } from 'discord.js'
import { Client } from 'discordx'

import { Discord, Injectable, Slash, SlashGroup } from '@/decorators'
import { Guild } from '@/entities'
import { getLocaleFromInteraction, L } from '@/i18n'
import { Database, MoonlinkService } from '@/services'
import { createProgressBar, formatDuration } from '@/utils/functions'

@Discord()
@Injectable()
@Category('General')
@SlashGroup('music')
export default class QueueCommand {

	constructor(
		private db: Database,
		private moonlinkService: MoonlinkService
	) { }

	public async viewQueue(
		interaction: ButtonInteraction | CommandInteraction,
		client: Client,
		guildData: Guild | null
	): Promise<void> {
		const locale = getLocaleFromInteraction(interaction)

		const member = interaction.member as GuildMember
		const voiceChannel = member.voice.channel as VoiceBasedChannel

		if (!voiceChannel || !interaction.guildId) {
			return
		}

		// Hole den initialisierten Moonlink Manager
		const manager = this.moonlinkService.getManager() // Nutzt die Hilfsmethode für Check
		if (!manager) {
			return
		}

		const player = manager.createPlayer({
			guildId: interaction.guildId,
			voiceChannelId: voiceChannel.id,
			textChannelId: interaction.channelId,
		})

		if (!player.playing) {
			const pMsg = await interaction.followUp({
				content: L[locale].ERRORS.MUSIC.NO_QUEUE(),
				ephemeral: true,
			})

			return
		}

		const embed = new EmbedBuilder()
			.setAuthor({
				name: L[locale].SHARED.MUSIC.EMBED.CURRENT_PLAYING(),
				iconURL: interaction.user.avatarURL() ?? '',
			})
			.setTitle(player.current.title)
			.setDescription(`${createProgressBar(player)}`)
			.setColor(guildData?.color ? Number.parseInt(guildData.color.replace('#', ''), 16) : '#2600ff')
			.setFooter({
				text: client.user?.username ?? 'Cyberca.de Bot',
				iconURL: client.user?.avatarURL() ?? 'https://cdn.discordapp.com/embed/avatars/1.png',
			})
			.setTimestamp()

		embed.addFields(
			{
				name: `:microphone: ${L[locale].SHARED.MUSIC.EMBED.INTERPRETER()}`,
				value: player.current.author,
				inline: false,
			},
			{
				name: `:hourglass: ${L[locale].SHARED.MUSIC.EMBED.LENGTH()}`,
				value: formatDuration(player.current.duration),
				inline: true,
			},
			{
				name: `:control_knobs: ${L[locale].SHARED.MUSIC.EMBED.REQUESTED_BY()}`,
				value: `${player.current.requestedBy}`,
				inline: true,
			},
			{
				name: ` `,
				value: ` `,
				inline: false,
			}
		)

		if (player.queue.tracks.length > 0) {
			embed.addFields(
				{
					name: `:notes: ${L[locale].SHARED.MUSIC.EMBED.QUEUE()}:`,
					value: `${player.queue.tracks.map((track, index) => `\`${index + 1}.\` ${track.title} \`${formatDuration(track.duration)}\``).join('\n')}`,
					inline: false,
				},
				{
					name: `:musical_score: ${L[locale].SHARED.MUSIC.EMBED.SONGS()}`,
					value: player.queue.tracks.length.toString(),
					inline: true,
				},
				{
					name: `:hourglass: ${L[locale].SHARED.MUSIC.EMBED.LENGTH()}`,
					value: formatDuration(player.queue.tracks.map(track => track.duration).reduce((a, b) => a + b, 0)),
					inline: true,
				},
				{
					name: `:page_facing_up: ${L[locale].SHARED.MUSIC.EMBED.PAGE()}`,
					value: '1',
					inline: true,
				}
			)
		}

		if (player.current.artworkUrl) embed.setThumbnail(player.current.artworkUrl)
		if (player.current.url) embed.setURL(player.current.url)

		await interaction.editReply({ embeds: [embed] })
	}

	@Slash({
		name: 'nowplaying',
		localizationSource: 'COMMANDS.MUSIC.NOWPLAYING',
	})
	@Slash({
		name: 'np',
	})
	async np(
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		await interaction.deferReply()

		await this.viewQueue(interaction, client, await this.db.get(Guild).findOne({ id: interaction.guildId }))
	}

	@Slash({
		name: 'queue',
		localizationSource: 'COMMANDS.MUSIC.QUEUE',
	})
	@Slash({
		name: 'q',
	})
	async queue(
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		await interaction.deferReply()

		await this.viewQueue(interaction, client, await this.db.get(Guild).findOne({ id: interaction.guildId }))
	}

}
