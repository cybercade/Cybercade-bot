import { Category } from '@discordx/utilities'
import { ButtonInteraction, CommandInteraction, EmbedBuilder, GuildMember, VoiceBasedChannel } from 'discord.js'
import { Client } from 'discordx'

import { generalConfig } from '@/configs'
import { Discord, Injectable, Slash, SlashGroup } from '@/decorators'
import { Guild } from '@/entities'
import { getLocaleFromInteraction, L } from '@/i18n'
import { Database, MoonlinkService } from '@/services'
import { formatDuration, simpleErrorEmbed } from '@/utils/functions'

@Discord()
@Injectable()
@Category('General')
@SlashGroup('music')
export default class SaveCommand {

	constructor(
		private db: Database,
		private moonlinkService: MoonlinkService
	) {}

	public async saveSong(
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

		const track = player.current
		const dmChannel = await interaction.user.createDM()

		const embed = new EmbedBuilder()
			.setAuthor({
				name: L[locale].SHARED.MUSIC.EMBED.SAVED_SONG(),
				iconURL: interaction.user.avatarURL() ?? '',
			})
			.setTitle(track.title)
			.addFields(
				{
					name: `:microphone: ${L[locale].SHARED.MUSIC.EMBED.INTERPRETER()}`,
					value: track.author,
					inline: false,
				},
				{
					name: `:hourglass: ${L[locale].SHARED.MUSIC.EMBED.LENGTH()}`,
					value: formatDuration(track.duration),
					inline: true,
				},
				{
					name: `:control_knobs: ${L[locale].SHARED.MUSIC.EMBED.REQUESTED_BY()}`,
					value: `${track.requestedBy}`,
					inline: true,
				},
				{
					name: `:globe_with_meridians: ${L[locale].SHARED.MUSIC.EMBED.SONG_URL()}`,
					value: `\`${track.url}\``,
					inline: false,
				}
			)
			.setColor(guildData?.color ? Number.parseInt(guildData.color.replace('#', ''), 16) : '#2600ff')
			.setFooter({
				text: client.user?.username ?? 'Cyberca.de Bot',
				iconURL: client.user?.avatarURL() ?? 'https://cdn.discordapp.com/embed/avatars/1.png',
			})
			.setTimestamp()

		if (track.artworkUrl) embed.setThumbnail(track.artworkUrl)
		if (track.url) embed.setURL(track.url)

		await dmChannel.send({ embeds: [embed] })
		await interaction.editReply({ content: L[locale].SHARED.MUSIC.EMBED.SONG_SAVED() })
	}

	@Slash({
		name: 'save',
		localizationSource: 'COMMANDS.MUSIC.SAVE',
	})
	async save(
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	) {
		await interaction.deferReply({ ephemeral: true })

		const guildData = await this.db.get(Guild).findOne({ id: interaction.guildId })

		if (guildData) {
			await this.saveSong(interaction, client, guildData)
		}
	}

}
