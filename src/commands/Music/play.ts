import { LoadType } from '@discordx/lava-player'
import { fromMS } from '@discordx/lava-queue'
import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder, GuildMember, VoiceBasedChannel } from 'discord.js'
import { Client } from 'discordx'

import { generalConfig } from '@/configs'
import { Discord, Injectable, Slash, SlashChoice, SlashGroup, SlashOption } from '@/decorators'
import { Guild } from '@/entities'
import { Database, MoonlinkService } from '@/services'
import { simpleErrorEmbed } from '@/utils/functions'

@Discord()
@Injectable()
@Category('General')
@SlashGroup('music')
export default class PlayCommand {

	constructor(
		private db: Database,
		private moonlinkService: MoonlinkService
	) { }

	@Slash({
		name: 'play',
		localizationSource: 'COMMANDS.MUSIC.PLAY',
	})
	@Slash({
		name: 'p',
	})
	async play(
		@SlashOption({
			name: 'input',
			localizationSource: 'COMMANDS.MUSIC.PLAY.OPTIONS.INPUT',
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		input: string,
		@SlashChoice({
			name: 'Als letztes',
			value: 'end',
			localizationSource: 'COMMANDS.MUSIC.PLAY.OPTIONS.POSITION.END',
		})
		@SlashChoice({
			name: 'Als nächstes',
			value: 'start',
			localizationSource: 'COMMANDS.MUSIC.PLAY.OPTIONS.POSITION.START',
		})
		@SlashOption({
			name: 'position',
			type: ApplicationCommandOptionType.String,
			required: false,
			localizationSource: 'COMMANDS.MUSIC.PLAY.OPTIONS.POSITION',
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

		const member = interaction.member as GuildMember
		const voiceChannel = member.voice.channel as VoiceBasedChannel

		if (!voiceChannel || !interaction.guildId) {
			return interaction.reply({ content: 'Du musst in einem Voice Channel sein, um Musik abzuspielen!', ephemeral: true })
		}

		// Hole den initialisierten Moonlink Manager
		const manager = this.moonlinkService.getManager() // Nutzt die Hilfsmethode für Check
		if (!manager) {
			return interaction.reply({ content: 'Der Musik-Service ist noch nicht bereit. Bitte versuche es später erneut.', ephemeral: true })
		}

		await interaction.deferReply()

		const guildData = await this.db.get(Guild).findOne({ id: interaction.guildId })

		const results = await manager.search({
			query: input,
			requester: interaction.user,
		})

		if (!results || results.loadType === 'error' || results.loadType === 'empty') {
			return interaction.editReply(`Konnte keine Ergebnisse für "${input}" finden.`)
		}

		// Erstelle oder hole den Player für diesen Server
		const player = manager.createPlayer({
			guildId: interaction.guildId,
			voiceChannelId: voiceChannel.id,
			textChannelId: interaction.channelId, // Optional: Kanal für "Now Playing" Nachrichten
			// selfDeaf: true, // Optional: Bot taub schalten
			// selfMute: false, // Optional: Bot stumm schalten
		})

		// Verbinde den Player mit dem Voice Channel (wenn nicht schon verbunden)
		if (!player.connected) {
			player.connect({
				setDeaf: false,
			}) // Bot taub schalten ist üblich
		}

		const track = results.tracks[0]
		player.queue.add(track)

		// Starte die Wiedergabe, wenn der Player nicht bereits spielt
		if (!player.playing && !player.paused) {
			await player.play()
		}

		console.log(player)

		// Bestätige dem User
		await interaction.editReply(`Track **${track.title}** zur Warteschlange hinzugefügt.`)

		// clearTimeout(cmd.autoDeleteTimer)
		// const { queue } = cmd

		// const isLink = input.startsWith('http://') || input.startsWith('https://')
		// const searchText = isLink ? input : `ytmsearch:${input}`
		// const { loadType, data } = await queue.search(searchText)

		// if (loadType === LoadType.ERROR) {
		// 	await interaction.followUp({
		// 		content: `${localize.ERRORS.UNKNOWN()} - ${data.cause}`,
		// 	})

		// 	return
		// }

		// if (loadType === LoadType.EMPTY) {
		// 	await interaction.followUp({
		// 		content: localize.ERRORS.MUSIC.NO_MATCHES(),
		// 	})

		// 	return
		// }

		// // Handle songs and searches
		// if (loadType === LoadType.TRACK || loadType === LoadType.SEARCH) {
		// 	const track = loadType === LoadType.SEARCH ? data[0] : data
		// 	if (!track) {
		// 		await interaction.followUp({
		// 			content: localize.ERRORS.MUSIC.NO_MATCHES(),
		// 		})

		// 		return
		// 	}

		// 	if (position === 'start') {
		// 		queue.addTrackFirst({ ...track, userData: { requester: interaction.user.id } })
		// 	} else {
		// 		queue.addTrack({ ...track, userData: { requester: interaction.user.id } })
		// 	}

		// 	const embed = new EmbedBuilder()
		// 		.setAuthor({
		// 			name: localize.SHARED.MUSIC.EMBED.ADDED_TO_QUEUE(),
		// 			iconURL: interaction.user.avatarURL() ?? '',
		// 		})
		// 		.setTitle(track.info.title)
		// 		.setURL(track.info.uri ?? '')
		// 		.addFields(
		// 			{
		// 				name: `:microphone: ${localize.SHARED.MUSIC.EMBED.INTERPRETER()}`,
		// 				value: track.info.author,
		// 				inline: false,
		// 			},
		// 			{
		// 				name: `:hourglass: ${localize.SHARED.MUSIC.EMBED.LENGTH()}`,
		// 				value: fromMS(track.info.length),
		// 				inline: true,
		// 			},
		// 			{
		// 				name: `:control_knobs: ${localize.SHARED.MUSIC.EMBED.REQUESTED_BY()}`,
		// 				value: `<@${interaction.user.id}>`,
		// 				inline: true,
		// 			}
		// 		)
		// 		.setColor(guildData?.color ? Number.parseInt(guildData.color.replace('#', ''), 16) : '#2600ff')
		// 		.setFooter({
		// 			text: client.user?.username ?? 'Cyberca.de Bot',
		// 			iconURL: client.user?.avatarURL() ?? 'https://cdn.discordapp.com/embed/avatars/1.png',
		// 		})
		// 		.setTimestamp()

		// 	if (track.info.artworkUrl) embed.setThumbnail(track.info.artworkUrl)

		// 	await interaction.followUp({ embeds: [embed] })
		// }

		// // Handle playlists
		// if (loadType === LoadType.PLAYLIST) {
		// 	if (position === 'start') {
		// 		queue.addTrackFirst(...data.tracks.map(track => ({ ...track, userData: { requester: interaction.user.id } })))
		// 	} else {
		// 		queue.addTrack(...data.tracks.map(track => ({ ...track, userData: { requester: interaction.user.id } })))
		// 	}

		// 	const embed = new EmbedBuilder()
		// 		.setAuthor({
		// 			name: localize.SHARED.MUSIC.EMBED.ADDED_PLAYLIST_TO_QUEUE(),
		// 			iconURL: interaction.user.avatarURL() ?? '',
		// 		})
		// 		.setTitle(data.info.name)
		// 		.addFields(
		// 			{
		// 				name: `:notes: ${localize.SHARED.MUSIC.EMBED.SONGS()}`,
		// 				value: `${data.tracks.map((track, index) => `${index + 1}. ${track.info.title}`).join('\n')}`,
		// 				inline: false,
		// 			},
		// 			{
		// 				name: `:control_knobs: ${localize.SHARED.MUSIC.EMBED.REQUESTED_BY()}`,
		// 				value: `<@${interaction.user.id}>`,
		// 				inline: true,
		// 			}
		// 		)
		// 		.setColor(guildData?.color ? Number.parseInt(guildData.color.replace('#', ''), 16) : '#2600ff')
		// 		.setFooter({
		// 			text: client.user?.username ?? 'Cyberca.de Bot',
		// 			iconURL: client.user?.avatarURL() ?? 'https://cdn.discordapp.com/embed/avatars/1.png',
		// 		})
		// 		.setTimestamp()

		// 	if (data.tracks[0].info.artworkUrl) embed.setThumbnail(data.tracks[0].info.artworkUrl)

		// 	if (isLink) {
		// 		if (input.startsWith('https://www.youtube.com/playlist')) {
		// 			embed.setURL(input)
		// 		}

		// 		if (input.startsWith('https://www.youtube.com/watch')) {
		// 			const playlistLink = input.split('list=')[1]
		// 			embed.setURL(`https://www.youtube.com/playlist?list=${playlistLink}`)
		// 		}
		// 	}

		// 	await interaction.followUp({ embeds: [embed] })
		// }

		// if (!queue.isPlaying) {
		// 	await queue.playNext()
		// }
	}

}
