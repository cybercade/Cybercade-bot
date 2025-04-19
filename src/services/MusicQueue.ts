import { fromMS, Queue, RepeatMode } from '@discordx/lava-queue'
import {
	Pagination,
	PaginationResolver,
	PaginationType,
} from '@discordx/pagination'
import type {
	BaseClient,
	ButtonInteraction,
	CommandInteraction,
	MessageActionRowComponentBuilder,
	PartialGroupDMChannel,
	TextBasedChannel,
} from 'discord.js'
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	Message,
} from 'discord.js'
import { Client } from 'discordx'

import { Injectable, Service } from '@/decorators'
import { Guild } from '@/entities'
import { getLocaleFromInteraction, L } from '@/i18n'
import { getPlayerUi } from '@/utils/functions'

export type TrackChannel = Exclude<TextBasedChannel, PartialGroupDMChannel>

@Service()
@Injectable()
export class MusicQueue extends Queue {

	private _channel: TrackChannel | null = null
	private _controlTimer: NodeJS.Timeout | null = null

	private lastControlMessage?: Message
	private lockUpdate = false

	public setChannel(channel: TrackChannel): void {
		this._channel = channel
	}

	private controlsRow(): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
		const nextButton = new ButtonBuilder()
			.setLabel('Next')
			.setEmoji('⏭')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(!this.isPlaying)
			.setCustomId('btn-next')

		const pauseButton = new ButtonBuilder()
			.setLabel(this.isPlaying ? 'Pause' : 'Resume')
			.setEmoji(this.isPlaying ? '⏸️' : '▶️')
			.setStyle(ButtonStyle.Primary)
			.setCustomId('btn-pause')

		const stopButton = new ButtonBuilder()
			.setLabel('Stop')
			.setStyle(ButtonStyle.Danger)
			.setCustomId('btn-leave')

		const repeatButton = new ButtonBuilder()
			.setLabel('Repeat')
			.setEmoji('🔂')
			.setDisabled(!this.isPlaying)
			.setStyle(
				this.repeatMode === RepeatMode.REPEAT_ONE
					? ButtonStyle.Danger
					: ButtonStyle.Primary
			)
			.setCustomId('btn-repeat')

		const loopButton = new ButtonBuilder()
			.setLabel('Loop')
			.setEmoji('🔁')
			.setDisabled(!this.isPlaying)
			.setStyle(
				this.repeatMode === RepeatMode.REPEAT_ALL
					? ButtonStyle.Danger
					: ButtonStyle.Primary
			)
			.setCustomId('btn-loop')

