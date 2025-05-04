// /home/lgruber/Development/Cybercade/cybercade-bot/src/services/MusicManager.ts
import axios, { AxiosError } from 'axios'
import { Client } from 'discordx'
import * as dotenv from 'dotenv'
import type { INode, Player, Track } from 'moonlink.js'
import { Manager } from 'moonlink.js'
import { delay, inject } from 'tsyringe'

import { Injectable, Schedule, Service } from '@/decorators'
import { Logger } from '@/services' // Import Logger

dotenv.config() // Load environment variables from .env

// --- Type Definitions ---

/**
 * Represents the statistics of a Lavalink node.
 */
type NodeStats = {
	players: number
	playingPlayers: number
	uptime: number
	cpu: {
		cores: number
		systemLoad: number
		lavalinkLoad: number
	}
	memory: {
		free: number
		used: number
		allocated: number
		reservable: number
	}
}

/**
 * Represents a single entry in the status history of a Lavalink node.
 */
type StatusHistoryEntry = {
	timestamp: string
	online: boolean
	responseTime: number
	stats?: NodeStats
}

/**
 * Represents information about the Lavalink server itself.
 */
type LavalinkInfo = {
	version: { semver: string }
	sourceManagers: string[]
	plugins: { name: string, version: string }[]
}

/**
 * Represents the structure of a node object received from the API.
 */
type ApiNodeInfo = {
	_id: string
	host: string
	identifier: string
	owner: { discordId: string, username: string }
	password: string
	port: number
	restVersion: string
	secure: boolean
	isConnected: boolean
	statusHistory: StatusHistoryEntry[]
	createdAt: string
	updatedAt: string
	connections?: { players: number, playingPlayers: number }
	cpu?: NodeStats['cpu']
	memory?: NodeStats['memory']
	uptime?: number
	info?: LavalinkInfo
}

/**
 * Represents the structure of the response from the Lavalink node API.
 */
type ApiResponse = {
	nodes: ApiNodeInfo[]
	cached: boolean
}
// --- End Types ---

const TARGET_NODE_COUNT = 3 // Desired number of Lavalink nodes to manage
const API_URL = 'https://lavalink-api.appujet.site/api/nodes' // API Endpoint for fetching nodes

/**
 * Service responsible for managing the Moonlink.js Lavalink client,
 * handling node connections, and providing access to the Lavalink manager.
 */
@Service()
@Injectable()
export class MoonlinkService {

	/**
	 * The Moonlink.js Manager instance. Null until initialized.
	 */
	public manager: Manager | null = null

	/**
	 * Set containing the identifiers of Lavalink nodes actively managed by this service.
	 * This prevents adding duplicate nodes and helps track which nodes to replace.
	 */
	private readonly managedNodeIdentifiers: Set<string> = new Set()

	/** Flag indicating if the initialization process is currently running. */
	private isInitializing = false

	/** Flag indicating if the initial connection and setup have been completed successfully. */
	private initialConnectionDone = false

	/**
	 * Injects dependencies: Discord Client and Logger.
	 * @param client The discordx Client instance.
	 * @param logger The Logger service instance.
	 */
	constructor(
		@inject(delay(() => Client)) private client: Client,
		private logger: Logger
	) {}

