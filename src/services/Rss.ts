import { TextChannel } from 'discord.js'
import { Client } from 'discordx'
import type { Item } from 'rss-parser'
import RSSParser from 'rss-parser'

import { Schedule, Service } from '@/decorators'
import { RssSubscription } from '@/entities'

import { Database } from './Database'

@Service()
export class RssService {

	private isChecking = false

	constructor(
		private db: Database,
		// Nimm den Discord-Client im Konstruktor entgegen (Dependency Injection)
		private discordClient: Client
	) { }

	@Schedule('*/1 * * * *')
	async checkRssUpdates() {
		if (!this.isChecking) {
			this.isChecking = true

			const parser = new RSSParser()

			const subsRepo = this.db.get(RssSubscription)
			const subscriptions = await subsRepo.findAll()

			await subscriptions.map(async (sub) => {
				await parser.parseURL(sub.feedUrl, async (err, feed) => {
					if (err) throw err

					if (feed.items.length <= 0) {
						return
					}

					const subObject = await subsRepo.findOne({ id: sub.id })

					if (!subObject) {
						console.error(`Subscription with ID ${sub.id} not found`)

						return
					}

					const posts = [] as Item[]

					if (!sub.lastItem) {
						const lastItem = feed.items[0]

						if (!lastItem || !lastItem.guid) {
							throw new Error('lastItem is null')
						}

						posts.push(lastItem)

						await this.sendPostsToDiscord(sub, posts)

						subObject.lastItem = lastItem.guid

						this.db.em.persistAndFlush(subObject)

						return
					}

					const newPosts = feed.items.slice(0, feed.items.findIndex(item => item.guid === sub.lastItem)).reverse()
					console.log(newPosts)
					posts.push(...newPosts)

					if (posts.length > 0) {
						const latestItem = posts[posts.length - 1]
						if (!latestItem || !latestItem.guid) {
							throw new Error('latestItem is null')
						}

						await this.sendPostsToDiscord(sub, posts)
						subObject.lastItem = latestItem.guid
						this.db.em.persistAndFlush(subObject)
					}

					// console.log(feed)
					// if (subObject && feed.items[0]?.guid) {
					// 	// Send the message to the channel
					// 	const channel = await this.discordClient.channels.fetch(sub.channelId) as TextChannel
					// 	await channel.send(`${feed.title} - ${feed.items[0].title}`)

					// 	// Update the lastItem in the database
					// 	subObject.lastItem = feed.items[0].guid
					// 	this.db.em.persistAndFlush(subObject)
					// } else {
					// 	throw new Error('subObject is null or feed item link is undefined')
					// }
				})
			})

			this.isChecking = false
		}
	}

	async sendPostsToDiscord(sub: RssSubscription, posts: Item[]) {
		const channel = await this.discordClient.channels.fetch(sub.channelId) as TextChannel
		if (!channel) {
			console.error(`Channel with ID ${sub.channelId} not found`)

			return
		}
		for (const post of posts) {
			if (post.link) {
				await channel.send(`${sub.feedUrl} - ${post.title} - ${post.link}`)
			} else {
				console.error(`Post link is undefined for post: ${JSON.stringify(post)}`)
			}
		}
	}

}
