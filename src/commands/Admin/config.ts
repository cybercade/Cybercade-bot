import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js'
import { Client } from 'discordx'

import { generalConfig } from '@/configs'
import { Discord, Injectable, Slash, SlashGroup, SlashOption } from '@/decorators'
import { Guild } from '@/entities'
import { UnknownReplyError } from '@/errors'
import { Guard, GuildOnly, Match, UserPermissions } from '@/guards'
import { L } from '@/i18n'
import { Database } from '@/services'
import { resolveGuild, simpleSuccessEmbed } from '@/utils/functions'

@Discord()
@Injectable()
@Category('Admin')
@Guard(
	UserPermissions(['Administrator'])
)
@SlashGroup({ localizationSource: 'COMMANDS.CONFIG', name: 'config' })
@SlashGroup({
	localizationSource: 'COMMANDS.CONFIG.SET',
	name: 'set',
	root: 'config', // need to specify root
})
export default class ConfigCommand {

	constructor(
		private db: Database
	) {}

	@Slash({ localizationSource: 'COMMANDS.CONFIG.SET.PRIMARY_COLOR' })
	@SlashGroup('set', 'config')
	@Guard(
		GuildOnly
	)
	async primarycolor(
		@SlashOption({
			name: 'color',
			localizationSource: 'COMMANDS.CONFIG.SET.PRIMARY_COLOR.OPTIONS.COLOR',
			type: ApplicationCommandOptionType.String,
			required: true,
		}) color: string | undefined,
			interaction: CommandInteraction,
			client: Client,
			{ localize }: InteractionData
	) {
		const guild = await resolveGuild(interaction)

		if (!guild || !guild.id) {
			throw new UnknownReplyError(interaction)
		}

		if (color?.match(/^#?(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
			const guildRepo = this.db.get(Guild)
			const guildData = await guildRepo.findOne({ id: guild.id })

			if (guildData) {
				guildData.primaryColor = color
				await this.db.em.persistAndFlush(guildData)

				interaction.reply({ content: localize.COMMANDS.CONFIG.SET.PRIMARY_COLOR.OPTIONS.EMBED.DESCRIPTION({ prefix: generalConfig.simpleCommandsPrefix }), ephemeral: true })
			} else {
				throw new UnknownReplyError(interaction)
			}
		} else {
			interaction.reply({ content: localize.COMMANDS.CONFIG.SET.PRIMARY_COLOR.OPTIONS.EMBED.REGEX_ERROR(), ephemeral: true })
		}
	}

}
