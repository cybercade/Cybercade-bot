import type { VoiceServerUpdate, VoiceStateUpdate } from '@discordx/lava-player'
import { Node } from '@discordx/lava-player' // Node constructor accepts Client
import { QueueManager } from '@discordx/lava-queue'
import axios from 'axios'
import { GatewayDispatchEvents } from 'discord.js' // Re-add GatewayDispatchEvents
import { Client, Discord } from 'discordx'

import { On, Once, Schedule, Service } from '@/decorators'
import { Logger } from '@/services'

import { lavaPlayerManager } from './MusicManager'

// --- Type definierung ---

// Typ für die Statistiken innerhalb der StatusHistory und am Root-Level
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

// Typ für einen Eintrag in der statusHistory
type StatusHistoryEntry = {
	timestamp: string // ISO Date String
	online: boolean
	responseTime: number
	stats?: NodeStats // Stats sind optional, wenn offline
}

// Typ für die Lavalink /info Route (vereinfacht)
type LavalinkInfo = {
	version: {
		semver: string
		// ... andere Info-Felder
	}
	// ... andere Info-Felder
	sourceManagers: string[]
	plugins: { name: string, version: string }[]
}

// Typ für einen einzelnen Node aus dem API-Array
type ApiNodeInfo = {
	_id: string
	host: string
	identifier: string // Könnte nützlich sein
	owner: {
		discordId: string
		username: string
		// ... andere Owner-Felder
	}
	password: string
	port: number
	restVersion: string // z.B. "v4"
	secure: boolean
	isConnected: boolean // Status von der API
	statusHistory: StatusHistoryEntry[]
	createdAt: string // ISO Date String
	updatedAt: string // ISO Date String
	// Felder vom letzten Status-Check (könnten nützlich sein für Auswahl)
	connections?: {
		players: number
		playingPlayers: number
	}
	cpu?: NodeStats['cpu']
	memory?: NodeStats['memory']
	uptime?: number
	info?: LavalinkInfo // Info vom /info Endpoint
	// ... eventuell weitere Felder wie graphData
}

// Typ für die gesamte API-Antwort
type ApiResponse = {
	nodes: ApiNodeInfo[]
	cached: boolean
}

// Der Typ, den wir intern für die Node-Erstellung verwenden
type NodeConfig = {
	host: string
	port: number
	password: string
	secure?: boolean
	identifier?: string // Optional hinzufügen
}
// --- End Types ---

@Discord()
@Service()
export class MusicMonitorService {

	private isReplacingNode = false
	private initialConnectionAttempted = false

	// Re-add variables to store references to the listeners we add manually
	private currentVoiceStateListener: ((data: VoiceStateUpdate) => void) | null = null
	private currentVoiceServerListener: ((data: VoiceServerUpdate) => void) | null = null

	constructor(
		private logger: Logger,
		private client: Client // Keep client injected
	) { }

	/**
	 * Called once the client is ready to attempt the initial Lavalink connection.
	 * Uses the API to find the best node.
	 */
	@Once('ready') // Using @On with @Lifecycle is generally more reliable
	async initialize(): Promise<void> {
		if (this.initialConnectionAttempted) {
			return // Only attempt initial connection once
		}
		this.initialConnectionAttempted = true
		this.logger.log('Music Monitor: Initializing Lavalink connection...', 'info')

		await new Promise(resolve => setTimeout(resolve, 5000))

		const queueManager = lavaPlayerManager.instance

		if (queueManager?.node) {
			if (queueManager.node.connected) {
				this.logger.log(`Music Monitor: Existing Lavalink node is already connected. Initialization complete.`, 'info')
				this.setupNodeListeners(queueManager.node) // Setup listeners for existing node
			} else {
				this.logger.log(`Music Monitor: Existing Lavalink node is disconnected. Attempting connection via API...`, 'warn')
				await this.replaceNode() // Attempt connection using API
			}
		} else {
			this.logger.log('Music Monitor: No existing Lavalink node found. Attempting initial connection via API...', 'info')
			await this.replaceNode() // Attempt connection using API
		}
	}

