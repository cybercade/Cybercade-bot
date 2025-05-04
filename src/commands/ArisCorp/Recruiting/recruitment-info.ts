import { Category } from '@discordx/utilities'
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, EmbedBuilder } from 'discord.js'
import { Client, Guard, Guild } from 'discordx'

import { ButtonComponent, Discord, Slash } from '@/decorators'
import { GuildOnly, UserPermissions } from '@/guards'
import { getLocaleFromInteraction, L } from '@/i18n'
import { getColor } from '@/utils/functions'

import { sendApplicationModal } from './application-function'

@Discord()
@Category('Admin')
@Guild('791018916196778034') // Make Command ArisCorp-Only
export default class RecruitmentInfoCommand {

	@ButtonComponent({ id: 'addApplication' })
	@Guard(GuildOnly)
	async handleApplicationButton(
		interaction: ButtonInteraction,
		client: Client
	): Promise<void> {
		// Use the localized function when sending the application modal
		await sendApplicationModal(interaction)
	}

	@Slash({ name: 'recruitment-info' })
	@Guard(UserPermissions(['Administrator']))
	@Guard(GuildOnly)
	async recruitmentInfo(
		interaction: CommandInteraction,
		client: Client
	) {
		const embed = new EmbedBuilder()
			.setAuthor({
				name: 'ArisCorp Management System',
				url: 'https://ams.ariscorp.de',
				iconURL: 'https://cms.ariscorp.de/assets/cb368123-74a3-4021-bb70-2fffbcdd05fa',
			})
			.setTitle('📌 • BewerbungsSystem | Info')
			.setDescription(L[getLocaleFromInteraction(interaction)].COMMANDS.APPLICATION_INFO.INFO())
			.setThumbnail('https://cms.ariscorp.de/assets/3090187e-6348-4290-a878-af1b2b48c114')
			.setColor(getColor('primary'))
			.setFooter({
				text: 'ArisCorp Management System',
				iconURL: 'https://cms.ariscorp.de/assets/cb368123-74a3-4021-bb70-2fffbcdd05fa',
			})
			.setTimestamp()

		const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId('addApplication')
				.setLabel(L[getLocaleFromInteraction(interaction)].COMMANDS.APPLICATION_INFO.BUTTON_APPLY())
				.setStyle(ButtonStyle.Success)
		)

		await interaction.reply({ embeds: [embed], components: [actionRow] })
	}

}
