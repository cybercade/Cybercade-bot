import { Category } from '@discordx/utilities'
import { CommandInteraction } from 'discord.js'
import { Client } from 'discordx'
import { lavaPlayerManager } from 'src/services/MusicManager'

import { generalConfig } from '@/configs'
import { Discord, Injectable, Slash, SlashGroup } from '@/decorators'
import { Guild } from '@/entities'
import { Database } from '@/services'
import { simpleErrorEmbed } from '@/utils/functions'

@Discord()
@Injectable()
@Category('General')
@SlashGroup('music')
export default class SaveCommand {

	constructor(
		private db: Database
	) {}

	@Slash({
		name: 'save',
		localizationSource: 'COMMANDS.MUSIC.SAVE',
	})
	async save(
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
		if (guildData) {
			await queue.saveSong(interaction, client, guildData)
		}

		if (!interaction.channel?.isDMBased()) {
			await interaction.followUp({ content: localize.SHARED.MUSIC.EMBED.SONG_SAVED(), ephemeral: true })
		}
	}

}