	/**
	 * Scheduled check for node connectivity (runs hourly).
	 * Uses the API to find the best node if disconnected.
	 */
	@Schedule('0 * * * *') // Runs at the start of every hour
	async checkAndReconnectNode() {
		if (!this.initialConnectionAttempted) {
			// Don't run check if initialization hasn't happened
			return
		}

		if (this.isReplacingNode) {
			this.logger.log('Music Monitor: Node replacement already in progress, skipping check.', 'warn')

			return
		}

		const queueManager = lavaPlayerManager.instance

		if (!queueManager || !queueManager.node) {
			this.logger.log('Music Monitor: QueueManager or Node not available after initialization. Attempting connection via API...', 'warn')
			await this.replaceNode() // Attempt connection using API

			return
		}

		if (queueManager.node.connected) {
			// Node is connected, no need to log this every hour unless debugging
			return
		}

		// Node is disconnected
		this.logger.log(`Music Monitor: Lavalink node is disconnected. Attempting replacement via API...`, 'warn')
		await this.replaceNode() // Attempt connection using API
	}

	/**
	 * Orchestrates the process of obtaining a node configuration from the API
	 * and attempting to connect/replace the node.
	 */
	private async replaceNode() {
		if (this.isReplacingNode) {
			this.logger.log('Music Monitor: replaceNode called while already replacing. Skipping.', 'warn')

			return
		}
		this.isReplacingNode = true
		let configSource: 'API' | 'None' = 'None' // Only API or None now
		let connectionAttempted = false

		this.logger.log('Music Monitor: Starting node replacement/connection process via API...', 'info')

		try {
			// --- Always try API first ---
			this.logger.log('Music Monitor: Attempting to fetch node config from API...', 'info')
			const apiNodeConfig = await this.fetchAndSelectNodeFromApi()

			if (apiNodeConfig) {
				connectionAttempted = true
				await this.connectWithConfig(apiNodeConfig)
				configSource = 'API'
			} else {
				// API failed or no suitable node found
				this.logger.log('Music Monitor: Failed to fetch from API or no suitable node found. Cannot connect.', 'error')
				configSource = 'None'
			}
		} catch (error: any) {
			this.logger.log(`Music Monitor: Critical error during node replacement orchestration: ${error?.message ?? error}`, 'error')
			configSource = 'None' // Mark as failed
		} finally {
			this.isReplacingNode = false
			// Determine final status based on whether a connection was attempted and successful (or at least setup)
			const finalSuccess = configSource === 'API' && connectionAttempted
			const level = finalSuccess ? 'info' : 'error'
			this.logger.log(`Music Monitor: Node replacement/connection process finished (Source: ${configSource}). Flag reset.`, level)
		}
	}

	/**
	 * Performs the actual node destruction, creation, and QueueManager assignment.
	 * @param config The NodeConfig to use for the new connection.
	 */
	private async connectWithConfig(config: NodeConfig): Promise<void> {
		let connectionSuccess = false
		const nodeIdentifier = config.identifier ?? config.host // Use the identifier here
		this.logger.log(`Music Monitor: Attempting to connect using config for...`, 'info')

		try {
			// 1. Destroy the old node (if it exists)
			try {
				if (lavaPlayerManager.instance?.node) {
					this.logger.log(`Music Monitor: Destroying old node...`, 'info')
					// Important: Still remove node-specific listeners
					lavaPlayerManager.instance.node.removeAllListeners()
					// Destroy the node
					lavaPlayerManager.instance.node.destroy()
					this.logger.log('Music Monitor: Old node destroyed.', 'info')
				}
			} catch (destroyError: any) {
				this.logger.log(`Music Monitor: Error destroying old node: ${destroyError?.message ?? destroyError}`, 'warn')
			}

			// 2. Create the new Node instance WITHOUT passing the client
			this.logger.log(`Music Monitor: Creating new Node instance for...`, 'info')
			const newNode = new Node({
				host: {
					address: config.host,
					port: config.port,
					secure: config.secure ?? false,
				},
				password: config.password,
				send: (guildId, packet) => {
					const guild = this.client.guilds.cache.get(guildId)
					if (guild) {
						guild.shard.send(packet)
					}
				},
				userId: this.client.user?.id ?? '',
			})

			// 3. Set up event listeners (manual WS listeners + node status listeners)
			this.logger.log(`Music Monitor: Setting up listeners for...`, 'info')
			this.setupNodeListeners(newNode) // Pass the NEW node instance

			// 4. Create a new QueueManager with the new Node and assign it globally
			this.logger.log(`Music Monitor: Creating and assigning new QueueManager for...`, 'info')
			lavaPlayerManager.instance = new QueueManager(newNode)
			this.logger.log(`Music Monitor: New QueueManager assigned with node. Connection attempt initiated.`, 'info')

			connectionSuccess = true
		} catch (error: any) {
			this.logger.log(`Music Monitor: Error during connectWithConfig for: ${error?.message ?? error}`, 'error')
			connectionSuccess = false
		} finally {
			const level = connectionSuccess ? 'info' : 'error'
			this.logger.log(`Music Monitor: connectWithConfig for finished. Setup success: ${connectionSuccess}`, level)
		}
	}

