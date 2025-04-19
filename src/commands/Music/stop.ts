import { LoadType } from '@discordx/lava-player'
import { fromMS } from '@discordx/lava-queue'
import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, Message } from 'discord.js'
import { Client } from 'discordx'
import { lavaPlayerManager } from 'src/services/MusicManager'

import { generalConfig } from '@/configs'
import { Discord, Injectable, Slash } from '@/decorators'
import { simpleErrorEmbed } from '@/utils/functions'

@Discord()
@Injectable()
@Category('General')
export default class StopCommand {

	@Slash({
		name: 'stop',
	})
	async stop(
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
		await queue.exit()

		interaction.followUp({ content: localize.SHARED.MUSIC.EMBED.STOPPED_PLAYING(), ephemeral: true })
	}

}