	/**
	 * Initializes the Moonlink Manager and connects to initial Lavalink nodes.
	 * This method should be called after the Discord client is ready.
	 * It prevents multiple concurrent initializations.
	 */
	async initialize(): Promise<void> {
		if (this.isInitializing) {
			this.logger.log('[MoonlinkService] Initialization already in progress. Skipping.', 'warn')

			return
		}
		if (this.initialConnectionDone) {
			this.logger.log('[MoonlinkService] Initialization already completed. Skipping.', 'info')

			return
		}

		this.isInitializing = true
		this.logger.log('[MoonlinkService] Initializing Moonlink Manager and Nodes...', 'info')

		if (!this.client.user) {
			this.logger.log('[MoonlinkService] Discord client user not available. Initialization deferred.', 'error')
			this.isInitializing = false // Reset flag

			return
		}

		// Create Manager instance if it doesn't exist
		if (!this.manager) {
			this.manager = new Manager({
				nodes: [], // Start empty, nodes added via API
				sendPayload: (guildId: string, payload: any) => {
					const guild = this.client.guilds.cache.get(guildId)
					// Moonlink might pass objects directly, no need to parse if not a string
					const packetToSend = typeof payload === 'string' ? JSON.parse(payload) : payload
					if (guild) {
						guild.shard.send(packetToSend)
					} else {
						this.logger.log(`[MoonlinkService] Guild ${guildId} not found in cache for sendPayload.`, 'warn')
					}
				},
				options: {
					autoResume: true, // Automatically resume playback state if possible
				},
				// Optional: Define default search platform
				// defaultSearchPlatform: "ytsearch",
			})
			this.logger.log('[MoonlinkService] Moonlink Manager created.', 'info')
			this.setupManagerListeners() // Setup listeners immediately after creation
		} else {
			this.logger.log('[MoonlinkService] Moonlink Manager already exists. Skipping creation.', 'warn')
		}

		// Setup raw packet listener (ensure it's only added once)
		this.client.off('raw', this.handleRawPacket) // Remove potential existing listener
		this.client.on('raw', this.handleRawPacket)
		this.logger.log('[MoonlinkService] Raw packet listener attached.', 'info')

		try {
			// Fetch and add initial nodes from the API
			await this.fetchAndAddInitialNodes()

			// Add a small delay before initializing the manager to allow node connections to potentially establish
			const delaySeconds = 2
			this.logger.log(`[MoonlinkService] Delaying manager initialization (${delaySeconds}s)...`, 'info')
			await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000))

