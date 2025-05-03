// src/services/Manager.ts
import { Client } from 'discordx'
import * as dotenv from 'dotenv'
import type { INode, Player, Track } from 'moonlink.js'
import { Manager } from 'moonlink.js'
import { delay, inject } from 'tsyringe'

import { Injectable, Service } from '@/decorators'

dotenv.config() // Lade Umgebungsvariablen aus .env

@Service()
@Injectable()
export class MoonlinkService {

	public manager: Manager | null = null

	// Injiziere den discord.js Client, den tscord verwaltet
	constructor(
		@inject(delay(() => Client)) private client: Client
	) {}

	// Diese Methode wird später von Main.ts aufgerufen, nachdem der Client ready ist
	initialize() {
		if (!this.client.user) {
			console.error('[MoonlinkService] Client not ready yet.')

			return
		}
		if (this.manager) {
			console.warn('[MoonlinkService] Moonlink Manager already initialized.')

			return
		}

		const nodes: INode[] = [
			{
				host: 'lava-all.ajieblogs.eu.org',
				port: 80,
				password: 'https://dsc.gg/ajidevserver',
				secure: false,
				identifier: 'AjieDev-LDP-NonSSL', // Eindeutiger Name für den Node
			},
		]

		this.manager = new Manager({
			nodes,
			sendPayload: (guildId: any, payload: any) => {
				const guild = this.client.guilds.cache.get(guildId)
				if (guild) guild.shard.send(JSON.parse(payload))
			},
			options: {
				autoResume: true,
			},
		})

		console.log('[MoonlinkService] Moonlink Manager created.')

		// Event Listener für Moonlink (optional, aber nützlich für Debugging)
		this.manager.on('nodeCreate', (node: INode) => {
			console.log(`[Moonlink] Node "${node.identifier}" created.`)
		})

		this.manager.on('nodeConnected', (node: INode) => {
			console.log(`[Moonlink] Node "${node.identifier}" connected.`)
		})

		this.manager.on('nodeError', (node: INode, error: any) => {
			console.error(`[Moonlink] Node "${node.identifier}" error:`, error)
		})

		this.manager.on('trackStart', (player: Player, track: Track) => {
			console.log(`[Moonlink] Player ${player.guildId} started playing: ${track.title}`)
			// Hier könntest du eine "Now Playing"-Nachricht senden
			// const channel = this.client.channels.cache.get(player.textChannel) as TextChannel;
			// if (channel) channel.send(`Now playing: ${track.title}`);
		})

		this.manager.on('queueEnd', (player: Player) => {
			console.log(`[Moonlink] Player ${player.guildId} queue ended.`)
			// Hier könntest du den Bot den Voice Channel verlassen lassen
			// setTimeout(() => player.destroy(), 30000); // Zerstöre nach 30s Inaktivität
		})

		this.client.on('raw', (packet) => {
			this.manager?.packetUpdate(packet)
		})

		this.manager.init(this.client.user.id)
		// In neueren Versionen wird das oft intern beim Instanziieren gemacht.
		// Prüfe die Moonlink Doku deiner Version!

		console.log('[MoonlinkService] Moonlink Manager initialization sequence complete.')
	}

	// Hilfsmethode, um sicherzustellen, dass der Manager initialisiert ist
	public getManager(): Manager {
		if (!this.manager) {
			throw new Error('Moonlink Manager is not initialized yet!')
		}

		return this.manager
	}

}