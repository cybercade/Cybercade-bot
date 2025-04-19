import { Category } from '@discordx/utilities'
import { ButtonInteraction, CommandInteraction, ModalSubmitInteraction, TextChannel } from 'discord.js'
import { Client, ComponentOptions, Guard, Guild } from 'discordx'

import { ButtonComponent, Discord, ModalComponent, Slash } from '@/decorators'
import { env } from '@/env'
import { GuildOnly } from '@/guards'
import { getLocaleFromInteraction, L } from '@/i18n'

import { processApplication, sendApplicationModal } from './application-function'

@Discord()
@Category('General')
export default class ApplicationCommand {

	@Guild('791018916196778034') // Make Command ArisCorp-Only

	@ButtonComponent({ id: 'acceptApplication' })
	async handleAcceptButton(interaction: ButtonInteraction): Promise<void> {
		// Get the username from the channel name
		// @ts-expect-error
		const channelName = interaction.channel.name
		const username = channelName.replace(`${L[getLocaleFromInteraction(interaction)].COMMANDS.APPLICATION.CHANNEL_PREFIX()}-`, '')

		// Give user applicant role
		const member = interaction.guild?.members.cache.find(m => m.user.username.toLowerCase() === username.toLowerCase())

		try {
			// Give the user the applicant role
			await member?.roles.add(env.ARISCORP_APPLICANT_ROLE_ID as string)
			// Send a message to the user
			interaction.reply(L[getLocaleFromInteraction(interaction)].COMMANDS.APPLICATION.ACCEPTED_MESSAGE())

			// Send a message to the internal channel
			const internalChannel = interaction.guild?.channels.cache.get(env.ARISCORP_INTERNAL_CHANNEL_ID as string) as TextChannel
			internalChannel?.send(L[getLocaleFromInteraction(interaction)].COMMANDS.APPLICATION.ANNOUNCE_APPLICANT({
				user_id: member?.id || '',
			}))
		} catch (error) {
			console.error(error)
			interaction.reply('An error occurred while trying to give the user the applicant role.')
		}
	}

	@ButtonComponent({ id: 'rejectApplication' })
	async handleRejectButton(interaction: ButtonInteraction): Promise<void> {
		// Logic for rejecting the application
	}

	@Slash({ name: 'application' })
	@Guard(GuildOnly)
	async application(
		interaction: CommandInteraction,
		client: Client
	) {
		// Use the localized strings in your modal
		await sendApplicationModal(interaction)
	}

	@ModalComponent({ id: 'applicationModal' } as ComponentOptions)
	async applicationForm(
		interaction: ModalSubmitInteraction
	): Promise<void> {
		// Process the application using localized strings
		await processApplication(interaction)
	}

}