			// Initialize the manager with the client user ID
			if (this.manager) {
				const nodesInCache = Array.from(this.manager.nodes.cache.values()).map(n => ({ id: n.identifier, host: n.host, connected: n.connected }))
				this.logger.log(`[MoonlinkService] Nodes in manager cache before init (${nodesInCache.length}): ${JSON.stringify(nodesInCache)}`, 'info')

				this.manager.init(this.client.user.id)
				this.logger.log(`[MoonlinkService] Manager initialized with User ID: ${this.client.user.id}.`, 'info')
				this.initialConnectionDone = true // Mark initialization as complete
			} else {
				// This case should theoretically not happen if manager creation succeeded
				throw new Error('Manager instance became null before init.')
			}
		} catch (error: any) {
			this.logger.log(`[MoonlinkService] Initialization failed: ${error?.message ?? error}`, 'error')
			// Clean up potentially added nodes if init fails? Maybe not necessary if manager handles it.
		} finally {
			this.isInitializing = false // Ensure flag is reset regardless of success/failure
		}

		if (this.initialConnectionDone) {
			this.logger.log('[MoonlinkService] Moonlink initialization sequence complete.', 'info')
		} else {
			this.logger.log('[MoonlinkService] Moonlink initialization sequence finished with errors.', 'warn')
		}
	}

	/**
	 * Handles raw Discord gateway packets and forwards them to the Moonlink Manager.
	 * Defined as an arrow function to preserve `this` context.
	 * @param packet The raw packet data from the Discord gateway.
	 */
	private handleRawPacket = (packet: any): void => {
		// Only forward if the manager exists and is initialized
		this.manager?.packetUpdate(packet)
	}

	/**
	 * Fetches initial Lavalink nodes from the API and adds them to the manager.
	 * Only fetches nodes if the current count is below the target.
	 */
	private async fetchAndAddInitialNodes(): Promise<void> {
		if (!this.manager) {
			this.logger.log('[MoonlinkService] Manager not available for adding initial nodes.', 'error')

			return
		}

		const currentManagedCount = this.getManagedNodes().length
		const nodesToFetch = TARGET_NODE_COUNT - currentManagedCount
		this.logger.log(`[MoonlinkService] Need to fetch ${nodesToFetch} initial nodes (Target: ${TARGET_NODE_COUNT}, Current: ${currentManagedCount}).`, 'info')

		if (nodesToFetch <= 0) {
			this.logger.log('[MoonlinkService] Already have target number of managed nodes. Skipping initial fetch.', 'info')

			return
		}

		this.logger.log('[MoonlinkService] Fetching initial nodes from API...', 'info')
		const apiNodes = await this.fetchAndSelectNodesFromApi(nodesToFetch)

		if (apiNodes.length === 0) {
			this.logger.log('[MoonlinkService] No suitable initial nodes found from API.', 'warn')

			return
		}

		this.logger.log(`[MoonlinkService] Adding ${apiNodes.length} initial nodes...`, 'info')
		let addedCount = 0
		for (const nodeConfig of apiNodes) {
			if (this.addNodeToManager(nodeConfig)) {
				addedCount++
			}
		}
		this.logger.log(`[MoonlinkService] Successfully added ${addedCount} initial nodes.`, 'info')
	}

	/**
	 * Adds a single Lavalink node configuration to the Moonlink Manager.
	 * Prevents adding nodes with duplicate identifiers.
	 * @param nodeConfig The configuration object for the node to add.
	 * @returns True if the node was added successfully, false otherwise.
	 */
	private addNodeToManager(nodeConfig: INode): boolean {
		if (!this.manager) {
			this.logger.log('[MoonlinkService] Cannot add node: Manager is not initialized.', 'error')

			return false
		}

		// Ensure identifier is set, default to host if missing but log a warning
		const identifier = nodeConfig.identifier || nodeConfig.host
		if (!identifier) {
			this.logger.log(`[MoonlinkService] Node config missing host/identifier, cannot add. Config: ${JSON.stringify(nodeConfig)}`, 'error')

			return false
		}
		if (!nodeConfig.identifier) {
			this.logger.log(`[MoonlinkService] Node config missing 'identifier', using 'host' ("${identifier}") instead. Config: ${JSON.stringify(nodeConfig)}`, 'warn')
		}

		// Check if node with this identifier already exists in the manager or our tracking set
		try {
			if (this.manager.nodes.get(identifier) || this.managedNodeIdentifiers.has(identifier)) {
				this.logger.log(`[MoonlinkService] Node with identifier "${identifier}" already exists or is tracked. Skipping add.`, 'warn')

				return false
			}
		} catch {}

		try {
			// Add the node, ensuring the identifier is explicitly passed
			this.manager.nodes.add({ ...nodeConfig, identifier })
			this.managedNodeIdentifiers.add(identifier) // Track it as managed by us
			this.logger.log(`[MoonlinkService] Node "${identifier}" added to manager. Total managed: ${this.managedNodeIdentifiers.size}`, 'info')

			// Optional: Diagnostic log to verify retrieval after adding
			const addedNode = this.manager.nodes.get(identifier)
			if (addedNode) {
				this.logger.log(`[MoonlinkService] Diagnostic: Node "${identifier}" retrieved post-add. Connected: ${addedNode.connected}`, 'info')
			} else {
				// This indicates a potential issue within Moonlink or timing
				this.logger.log(`[MoonlinkService] Diagnostic WARNING: Node "${identifier}" NOT found in manager immediately after add!`, 'error')
			}

			return true
		} catch (error: any) {
			this.logger.log(`[MoonlinkService] Error adding node "${identifier}" to manager: ${error?.message ?? error}`, 'error')
			// Clean up tracking if add fails
			this.managedNodeIdentifiers.delete(identifier)

			return false
		}
	}

	/**
	 * Removes a Lavalink node from the Moonlink Manager and stops tracking it.
	 * @param identifier The identifier of the node to remove.
	 */
	private removeNodeFromManager(identifier: string): void {
		if (!this.manager) {
			this.logger.log('[MoonlinkService] Cannot remove node: Manager is not initialized.', 'warn')

			return
		}

		const nodeExists = this.manager.nodes.get(identifier)
		const wasTracked = this.managedNodeIdentifiers.has(identifier)

		if (nodeExists) {
			try {
				this.manager.nodes.remove(identifier)
				this.logger.log(`[MoonlinkService] Node "${identifier}" removed from manager.`, 'info')
			} catch (error: any) {
				this.logger.log(`[MoonlinkService] Error removing node "${identifier}" from manager: ${error?.message ?? error}`, 'error')
			}
		} else if (wasTracked) {
			// Node might have disconnected and been removed by Moonlink already, but we were still tracking it
			this.logger.log(`[MoonlinkService] Node "${identifier}" not found in manager but was tracked. Untracking now.`, 'warn')
		} else {
			// Node doesn't exist and wasn't tracked, nothing to do
			this.logger.log(`[MoonlinkService] Node "${identifier}" not found for removal and was not tracked.`, 'info')
		}

		// Always ensure it's removed from our tracking set
		if (wasTracked) {
			this.managedNodeIdentifiers.delete(identifier)
			this.logger.log(`[MoonlinkService] Node "${identifier}" untracked. Total managed: ${this.managedNodeIdentifiers.size}`, 'info')
		}
	}

	/**
	 * Sets up event listeners for the Moonlink Manager instance.
	 * Handles node status changes and player events.
	 */
	private setupManagerListeners(): void {
		if (!this.manager) return

		this.logger.log('[MoonlinkService] Setting up Manager event listeners...', 'info')

		// --- Node Status Listeners ---
		this.manager.on('nodeCreate', (node: INode) => {
			this.logger.log(`[Moonlink] Node "${node.identifier || node.host}" created.`, 'info')
		})

		this.manager.on('nodeConnected', (node: INode) => {
			const identifier = node.identifier || node.host
			this.logger.log(`[Moonlink] Node "${identifier}" connected.`, 'info')
			// If a node connects that we *weren't* tracking (e.g., added manually elsewhere),
			// we might want to decide whether to start managing it or ignore it.
			// Currently, we only manage nodes added via `addNodeToManager`.
			if (!this.managedNodeIdentifiers.has(identifier)) {
				this.logger.log(`[MoonlinkService] Untracked node "${identifier}" connected. It will not be managed by this service.`, 'info')
			}
		})

		this.manager.on('nodeError', (node: INode, error: any) => {
			const identifier = node.identifier || node.host
			this.logger.log(`[Moonlink] Node "${identifier}" error: ${error?.message ?? JSON.stringify(error)}`, 'error')
			// If the node experiencing an error is one we manage, schedule its replacement.
			if (this.managedNodeIdentifiers.has(identifier)) {
				this.logger.log(`[MoonlinkService] Managed node "${identifier}" encountered an error. Scheduling replacement check.`, 'warn')
				this.scheduleNodeReplacement(identifier)
			}
		})

		this.manager.on('nodeDisconnect', (node: INode, reason: any) => {
			const identifier = node.identifier || node.host
			const reasonMsg = reason?.message || reason?.reason || JSON.stringify(reason) || 'Unknown reason'
			this.logger.log(`[Moonlink] Node "${identifier}" disconnected. Reason: ${reasonMsg}`, 'warn')
			// If the disconnected node is one we manage, remove tracking and schedule replacement.
			if (this.managedNodeIdentifiers.has(identifier)) {
				this.logger.log(`[MoonlinkService] Managed node "${identifier}" disconnected. Scheduling replacement.`, 'info')
				// No need to call removeNodeFromManager here, scheduleNodeReplacement handles it.
				this.scheduleNodeReplacement(identifier)
			} else {
				this.logger.log(`[MoonlinkService] Untracked node "${identifier}" disconnected. No replacement action taken.`, 'info')
				// Ensure it's removed from the manager if it somehow still exists (Moonlink should handle this)
				if (this.manager?.nodes.get(identifier)) {
					this.removeNodeFromManager(identifier)
				}
			}
		})

		this.manager.on('nodeReconnect', (node: INode) => {
			this.logger.log(`[Moonlink] Node "${node.identifier || node.host}" is attempting to reconnect...`, 'info')
		})

		// --- Player/Track Listeners ---
		this.manager.on('trackStart', (player: Player, track: Track) => {
			this.logger.log(`[Moonlink] Player ${player.guildId} started playing: ${track.title} by ${track.author}`, 'info')
			// Example: Send a "Now Playing" message
			// const channel = this.client.channels.cache.get(player.textChannel) as TextChannel;
			// if (channel) channel.send(`Now playing: **${track.title}** by *${track.author}*`);
		})

		this.manager.on('queueEnd', (player: Player) => {
			this.logger.log(`[Moonlink] Player ${player.guildId} queue ended.`, 'info')
			// Example: Implement an inactivity disconnect
			// setTimeout(() => {
			//     if (player.connected && !player.playing && player.queue.isEmpty) {
			//         this.logger.log(`[Moonlink] Player ${player.guildId} inactive, destroying player.`, 'info');
			//         player.destroy();
			//     }
			// }, 60000); // 1 minute inactivity timer
		})

		this.manager.on('playerDisconnected', (player: Player) => {
			this.logger.log(`[Moonlink] Player ${player.guildId} disconnected from channel.`, 'info')
			// Player might be destroyed automatically by Moonlink depending on config/reason
		})

		this.manager.on('playerDestroy', (player: Player, reason?: string) => {
			this.logger.log(`[Moonlink] Player ${player.guildId} destroyed. Reason: ${reason ?? 'N/A'}`, 'info')
		})

		this.logger.log('[MoonlinkService] Manager event listeners configured.', 'info')
	}

	/**
	 * Provides access to the Moonlink Manager instance.
	 * Throws an error if the manager is not initialized or available.
	 * @returns The initialized Moonlink Manager instance.
	 * @throws {Error} If the manager is null or not initialized.
	 */
	public getManager(): Manager {
		if (!this.manager) {
			// Attempting initialization here might lead to complex async issues.
			// It's better to ensure initialize() is called reliably after client ready.
			this.logger.log('[MoonlinkService] getManager called but manager is null. Initialization might not have run or failed.', 'error')
			throw new Error('Moonlink Manager is not available. Ensure initialize() was called successfully after client ready.')
		}
		// if (!this.manager.isInitialized) {
		// 	// This indicates an issue, as initialization should happen in initialize()
		// 	this.logger.log('[MoonlinkService] getManager called but manager is not initialized. Initialization might have failed.', 'error')
		// 	throw new Error('Moonlink Manager exists but is not initialized.')
		// }

		return this.manager
	}

	// --- Node Monitoring and Replacement ---

	/**
	 * Schedules a check to replace a potentially disconnected node after a short delay.
	 * This helps prevent race conditions if multiple events fire close together.
	 * @param identifier The identifier of the node to potentially replace.
	 */
	private scheduleNodeReplacement(identifier: string): void {
		// Avoid scheduling multiple replacements for the same node simultaneously if possible
		// (Simple check, might need more robust locking for high-frequency events)
		if (!this.managedNodeIdentifiers.has(identifier)) {
			this.logger.log(`[MoonlinkService] Node "${identifier}" is no longer tracked. Skipping replacement schedule.`, 'info')

			return
		}

		this.logger.log(`[MoonlinkService] Scheduling replacement check for node "${identifier}" in 5 seconds...`, 'info')
		setTimeout(() => {
			// Double-check if the node is still tracked before proceeding
			if (this.managedNodeIdentifiers.has(identifier)) {
				this.replaceDisconnectedNode(identifier).catch((err: any) => {
					this.logger.log(`[MoonlinkService] Error during scheduled node replacement for "${identifier}": ${err?.message ?? err}`, 'error')
				})
			} else {
				this.logger.log(`[MoonlinkService] Node "${identifier}" was untracked before replacement could run.`, 'info')
			}
		}, 5000) // 5-second delay
	}

	/**
	 * Attempts to replace a node that is assumed to be disconnected.
	 * Removes the old node and fetches/adds a new one if needed to meet the target count.
	 * @param disconnectedIdentifier The identifier of the node to replace.
	 */
	private async replaceDisconnectedNode(disconnectedIdentifier: string): Promise<void> {
		if (!this.manager) return

		this.logger.log(`[MoonlinkService] Attempting to replace disconnected/erroring node "${disconnectedIdentifier}"...`, 'info')

		// 1. Remove the node from the manager and our tracking set
		this.removeNodeFromManager(disconnectedIdentifier)

		// 2. Check if we need a new node
		const currentManagedCount = this.managedNodeIdentifiers.size
		const neededNodes = TARGET_NODE_COUNT - currentManagedCount
		if (neededNodes <= 0) {
			this.logger.log(`[MoonlinkService] Have ${currentManagedCount} managed nodes (target: ${TARGET_NODE_COUNT}). No replacement needed for "${disconnectedIdentifier}".`, 'info')

			return
		}

		// 3. Fetch new candidate nodes
		this.logger.log(`[MoonlinkService] Need ${neededNodes} more node(s). Fetching from API...`, 'info')
		const newNodeCandidates = await this.fetchAndSelectNodesFromApi(neededNodes)

		if (newNodeCandidates.length === 0) {
			this.logger.log(`[MoonlinkService] Could not find suitable replacement node(s) for "${disconnectedIdentifier}" from API.`, 'warn')

			return
		}

		// 4. Add the new node(s)
		let addedCount = 0
		for (const newNodeConfig of newNodeCandidates) {
			if (this.addNodeToManager(newNodeConfig)) {
				addedCount++
				this.logger.log(`[MoonlinkService] Successfully added replacement node "${newNodeConfig.identifier || newNodeConfig.host}".`, 'info')
			} else {
				this.logger.log(`[MoonlinkService] Failed to add replacement node "${newNodeConfig.identifier || newNodeConfig.host}".`, 'error')
			}
		}
		this.logger.log(`[MoonlinkService] Replacement process for "${disconnectedIdentifier}" finished. Added ${addedCount} new node(s).`, 'info')
	}

	/**
	 * Periodically checks the status of managed nodes via a scheduled job.
	 * Attempts replacement for any disconnected nodes found and fetches new nodes if below target.
	 */
	@Schedule('*/5 * * * *') // Check every 5 minutes
	async periodicNodeCheck(): Promise<void> {
		if (!this.initialConnectionDone || this.isInitializing) {
			this.logger.log('[MoonlinkService] Skipping periodic node check (not ready or initializing).', 'info')

			return
		}
		if (!this.manager) {
			this.logger.log('[MoonlinkService] Skipping periodic node check (manager not available).', 'warn')

			return
		}

		this.logger.log('[MoonlinkService] Performing periodic node check...', 'info')
		const managedNodes = this.getManagedNodes() // Get nodes currently tracked by us
		let connectedCount = 0
		const nodesToReplace: string[] = []

		for (const node of managedNodes) {
			const identifier = node.identifier || node.host
			const managerNode = this.manager.nodes.get(identifier)

			if (managerNode?.connected === true) {
				connectedCount++
				this.logger.log(`[MoonlinkService] Periodic Check: Node "${identifier}" is connected. Players: ${managerNode.stats?.playingPlayers ?? 'N/A'}/${managerNode.stats?.players ?? 'N/A'}`, 'info')
			} else {
				this.logger.log(`[MoonlinkService] Periodic Check: Managed node "${identifier}" found disconnected or missing in manager. Scheduling replacement.`, 'warn')
				// Schedule replacement even if the node object is missing from manager, as we were tracking it.
				nodesToReplace.push(identifier)
			}
		}

		// Schedule replacements for disconnected nodes found during the check
		for (const id of nodesToReplace) {
			// Check if it's still tracked before scheduling (might have been handled by disconnect event)
			if (this.managedNodeIdentifiers.has(id)) {
				this.scheduleNodeReplacement(id)
			}
		}

		// Check if we need to fetch more nodes (consider nodes pending replacement as 'gone')
		const effectiveManagedCount = this.managedNodeIdentifiers.size - nodesToReplace.length
		const neededNodes = TARGET_NODE_COUNT - effectiveManagedCount

		if (neededNodes > 0) {
			this.logger.log(`[MoonlinkService] Periodic Check: Need ${neededNodes} more node(s) (Target: ${TARGET_NODE_COUNT}, Effective: ${effectiveManagedCount}). Fetching from API...`, 'info')
			const newNodes = await this.fetchAndSelectNodesFromApi(neededNodes)
			let addedCount = 0
			for (const nodeConfig of newNodes) {
				if (this.addNodeToManager(nodeConfig)) {
					addedCount++
				}
			}
			this.logger.log(`[MoonlinkService] Periodic Check: Added ${addedCount} new node(s).`, 'info')
		} else {
			this.logger.log(`[MoonlinkService] Periodic Check: Node count sufficient (${this.managedNodeIdentifiers.size} tracked, ${connectedCount} connected, ${nodesToReplace.length} pending replacement).`, 'info')
		}
	}

	/**
	 * Helper method to get nodes that are currently tracked by this service.
	 * It filters the nodes present in the manager's cache based on `managedNodeIdentifiers`.
	 * @returns An array of INode objects managed by this service.
	 */
	private getManagedNodes(): INode[] {
		if (!this.manager) return []

		// Filter nodes present in the manager's cache that are also in our tracking set
		return Array.from(this.manager.nodes.cache.values()).filter(node =>
			this.managedNodeIdentifiers.has(node.identifier || node.host)
		)
	}

	/**
	 * Fetches the list of nodes from the configured API endpoint, filters them based on
	 * criteria (online, non-secure, required sources, not already managed), sorts them
	 * by suitability (players, CPU, response time, uptime), and selects the best candidates.
	 * @param count The maximum number of nodes to select and return.
	 * @returns A promise resolving to an array of INode configuration objects for the selected nodes.
	 */
	private async fetchAndSelectNodesFromApi(count: number): Promise<INode[]> {
		if (count <= 0) return []

		this.logger.log(`[MoonlinkService] Fetching up to ${count} nodes from API: ${API_URL}`, 'info')
		try {
			const response = await axios.get<ApiResponse>(API_URL, {
				timeout: 10000, // 10 second timeout
				headers: { Accept: 'application/json' },
			})

			if (response.status === 200 && response.data?.nodes?.length > 0) {
				const availableNodes = response.data.nodes

				// --- Filtering Criteria ---
				const filteredNodes = availableNodes.filter((node) => {
					const identifier = node.identifier || node.host
					if (!identifier) return false // Skip nodes without host/identifier

					// 1. Check required source managers
					const managers = node.info?.sourceManagers ?? []
					const hasRequiredSources = managers.includes('youtube') && managers.includes('soundcloud') && managers.includes('spotify')

					// 2. Check online status (use latest history entry or isConnected field)
					const latestStatus = node.statusHistory?.[node.statusHistory.length - 1]
					// Treat node as online if isConnected is true OR the latest status entry shows online
					const isOnline = node.isConnected === true || (latestStatus && latestStatus.online === true)

					// 3. Check if secure (we only want non-secure for typical setups)
					const isNonSecure = node.secure === false

					// 4. Check if already managed by us
					const isNotManaged = !this.managedNodeIdentifiers.has(identifier)

					// 5. Check if essential connection info is present
					const hasConnectionInfo = node.host && node.port && node.password !== undefined

					return isOnline && isNonSecure && hasRequiredSources && isNotManaged && hasConnectionInfo
				})

				if (filteredNodes.length === 0) {
					this.logger.log('[MoonlinkService] No suitable *new* nodes found matching criteria from API.', 'warn')

					return []
				}

				// --- Sorting Logic (prioritize nodes with fewer players, lower load, faster response) ---
				const sortedNodes = filteredNodes.sort((a, b) => {
					// 1. Fewer playing players is better
					const playingA = a.connections?.playingPlayers ?? Number.POSITIVE_INFINITY
					const playingB = b.connections?.playingPlayers ?? Number.POSITIVE_INFINITY
					if (playingA !== playingB) return playingA - playingB

					// 2. Fewer total players is better
					const totalA = a.connections?.players ?? Number.POSITIVE_INFINITY
					const totalB = b.connections?.players ?? Number.POSITIVE_INFINITY
					if (totalA !== totalB) return totalA - totalB

					// 3. Lower Lavalink CPU load is better
					const cpuLoadA = a.cpu?.lavalinkLoad ?? Number.POSITIVE_INFINITY
					const cpuLoadB = b.cpu?.lavalinkLoad ?? Number.POSITIVE_INFINITY
					if (cpuLoadA !== cpuLoadB) return cpuLoadA - cpuLoadB

					// 4. Lower System CPU load is better (fallback)
					const sysCpuA = a.cpu?.systemLoad ?? Number.POSITIVE_INFINITY
					const sysCpuB = b.cpu?.systemLoad ?? Number.POSITIVE_INFINITY
					if (sysCpuA !== sysCpuB) return sysCpuA - sysCpuB

					// 5. Lower response time is better (from latest status)
					const responseTimeA = a.statusHistory?.[a.statusHistory.length - 1]?.responseTime ?? Number.POSITIVE_INFINITY
					const responseTimeB = b.statusHistory?.[b.statusHistory.length - 1]?.responseTime ?? Number.POSITIVE_INFINITY
					if (responseTimeA !== responseTimeB) return responseTimeA - responseTimeB

					// 6. Higher uptime is generally better (more stable) - lower priority
					return (b.uptime ?? 0) - (a.uptime ?? 0)
				})

				const selectedNodes = sortedNodes.slice(0, count)
				this.logger.log(`[MoonlinkService] API Nodes: ${availableNodes.length} total, ${filteredNodes.length} suitable new. Selected ${selectedNodes.length} candidate(s).`, 'info')

				// Map to INode format required by Moonlink, ensuring identifier is present
				return selectedNodes.map(node => ({
					host: node.host,
					port: node.port,
					password: node.password,
					secure: node.secure,
					identifier: node.identifier || node.host, // Explicitly set identifier
				}))
			} else {
				this.logger.log(`[MoonlinkService] API request failed or returned no nodes. Status: ${response.status}, Data: ${JSON.stringify(response.data)}`, 'error')

				return []
			}
		} catch (error: any) {
			let errorMessage = error?.message ?? 'Unknown error'
			if (error instanceof AxiosError) {
				errorMessage = `AxiosError: ${error.message} (Status: ${error.response?.status}, URL: ${error.config?.url})`
			}
			this.logger.log(`[MoonlinkService] Failed to fetch nodes from API: ${errorMessage}`, 'error')

			return []
		}
	}

}
