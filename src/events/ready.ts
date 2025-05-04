import { ActivityType } from 'discord.js'
import { Client } from 'discordx'

import { generalConfig } from '@/configs'
import { Discord, Injectable, On, Once, Schedule } from '@/decorators'
import { Data } from '@/entities'
import { Database, Logger, MoonlinkService, Scheduler, Store } from '@/services'
import { resolveDependency, syncAllGuilds } from '@/utils/functions'

@Discord()
@Injectable()
export default class ReadyEvent {

	constructor(
		private db: Database,
		private logger: Logger,
		private scheduler: Scheduler,
		private store: Store,
		private moonlink: MoonlinkService
	) { }

	private activityIndex = 0

	@Once('ready')
	async readyHandler([client]: [Client]) {
		// make sure all guilds are cached
		await client.guilds.fetch()

		// synchronize applications commands with Discord
		await client.initApplicationCommands()

		// change activity
		await this.changeActivity()

		// update last startup time in the database
		await this.db.get(Data).set('lastStartup', Date.now())

		// start scheduled jobs
		this.scheduler.startAllJobs()

		// log startup
		await this.logger.logStartingConsole()

		// synchronize guilds between discord and the database
		await syncAllGuilds(client)

		// the bot is fully ready
		this.store.update('ready', e => ({ ...e, bot: true }))

		// Initialisiere den Moonlink Manager, nachdem der Client bereit ist
		try {
			await this.moonlink.initialize()
			this.logger.log('[Main] Moonlink Service initialized via onReady.')
		} catch (error) {
			this.logger.log(`[Main] Failed to initialize Moonlink Service: ${error}`, 'error')
		}

		// start the music queue if music player is enabled
		// if (generalConfig.musicPlayer === true) {
		// 	lavaPlayerManager.instance = new QueueManager(getNode(client))
		// }
	}

	@Schedule('*/15 * * * * *') // each 15 seconds
	async changeActivity() {
		const ActivityTypeEnumString = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'CUSTOM', 'COMPETING'] // DO NOT CHANGE THE ORDER

		const client = await resolveDependency(Client)
		const activity = generalConfig.activities[this.activityIndex]

		if (activity.type === 'STREAMING') { // streaming activity
			client.user?.setStatus('online')
			client.user?.setActivity(activity.text, {
				url: 'https://www.twitch.tv/discord',
				type: ActivityType.Streaming,
			})
		} else { // other activities
			client.user?.setActivity(activity.text, {
				type: ActivityTypeEnumString.indexOf(activity.type),
			})
		}

		this.activityIndex++
		if (this.activityIndex === generalConfig.activities.length)
			this.activityIndex = 0
	}

}
