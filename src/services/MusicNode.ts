import type {
	VoiceServerUpdate,
	VoiceStateUpdate,
} from '@discordx/lava-player'
import { Node } from '@discordx/lava-player'
import { GatewayDispatchEvents } from 'discord.js'
import type { Client } from 'discordx'

import { Service } from '@/decorators'

@Service()
export class MusicNode {

	public getNode(client: Client): Node {
		const nodeX = new Node({
			host: {
				address: 'lava.inzeworld.com',
				connectionOptions: { sessionId: client.botId, passphrase: 'saher.inzeworld.com' },
				port: 3128,
				secure: false,
			},

			// your Lavalink password
			password: 'saher.inzeworld.com',

			send(guildId, packet) {
				const guild = client.guilds.cache.get(guildId)
				if (guild) {
					guild.shard.send(packet)
				}
			},
			userId: client.user?.id ?? '', // the user id of your bot
		})

		console.log(nodeX)

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