		const row1
			= new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
				stopButton,
				pauseButton,
				nextButton,
				repeatButton
			)

		const queueButton = new ButtonBuilder()
			.setLabel('Queue')
			.setEmoji('🎵')
			.setStyle(ButtonStyle.Primary)
			.setCustomId('btn-queue')
		const mixButton = new ButtonBuilder()
			.setLabel('Shuffle')
			.setEmoji('🎛️')
			.setDisabled(!this.isPlaying)
			.setStyle(ButtonStyle.Primary)
			.setCustomId('btn-mix')
		const controlsButton = new ButtonBuilder()
			.setLabel('Controls')
			.setEmoji('🔄')
			.setStyle(ButtonStyle.Primary)
			.setCustomId('btn-controls')

		const row2
			= new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
				loopButton,
				queueButton,
				mixButton,
				controlsButton
			)

		return [row1, row2]
	}

	private async deleteMessage(message: Message): Promise<void> {
		if (message.deletable) {
			// ignore any exceptions in delete action
			await message.delete().catch(() => null)
		}
	}

	public async updateControlMessage(options?: {
		force?: boolean
		text?: string
	}): Promise<void> {
		if (this.lockUpdate || this._channel === null) {
			return
		}

		this.lockUpdate = true
		const embed = new EmbedBuilder()
		embed.setTitle('Music Controls')
		const currentPlaybackTrack = this.currentPlaybackTrack
		const nextTrack = this.nextTrack

		if (!currentPlaybackTrack) {
			if (this.lastControlMessage) {
				await this.deleteMessage(this.lastControlMessage)
				this.lastControlMessage = undefined
			}

			this.lockUpdate = false

			return
		}

		const { title, uri, length: trackTimeTotal } = currentPlaybackTrack.info
		const uriText = uri ? `[${title}](${uri})` : title

		const subText
			= this.size > 2 ? ` (Total: ${String(this.size)} tracks queued)` : ''

		embed.addFields({
			name: `Now Playing${subText}`,
			value: uriText,
		})

		const progressBarOptions = {
			arrow: '🔘',
			block: '━',
			size: 15,
		}

		const { size, arrow, block } = progressBarOptions
		const timeNow = this.currentPlaybackPosition

		const progress = Math.round((size * timeNow) / trackTimeTotal)
		const emptyProgress = size - progress

		const progressString
			= block.repeat(progress) + arrow + block.repeat(emptyProgress)

		const bar = `${this.isPlaying ? '▶️' : '⏸️'} ${progressString}`
		const currentTime = fromMS(timeNow)
		const endTime = fromMS(trackTimeTotal)
		const spacing = bar.length - currentTime.length - endTime.length
		const time = `\`${currentTime}${' '.repeat(spacing * 3 - 2)}${endTime}\``

		embed.addFields({ name: bar, value: time })

		let nextTrackText = 'No upcoming song'
		if (nextTrack) {
			if (nextTrack.info.uri) {
				nextTrackText = `[${nextTrack.info.title}](${nextTrack.info.uri})`
			} else {
				nextTrackText = nextTrack.info.title
			}
		}

		embed.addFields({
			name: 'Next Song',
			value: nextTrackText,
		})

		const pMsg = {
			components: [...this.controlsRow()],
			content: options?.text,
			embeds: [embed],
		}

		if (!options?.force && this.lastControlMessage) {
			// Update control message
			await this.lastControlMessage.edit(pMsg)
		} else {
			// Delete control message
			if (this.lastControlMessage) {
				await this.deleteMessage(this.lastControlMessage)
				this.lastControlMessage = undefined
			}

			// Send control message
			this.lastControlMessage = await this._channel.send(pMsg)
		}

		this.lockUpdate = false
	}

	public startControlUpdate(interval?: number): void {
		this.stopControlUpdate()

		this._controlTimer = setInterval(() => {
			void this.updateControlMessage()
		}, interval ?? 10_000)

		void this.updateControlMessage()
	}

	public stopControlUpdate(): void {
		if (this._controlTimer !== null) {
			clearInterval(this._controlTimer)
			this._controlTimer = null
		}

		if (this.lastControlMessage) {
			void this.deleteMessage(this.lastControlMessage)
			this.lastControlMessage = undefined
		}

		this.lockUpdate = false
	}

	public async viewOld(
		interaction: ButtonInteraction | CommandInteraction
	): Promise<void> {
		const queueErrorMessage
			= '> The queue could not be processed at the moment, please try again later!'
		const nowPlayingMessage = (title: string) => `> Playing **${title}**`
		const pageTimeoutMessage = 60_000 // 6e4
		const shortPaginationLimit = 5
		const deleteDelayMsShort = 3_000 // 3 seconds
		const deleteDelayMsLong = 10_000 // 10 seconds

		const currentPlaybackTrackMessage = (
			title: string,
			size: number,
			uri?: string
		) => {
			const trackTitle = uri ? `[${title}](<${uri}>)` : title

			return `> Playing **${trackTitle}** out of ${String(size + 1)}`
		}

		if (!this.currentPlaybackTrack) {
			const pMsg = await interaction.followUp({
				content: queueErrorMessage,
				ephemeral: true,
			})

			if (pMsg instanceof Message) {
				setTimeout(() => void this.deleteMessage(pMsg), deleteDelayMsShort)
			}

			return
		}

		if (this.size === 0) {
			const pMsg = await interaction.followUp({
				content: nowPlayingMessage(this.currentPlaybackTrack.info.title),
				ephemeral: true,
			})
			if (pMsg instanceof Message) {
				setTimeout(() => void this.deleteMessage(pMsg), deleteDelayMsLong)
			}

			return
		}

		const totalPages = Math.round(this.size / 10)
		const isShortPagination = totalPages <= shortPaginationLimit

		const current = currentPlaybackTrackMessage(
			this.currentPlaybackTrack.info.title,
			this.size,
			this.currentPlaybackTrack.info.uri
		)

		const paginationType = isShortPagination
			? PaginationType.Button
			: PaginationType.SelectMenu

		const pageOptions = new PaginationResolver((index, paginator) => {
			paginator.maxLength = this.size / 10
			if (index > paginator.maxLength) {
				paginator.currentPage = 0
			}

			const currentPage = paginator.currentPage

			const queue = this.tracks
				.slice(currentPage * 10, currentPage * 10 + 10)
				.map((track, _index) => {
					const index = currentPage * 10 + _index + 1
					const trackLength = fromMS(track.info.length)
					const trackTitle = track.info.uri
						? `[${track.info.title}](<${track.info.uri}>)`
						: track.info.title

					return `${String(index)}. ${trackTitle} (${trackLength})`
				})
				.join('\n\n')

			return { content: `${current}\n\n${queue}` }
		}, totalPages)

		const pagination = new Pagination(interaction, pageOptions, {
			enableExit: true,
			onTimeout: (_, message) => {
				if (message.deletable) {
					void this.deleteMessage(message)
				}
			},
			time: pageTimeoutMessage,
			type: paginationType,
		})

		await pagination.send()
	}

	public async view(
		interaction: ButtonInteraction | CommandInteraction,
		client: Client,
		guildData: Guild | null
	): Promise<void> {
		const deleteDelayMsShort = 3_000 // 3 seconds
		const deleteDelayMsLong = 10_000 // 10 seconds
		const locale = getLocaleFromInteraction(interaction)

		if (!this.currentPlaybackTrack) {
			const pMsg = await interaction.followUp({
				content: L[locale].ERRORS.MUSIC.NO_QUEUE(),
				ephemeral: true,
			})

			if (pMsg instanceof Message) {
				setTimeout(() => void this.deleteMessage(pMsg), deleteDelayMsShort)
			}

			return
		}

		const embed = new EmbedBuilder()
			.setAuthor({
				name: L[locale].SHARED.MUSIC.EMBED.CURRENT_PLAYING(),
				iconURL: interaction.user.avatarURL() ?? '',
			})
			.setTitle(this.currentPlaybackTrack.info.title)
			.setDescription(`Requested by: <@${this.currentPlaybackTrack.userData?.requester}>\n\n${getPlayerUi(this)}`)
			.addFields(
				{
					name: `:notes: ${L[locale].SHARED.MUSIC.EMBED.QUEUE()}`,
					value: `${this.tracks.map((track, index) => `\`${index}.\` ${track.info.title} \`${fromMS(track.info.length)}\``).join('\n')}`,
					inline: false,
				},
				{
					name: `:musical_score: ${L[locale].SHARED.MUSIC.EMBED.SONGS()}`,
					value: this.tracks.length.toString(),
					inline: true,
				},
				{
					name: `:hourglass: ${L[locale].SHARED.MUSIC.EMBED.LENGTH()}`,
					value: fromMS(this.tracks.map(track => track.info.length).reduce((a, b) => a + b, 0)),
					inline: true,
				},
				{
					name: `:page_facing_up: ${L[locale].SHARED.MUSIC.EMBED.PAGE()}`,
					value: '1',
					inline: true,
				}
			)
			.setColor(guildData?.color ? Number.parseInt(guildData.color.replace('#', ''), 16) : '#2600ff')
			.setFooter({
				text: client.user?.username ?? 'Cyberca.de Bot',
				iconURL: client.user?.avatarURL() ?? 'https://cdn.discordapp.com/embed/avatars/1.png',
			})
			.setTimestamp()

		if (this.currentPlaybackTrack.info.artworkUrl) embed.setThumbnail(this.currentPlaybackTrack.info.artworkUrl)
		if (this.currentPlaybackTrack.info.uri) embed.setURL(this.currentPlaybackTrack.info.uri)

		// TODO: Add pagination
		interaction.followUp({ embeds: [embed] })
	}

	public async exit(): Promise<void> {
		this.stopControlUpdate()
		await super.exit()
	}

	public async saveSong(interaction: ButtonInteraction | CommandInteraction, client: Client, guildData: Guild | null): Promise<void> {
		const currentSong = this.currentPlaybackTrack
		if (!currentSong) {
			return
		}

		const locale = getLocaleFromInteraction(interaction)

		const dmChannel = await interaction.user.createDM()

		const embed = new EmbedBuilder()
			.setAuthor({
				name: L[locale].SHARED.MUSIC.EMBED.ADDED_PLAYLIST_TO_QUEUE(),
				iconURL: interaction.user.avatarURL() ?? '',
			})
			.setTitle(this.currentPlaybackTrack.info.title)
			.addFields(
				{
					name: `:microphone: ${L[locale].SHARED.MUSIC.EMBED.INTERPRETER()}`,
					value: this.currentPlaybackTrack.info.author,
					inline: false,
				},
				{
					name: `:hourglass: ${L[locale].SHARED.MUSIC.EMBED.LENGTH()}`,
					value: fromMS(this.currentPlaybackTrack.info.length),
					inline: true,
				},
				{
					name: `:control_knobs: ${L[locale].SHARED.MUSIC.EMBED.REQUESTED_BY()}`,
					value: `<@${this.currentPlaybackTrack.userData?.requester}>`,
					inline: true,
				}
			)
			.setColor(guildData?.color ? Number.parseInt(guildData.color.replace('#', ''), 16) : '#2600ff')
			.setFooter({
				text: client.user?.username ?? 'Cyberca.de Bot',
				iconURL: client.user?.avatarURL() ?? 'https://cdn.discordapp.com/embed/avatars/1.png',
			})
			.setTimestamp()

		if (this.currentPlaybackTrack.info.uri) {
			embed.setURL(this.currentPlaybackTrack.info.uri)
			embed.addFields({
				name: `:globe_with_meridians: ${L[locale].SHARED.MUSIC.EMBED.SONG_URL()}`,
				value: this.currentPlaybackTrack.info.uri,
				inline: false,
			})
		}
		if (this.currentPlaybackTrack.info.artworkUrl) {
			embed.setThumbnail(this.currentPlaybackTrack.info.artworkUrl)
		}

		await dmChannel.send({ embeds: [embed] })
	}

}
