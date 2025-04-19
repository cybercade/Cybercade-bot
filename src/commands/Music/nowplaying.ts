import { LoadType } from '@discordx/lava-player'
import { fromMS } from '@discordx/lava-queue'
import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, Message } from 'discord.js'
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
export default class QueueCommand {

	constructor(
		private db: Database
	) {}

	@Slash({
		name: 'nowplaying',
		localizationSource: 'COMMANDS.MUSIC.NOWPLAYING',
	})
	@Slash({
		name: 'np',
	})
	async queue(
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
		await queue.view(interaction, client, guildData)
	}

}
