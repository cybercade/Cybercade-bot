import { Category } from '@discordx/utilities'
import { CommandInteraction, EmbedBuilder } from 'discord.js'
import { Client } from 'discordx'
import Parser from 'rss-parser'

import { Discord, Slash } from '@/decorators'

const parser = new Parser()

@Discord()
@Category('RSS')
export default class RssStatusCommand {

	@Slash({
		name: 'rssstatus',
	})
	async rssstatus(
		interaction: CommandInteraction,
		client: Client,
		{ localize }: InteractionData
	): Promise<void> {
		interaction.deferReply({ ephemeral: true })

		const feedUrl = interaction.options.getString('feedurl', true)

		try {
			const feed = await parser.parseURL(feedUrl)
			if (!feed.items || feed.items.length === 0) {
				await interaction.followUp('Im angegebenen RSS-Feed wurden keine Artikel gefunden.')

				return
			}
			const latestItem = feed.items[0]

			const embed = new EmbedBuilder()
				.setTitle(latestItem.title || 'Unbekannter Titel')
				.setDescription(latestItem.contentSnippet || 'Keine Beschreibung vorhanden.')
				.addFields({ name: 'Veröffentlicht am', value: latestItem.pubDate || 'Unbekannt', inline: true })
				.setColor(0x00AE86)
				.setFooter({ text: 'Powered by DiscBot Team ❤' })

			await interaction.followUp({ embeds: [embed] })
		} catch (error) {
			await interaction.followUp({ content: 'Beim Abrufen des RSS-Feeds ist ein Fehler aufgetreten.', ephemeral: true })
		}
	}

}