	/**
	 * Sets up the necessary event listeners for a given Lavalink Node instance.
	 * Manages listeners attached to client.ws carefully.
	 * @param node The Node instance to attach listeners to.
	 */
	private setupNodeListeners(node: Node) {
		this.logger.log(`Music Monitor: Setting up listeners for node...`, 'info')

		// --- Forward Discord Voice Events Manually ---

		// Remove the PREVIOUS listeners added by *this* service, if they exist
		if (this.currentVoiceStateListener) {
			this.client.ws.off(GatewayDispatchEvents.VoiceStateUpdate, this.currentVoiceStateListener)
			this.currentVoiceStateListener = null
			// this.logger.log(`Music Monitor: Removed previous VoiceStateUpdate listener.`, 'info'); // Optional log
		}
		if (this.currentVoiceServerListener) {
			this.client.ws.off(GatewayDispatchEvents.VoiceServerUpdate, this.currentVoiceServerListener)
			this.currentVoiceServerListener = null
			// this.logger.log(`Music Monitor: Removed previous VoiceServerUpdate listener.`, 'info'); // Optional log
		}

		// Define the new listeners
		this.currentVoiceStateListener = (data: VoiceStateUpdate) => {
			// Check instance equality for safety, ensuring we only forward for the *current* active node
			if (lavaPlayerManager.instance?.node === node) {
				// this.logger.log(`Music Monitor: Forwarding VoiceStateUpdate for node`, 'debug'); // Optional debug log
				void node.voiceStateUpdate(data)
			}
		}

		this.currentVoiceServerListener = (data: VoiceServerUpdate) => {
			// Check instance equality for safety
			if (lavaPlayerManager.instance?.node === node) {
				// this.logger.log(`Music Monitor: Forwarding VoiceServerUpdate for node`, 'debug'); // Optional debug log
				void node.voiceServerUpdate(data) // This provides the session ID internally
			}
		}

		// Add the new listeners to the client's websocket manager
		this.client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, this.currentVoiceStateListener)
		this.client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, this.currentVoiceServerListener)
		this.logger.log(`Music Monitor: Added new voice event listeners for node.`, 'info')

		// --- Node Status Listeners ---
		// Clear listeners specific to this Node instance (connect, error, disconnect)
		node.removeAllListeners()

		node.on('connect', () => {
			this.logger.log(`Music Monitor: Lavalink Node connected successfully!`, 'info')
		})

		node.on('error', (error) => {
			this.logger.log(`Music Monitor: Lavalink Node error: ${error.message}`, 'error')
		})

		node.on('disconnect', (reason) => {
			const reasonText = reason?.reason ?? 'Unknown reason'
			const reasonCode = reason?.code ?? 'N/A'
			this.logger.log(`Music Monitor: Lavalink Node disconnected. Reason: ${reasonText} (Code: ${reasonCode})`, 'warn')
		})

		this.logger.log(`Music Monitor: Node status listeners added for node.`, 'info')
	}

	/**
	 * Fetches the list of nodes from the API and selects the best candidate based on refined criteria.
	 * @returns A NodeConfig object for the selected node, or null if none found or error occurred.
	 */
	private async fetchAndSelectNodeFromApi(): Promise<NodeConfig | null> {
		const apiUrl = 'https://lavalink-api.appujet.site/api/nodes' // Consider making this configurable
		this.logger.log(`Music Monitor: Fetching node list from API: ${apiUrl}`, 'info')
		try {
			const response = await axios.get<ApiResponse>(apiUrl, { timeout: 10000 })

			if (response.status === 200 && response.data?.nodes?.length > 0) {
				const availableNodes = response.data.nodes

				// --- Refined Filtering ---
				const filteredNodes = availableNodes.filter((node) => {
					const managers = node.info?.sourceManagers ?? []
					const hasRequiredSources = managers.includes('youtube')
						&& managers.includes('soundcloud')
						&& managers.includes('spotify') // Keep spotify for filtering

					return node.isConnected === true // Must be connected according to API
						&& node.secure === false // Must not be secure
						&& hasRequiredSources // Must have required source managers
				})

				if (filteredNodes.length === 0) {
					this.logger.log('Music Monitor: No nodes found matching required criteria (connected, not secure, supports youtube/soundcloud/spotify).', 'warn')

					return null
				}

				// --- Refined Sorting ---
				const sortedNodes = filteredNodes.sort((a, b) => {
					// 1. Uptime (Descending) - Higher is better
					const uptimeDiff = (b.uptime ?? 0) - (a.uptime ?? 0)
					if (uptimeDiff !== 0) return uptimeDiff

					// 2. CPU Load (Ascending) - Lower is better (prefer lavalinkLoad if available)
					const cpuLoadA = a.cpu?.lavalinkLoad ?? a.cpu?.systemLoad ?? Number.POSITIVE_INFINITY
					const cpuLoadB = b.cpu?.lavalinkLoad ?? b.cpu?.systemLoad ?? Number.POSITIVE_INFINITY
					const cpuDiff = cpuLoadA - cpuLoadB
					if (cpuDiff !== 0) return cpuDiff

					// 3. Free Memory (Descending) - Higher is better
					const memoryDiff = (b.memory?.free ?? 0) - (a.memory?.free ?? 0)
					if (memoryDiff !== 0) return memoryDiff

					// 4. Response Time (Ascending) - Lower is better (use latest history entry)
					const responseTimeA = a.statusHistory?.[a.statusHistory.length - 1]?.responseTime ?? Number.POSITIVE_INFINITY
					const responseTimeB = b.statusHistory?.[b.statusHistory.length - 1]?.responseTime ?? Number.POSITIVE_INFINITY
					const responseDiff = responseTimeA - responseTimeB
					if (responseDiff !== 0) return responseDiff

					// 5. Bonus for HTTP support (Optional tie-breaker) - Nodes with HTTP come first
					const hasHttpA = a.info?.sourceManagers?.includes('http') ? 0 : 1
					const hasHttpB = b.info?.sourceManagers?.includes('http') ? 0 : 1
					const httpDiff = hasHttpA - hasHttpB
					if (httpDiff !== 0) return httpDiff

					// If all else is equal, maintain relative order (or sort by identifier)
					return (a.identifier ?? '').localeCompare(b.identifier ?? '')
				})

				const selectedNode = sortedNodes[0]
				this.logger.log(`Music Monitor: API returned ${availableNodes.length} nodes. Filtered to ${filteredNodes.length}. Selected candidate: ${selectedNode.identifier} (${selectedNode.host}) based on uptime, resources, and sources.`, 'info')

				// --- Validation ---
				if (selectedNode.host && selectedNode.port && selectedNode.password) {
					return {
						host: selectedNode.host,
						port: selectedNode.port,
						password: selectedNode.password,
						secure: selectedNode.secure, // Will be false
						identifier: selectedNode.identifier,
					}
				} else {
					this.logger.log(`Music Monitor: Selected node candidate ('${selectedNode.identifier}') is missing required fields (host, port, password).`, 'error')

					return null
				}
			} else {
				const responseDataSummary = response.data?.nodes ? `${response.data.nodes.length} nodes` : `${JSON.stringify(response.data)?.substring(0, 100)}...`
				this.logger.log(`Music Monitor: API request failed or returned no nodes. Status: ${response.status}, Data: ${responseDataSummary}`, 'error')

				return null
			}
		} catch (error) {
			let errorMessage = `${error}`
			if (axios.isAxiosError(error)) {
				errorMessage = `${error.message} (Status: ${error.response?.status}, Code: ${error.code})`
			}
			this.logger.log(`Music Monitor: Failed to fetch nodes from API: ${errorMessage}`, 'error')

			return null
		}
	}

	// Optional: Add a cleanup method if your framework supports it (e.g., on bot shutdown)
	// @On('shutdown')
	// cleanupListeners() {
	//     if (this.currentVoiceStateListener) {
	//         this.client.ws.off(GatewayDispatchEvents.VoiceStateUpdate, this.currentVoiceStateListener);
	//     }
	//     if (this.currentVoiceServerListener) {
	//         this.client.ws.off(GatewayDispatchEvents.VoiceServerUpdate, this.currentVoiceServerListener);
	//     }
	//     this.logger.log('Music Monitor: Cleaned up voice event listeners on shutdown.', 'info');
	// }

}
