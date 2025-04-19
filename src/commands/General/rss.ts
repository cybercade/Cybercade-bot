import { Category } from '@discordx/utilities'
import { ApplicationCommandOptionType, CommandInteraction, Message } from 'discord.js'
import { Client, Guard } from 'discordx'
import { Database } from '@/services'

import { Discord, Injectable, Slash, SlashGroup, SlashOption } from '@/decorators'
import { RssSubscription } from '@/entities'
import { GuildOnly } from '@/guards'

@Discord()
@Injectable()
@Guard(GuildOnly)
@Category('General')
@SlashGroup({ name: 'rss' })
@SlashGroup('rss')
export default class RssCommand {

    constructor(
        private db: Database
    ) { }

    @Slash({
        name: 'subscribe',
    })
    async subscribe (
        @SlashOption({ name: 'url', required: true, type: ApplicationCommandOptionType.String })
        url: string,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ) {
        await interaction.deferReply({ ephemeral: true })

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            await interaction.editReply('Bitte gib eine gültige URL an.')
            return
        }
        if (!interaction.guildId) {
            await interaction.editReply('Dieser Befehl kann nur in einem Server verwendet werden.')
            return
        }

        try {
            const subscriptionsRepo = this.db.get(RssSubscription)

            const subscription = new RssSubscription()
            subscription.channelId = interaction.channelId
            
            subscription.guildId = interaction.guildId
            subscription.feedUrl = url

            await subscriptionsRepo.insert(subscription)
            await interaction.editReply('Du hast erfolgreich den RSS Feed abonniert.')
        } catch (e) {
            console.error(e)
            await interaction.editReply('Es gab einen Fehler beim Abonnieren des RSS Feeds.')
        }
    }

    @Slash({
        name: 'delete',
    })
    async delete (
        @SlashOption({ name: 'id', required: true, type: ApplicationCommandOptionType.Number })
        id: number,
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ) {
        await interaction.deferReply({ ephemeral: true })

        try {
            const subscriptionsRepo = this.db.get(RssSubscription)

            const subscription = await subscriptionsRepo.findOne({ id })

            if(!subscription) {
                await interaction.editReply('Der RSS Feed existiert nicht.')
                return
            }

            await this.db.em.removeAndFlush(subscription)

            await interaction.editReply('Du hast erfolgreich den RSS Feed gelöscht.')
        } catch (e) {
            console.error(e)
            await interaction.editReply('Es gab einen Fehler beim löschen des RSS Feeds.')
        }
    }

    @Slash({
        name: 'list',
    })
    async list (
        interaction: CommandInteraction,
        client: Client,
        { localize }: InteractionData
    ) {
        await interaction.deferReply({ ephemeral: true })

        try {
            const subscriptionsRepo = this.db.get(RssSubscription)

            const subscriptions = await subscriptionsRepo.findAll()

            await interaction.editReply(`${JSON.stringify(subscriptions)}`)
        } catch (e) {
            console.error(e)
            await interaction.editReply('Es gab einen Fehler beim anzeigen der RSS Feeds.')
        }
    }

}
