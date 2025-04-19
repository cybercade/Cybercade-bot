import { LoadType } from '@discordx/lava-player'
import { fromMS } from '@discordx/lava-queue'
import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, Message } from 'discord.js'
import { Client } from 'discordx'
import { lavaPlayerManager } from 'src/services/MusicManager'

import { generalConfig } from '@/configs'
import { Discord, Injectable, Slash, SlashGroup } from '@/decorators'
import { simpleErrorEmbed } from '@/utils/functions'

@Discord()
@Injectable()
@Category('General')
@SlashGroup('music')
export default class SkipCommand {

	@Slash({
		name: 'skip',
		localizationSource: 'COMMANDS.MUSIC.SKIP',
	})
	async skip(
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

		clearTimeout(cmd.autoDeleteTimer)
		const { queue } = cmd
		await queue.playNext()

		interaction.followUp({ content: localize.SHARED.MUSIC.EMBED.SKIPPED(), ephemeral: true })
	}

}
