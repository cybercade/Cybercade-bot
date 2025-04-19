import { LoadType } from '@discordx/lava-player'
import { fromMS } from '@discordx/lava-queue'
import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js'
import { Client } from 'discordx'
import { lavaPlayerManager } from 'src/services/MusicManager'

import { generalConfig } from '@/configs'
import { Discord, Injectable, Slash, SlashChoice, SlashGroup, SlashOption } from '@/decorators'
import { Guild } from '@/entities'
import { Database } from '@/services'
import { simpleErrorEmbed } from '@/utils/functions'

@Discord()
@Injectable()
@Category('General')
@SlashGroup('music')
export default class PlayCommand {

	constructor(
		private db: Database
	) {}

	@Slash({
		name: 'play',
	})
	@Slash({
		name: 'p',
	})
	async play(
		@SlashOption({
			description: 'input',
			name: 'input',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		input: string,
		@SlashChoice({
			name: 'Als letztes',
			value: 'end',
		})
		@SlashChoice({
			name: 'Als nächstes',
			value: 'start',
		})
		@SlashOption({
			description: 'position',
			name: 'position',
			type: ApplicationCommandOptionType.String,
			required: false,
		})
		position: string,
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		if (generalConfig.musicPlayer === false) {
			await interaction.deferReply({ ephemeral: true })
			simpleErrorEmbed(interaction, localize.ERRORS.MUSIC.PLAYER_DISABLED())

			return
		}

		const cmd = await lavaPlayerManager.parseCommand(interaction)
		if (!cmd) {
			return
		}

		const guildData = await this.db.get(Guild).findOne({ id: interaction.guildId })

		clearTimeout(cmd.autoDeleteTimer)
		const { queue } = cmd

		const isLink = input.startsWith('http://') || input.startsWith('https://')
		const searchText = isLink ? input : `ytmsearch:${input}`
		const { loadType, data } = await queue.search(searchText)

		if (loadType === LoadType.ERROR) {
			await interaction.followUp({
				content: `${localize.ERRORS.UNKNOWN()} - ${data.cause}`,
			})

			return
		}

		if (loadType === LoadType.EMPTY) {
			await interaction.followUp({
				content: localize.ERRORS.MUSIC.NO_MATCHES(),
			})

			return
		}

		// Handle songs and searches
		if (loadType === LoadType.TRACK || loadType === LoadType.SEARCH) {
			const track = loadType === LoadType.SEARCH ? data[0] : data
			if (!track) {
				await interaction.followUp({
					content: localize.ERRORS.MUSIC.NO_MATCHES(),
				})

				return
			}

			if (position === 'start') {
				queue.addTrackFirst({ ...track, userData: { requester: interaction.user.id } })
			} else {
				queue.addTrack({ ...track, userData: { requester: interaction.user.id } })
			}

			const embed = new EmbedBuilder()
				.setAuthor({
					name: localize.SHARED.MUSIC.EMBED.ADDED_TO_QUEUE(),
					iconURL: interaction.user.avatarURL() ?? '',
				})
				.setTitle(track.info.title)
				.setURL(track.info.uri ?? '')
				.addFields(
					{
						name: `:microphone: ${localize.SHARED.MUSIC.EMBED.INTERPRETER()}`,
						value: track.info.author,
						inline: false,
					},
					{
						name: `:hourglass: ${localize.SHARED.MUSIC.EMBED.LENGTH()}`,
						value: fromMS(track.info.length),
						inline: true,
					},
					{
						name: `:control_knobs: ${localize.SHARED.MUSIC.EMBED.REQUESTED_BY()}`,
						value: `<@${interaction.user.id}>`,
						inline: true,
					}
				)
				.setColor(guildData?.color ? Number.parseInt(guildData.color.replace('#', ''), 16) : '#2600ff')
				.setFooter({
					text: client.user?.username ?? 'Cyberca.de Bot',
					iconURL: client.user?.avatarURL() ?? 'https://cdn.discordapp.com/embed/avatars/1.png',
				})
				.setTimestamp()

			if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl)

			await interaction.followUp({ embeds: [embed] })
		}

		// Handle playlists
		if (loadType === LoadType.PLAYLIST) {
			if (position === 'start') {
				queue.addTrackFirst(...data.tracks.map(track => ({ ...track, userData: { requester: interaction.user.id } })))
			} else {
				queue.addTrack(...data.tracks.map(track => ({ ...track, userData: { requester: interaction.user.id } })))
			}

			const embed = new EmbedBuilder()
				.setAuthor({
					name: localize.SHARED.MUSIC.EMBED.ADDED_PLAYLIST_TO_QUEUE(),
					iconURL: interaction.user.avatarURL() ?? '',
				})
				.setTitle(data.info.name)
				.addFields(
					{
						name: `:notes: ${localize.SHARED.MUSIC.EMBED.SONGS()}`,
						value: `${data.tracks.map((track, index) => `${index + 1}. ${track.info.title}`).join('\n')}`,
						inline: false,
					},
					{
						name: `:control_knobs: ${localize.SHARED.MUSIC.EMBED.REQUESTED_BY()}`,
						value: `<@${interaction.user.id}>`,
						inline: true,
					}
				)
				.setColor(guildData?.color ? Number.parseInt(guildData.color.replace('#', ''), 16) : '#2600ff')
				.setFooter({
					text: client.user?.username ?? 'Cyberca.de Bot',
					iconURL: client.user?.avatarURL() ?? 'https://cdn.discordapp.com/embed/avatars/1.png',
				})
				.setTimestamp()

			if (data.tracks[0].info.artworkUrl) embed.setThumbnail(data.tracks[0].info.artworkUrl)

			if (isLink) {
				if (input.startsWith('https://www.youtube.com/playlist')) {
					embed.setURL(input)
				}

				if (input.startsWith('https://www.youtube.com/watch')) {
					const playlistLink = input.split('list=')[1]
					embed.setURL(`https://www.youtube.com/playlist?list=${playlistLink}`)
				}
			}

			await interaction.followUp({ embeds: [embed] })
		}

		if (!queue.isPlaying) {
			await queue.playNext()
		}
	}

}
