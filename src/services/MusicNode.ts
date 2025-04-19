import type {
	VoiceServerUpdate,
	VoiceStateUpdate,
} from '@discordx/lava-player'
import { Node } from '@discordx/lava-player'
import { GatewayDispatchEvents } from 'discord.js'
import type { Client } from 'discordx'

import { Service } from '@/decorators'
import { env } from '@/env'

@Service()
export class MusicNode {

	public getNode(client: Client): Node {
		const nodeX = new Node({
			host: {
				address: env.LAVA_HOST ?? 'localhost',
				connectionOptions: { sessionId: client.botId },
				port: env.LAVA_PORT ? Number(env.LAVA_PORT) : 2333,
				secure: false,
			},

			// your Lavalink password
			password: env.LAVA_PASSWORD ?? 'youshallnotpass',

			send(guildId, packet) {
				const guild = client.guilds.cache.get(guildId)
				if (guild) {
					guild.shard.send(packet)
				}
			},
			userId: client.user?.id ?? '', // the user id of your bot
		})

		client.ws.on(
			GatewayDispatchEvents.VoiceStateUpdate,
			(data: VoiceStateUpdate) => {
				void nodeX.voiceStateUpdate(data)
			}
		)

		client.ws.on(
			GatewayDispatchEvents.VoiceServerUpdate,
			(data: VoiceServerUpdate) => {
				void nodeX.voiceServerUpdate(data)
			}
		)

		return nodeX
	}

}

export const getNode = MusicNode.prototype.getNode