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

		// Add a small delay to ensure the bot is fully ready, ws listeners are stable etc.
		await new Promise(resolve => setTimeout(resolve, 5000)) // 5 seconds delay

		const queueManager = lavaPlayerManager.instance

		if (queueManager?.node) {
			// Check connection status *after* potential initial connection attempt
			// Use a short delay/check loop or rely on node events if possible
			// For simplicity now, just check status. A better approach might involve waiting for 'connect' or 'disconnect' briefly.
			await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2s for existing node to potentially connect/disconnect

			if (queueManager.node.connected) {
				this.logger.log(`Music Monitor: Existing Lavalink node is connected. Initialization complete.`, 'info')
				// Pass identifier if available, otherwise fallback
				const existingIdentifier = queueManager.node.options.identifier ?? queueManager.node.options.host.address
				this.setupNodeListeners(queueManager.node, existingIdentifier) // Setup listeners for existing node
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

		// Add a check for connecting state as well
		if (queueManager.node.connected || queueManager.node.connecting) {
			// Node is connected or trying to connect, no need to intervene
			this.logger.log(`Music Monitor: Node check - Status: ${queueManager.node.connected ? 'Connected' : 'Connecting'}.`, 'debug') // Optional debug log

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
		// Use a flag to track if connectWithConfig actually succeeded in setting up
		let setupSuccess = false

		this.logger.log('Music Monitor: Starting node replacement/connection process via API...', 'info')

		try {
			// --- Always try API first ---
			this.logger.log('Music Monitor: Attempting to fetch node config from API...', 'info')
			const apiNodeConfig = await this.fetchAndSelectNodeFromApi()

			if (apiNodeConfig) {
				// connectWithConfig now returns boolean indicating setup success
				setupSuccess = await this.connectWithConfig(apiNodeConfig)
				if (setupSuccess) {
					configSource = 'API'
				} else {
					// connectWithConfig failed internally, log already happened there
					configSource = 'None'
				}
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
			// Final success depends on setup being successful
			const finalSuccess = setupSuccess
			const level = finalSuccess ? 'info' : 'error'
			this.logger.log(`Music Monitor: Node replacement/connection process finished (Source: ${configSource}, Setup Success: ${finalSuccess}). Flag reset.`, level)
		}
	}

	/**
	 * Performs the actual node destruction, creation, and QueueManager assignment.
	 * Returns true if the setup process completes without throwing, false otherwise.
	 * @param config The NodeConfig to use for the new connection.
	 */
	private async connectWithConfig(config: NodeConfig): Promise<boolean> {
		let setupSuccess = false
		const nodeIdentifier = config.identifier ?? config.host // We already have it here!
		this.logger.log(`Music Monitor: Attempting to connect using config for ${nodeIdentifier}...`, 'info')
		let newNode: Node | null = null // Define newNode outside the try block to access in finally

		try {
			// 1. Destroy the old node (if it exists) and cleanup listeners
			const oldNode = lavaPlayerManager.instance?.node
			if (oldNode) {
				// Use optional chaining and nullish coalescing for safety
				const oldIdentifier = oldNode.options?.identifier ?? oldNode.options?.host?.address ?? 'unknown-old-node'
				this.logger.log(`Music Monitor: Destroying old node ${oldIdentifier}...`, 'info')
				try {
					oldNode.destroy()
					this.logger.log(`Music Monitor: Old node ${oldIdentifier} destroyed.`, 'info')
				} catch (destroyError: any) {
					this.logger.log(`Music Monitor: Error destroying old node ${oldIdentifier}: ${destroyError?.message ?? destroyError}`, 'warn')
				}
			}
			this.cleanupWsListeners()

			// 2. Verify User ID <<<< THIS IS THE IMPORTANT PART TO ADD/ENSURE IS PRESENT
			const userIdForNode = this.client.user?.id
			if (!userIdForNode) {
				this.logger.log(`Music Monitor: CRITICAL - Client User ID is NOT available at the time of Node creation! Cannot connect.`, 'error')

				return false // Cannot proceed without a user ID
			}
			this.logger.log(`Music Monitor: Using Client User ID for node ${nodeIdentifier}: ${userIdForNode}`, 'debug')
			// <<<< END IMPORTANT PART

			// 3. Create the new Node instance
			this.logger.log(`Music Monitor: Creating new Node instance for ${nodeIdentifier}...`, 'info')
			newNode = new Node({ // Assign to the outer scope variable
				host: {
					address: config.host,
					port: config.port,
					secure: config.secure ?? false,
				},
				password: config.password,
				send: (guildId, packet) => {
					const guild = this.client.guilds.cache.get(guildId)
					if (guild) {
						this.logger.log(`Music Monitor: Sending packet for guild ${guildId} via shard ${guild.shardId}`, 'debug')
						guild.shard.send(packet)
					} else {
						this.logger.log(`Music Monitor: Could not find guild ${guildId} to send packet. Shard issue?`, 'warn')
					}
				},
				userId: userIdForNode,
			})

			// 4. Set up event listeners
			this.logger.log(`Music Monitor: Setting up listeners for ${nodeIdentifier}...`, 'info')
			this.setupNodeListeners(newNode, nodeIdentifier)

			// 5. Create a new QueueManager
			this.logger.log(`Music Monitor: Creating and assigning new QueueManager for ${nodeIdentifier}...`, 'info')
			lavaPlayerManager.instance = new QueueManager(newNode)
			this.logger.log(`Music Monitor: New QueueManager assigned with node ${nodeIdentifier}.`, 'info')

			// Explicitly call connect()
			this.logger.log(`Music Monitor: Explicitly calling connect() for node ${nodeIdentifier}...`, 'info')
			newNode.connect()

			// Log connecting state
			await new Promise(resolve => setTimeout(resolve, 100))
			this.logger.log(`Music Monitor: Node ${nodeIdentifier} connecting state after connect() call: ${newNode.connecting}`, 'debug')

			this.logger.log(`Music Monitor: Connection attempt initiated for ${nodeIdentifier}. Waiting for 'connect' event...`, 'info')

			setupSuccess = true
		} catch (error: any) { // The error was caught here
			this.logger.log(`Music Monitor: Error during connectWithConfig for ${nodeIdentifier}: ${error?.message ?? error}`, 'error')
			setupSuccess = false
		} finally {
			const level = setupSuccess ? 'info' : 'error'
			this.logger.log(`Music Monitor: connectWithConfig for ${nodeIdentifier} finished. Setup success: ${setupSuccess}`, level)

			// Optional: Log final connection status after a short delay
			if (newNode && setupSuccess) {
				const identifierForTimeout = nodeIdentifier // Use identifier from outer scope
				setTimeout(() => {
					// Check if newNode still exists and hasn't been destroyed in the meantime
					if (newNode && !newNode.destroyed) {
						this.logger.log(`Music Monitor: Node ${identifierForTimeout} status after 2s delay: connected=${newNode.connected}, connecting=${newNode.connecting}, destroyed=${newNode.destroyed}`, 'debug')
					} else {
						this.logger.log(`Music Monitor: Node ${identifierForTimeout} was destroyed or unavailable after 2s delay.`, 'debug')
					}
				}, 2000)
			}
		}

		return setupSuccess
	}

	/** Helper to clean up WS listeners */
	private cleanupWsListeners() {
		if (this.currentVoiceStateListener) {
			this.client.ws.off(GatewayDispatchEvents.VoiceStateUpdate, this.currentVoiceStateListener)
			this.currentVoiceStateListener = null
			this.logger.log(`Music Monitor: Removed previous VoiceStateUpdate listener.`, 'debug')
		}
		if (this.currentVoiceServerListener) {
			this.client.ws.off(GatewayDispatchEvents.VoiceServerUpdate, this.currentVoiceServerListener)
			this.currentVoiceServerListener = null
			this.logger.log(`Music Monitor: Removed previous VoiceServerUpdate listener.`, 'debug')
		}
	}

	/**
	 * Sets up the necessary event listeners for a given Lavalink Node instance.
	 * Manages listeners attached to client.ws carefully.
	 * @param node The Node instance to attach listeners to.
	 * @param nodeIdentifier The identifier (name or host) of the node.
	 */
	private setupNodeListeners(node: Node, nodeIdentifier: string) {
		this.logger.log(`Music Monitor: Setting up listeners for node ${nodeIdentifier}...`, 'info')

		// --- Forward Discord Voice Events Manually ---
		this.cleanupWsListeners()

		this.currentVoiceStateListener = (data: VoiceStateUpdate) => {
			if (lavaPlayerManager.instance?.node === node) {
				void node.voiceStateUpdate(data)
			}
		}

		this.currentVoiceServerListener = (data: VoiceServerUpdate) => {
			if (lavaPlayerManager.instance?.node === node) {
				void node.voiceServerUpdate(data)
			}
		}

		this.client.ws.on(GatewayDispatchEvents.VoiceStateUpdate, this.currentVoiceStateListener)
		this.client.ws.on(GatewayDispatchEvents.VoiceServerUpdate, this.currentVoiceServerListener)
		this.logger.log(`Music Monitor: Added new voice event listeners for node ${nodeIdentifier}.`, 'info')

		// --- Node Status Listeners ---
		// *** Ensure node.removeAllListeners() is NOT present here ***

		const onConnect = () => {
			// This message should appear now!
			this.logger.log(`Music Monitor: Lavalink Node ${nodeIdentifier} connected successfully!`, 'info')
		}
		const onError = (error: Error) => {
			this.logger.log(`Music Monitor: Lavalink Node ${nodeIdentifier} emitted 'error': ${error.message}`, 'error', error)
			if ('code' in error) console.error(`Error Code: ${(error as any).code}`)
			if ('reason' in error) console.error(`Error Reason: ${(error as any).reason}`)
		}
		const onDisconnect = (reason: { code: number, reason: string } | undefined) => {
			const reasonText = reason?.reason ?? 'Unknown reason'
			const reasonCode = reason?.code ?? 'N/A'
			// **** USE WARN LEVEL AND ADD STACK ****
			this.logger.log(`Music Monitor: Node ${nodeIdentifier} emitted 'disconnect'. Reason: ${reasonText} (Code: ${reasonCode})`, 'warn')
			this.logger.log(`Music Monitor: Full disconnect reason object for ${nodeIdentifier}: ${JSON.stringify(reason)}`, 'debug')
			console.warn(`[MusicMonitor] Disconnect event stack trace (Node: ${nodeIdentifier}):`, new Error().stack) // Added node identifier here
			// ***************************************
		}

		// Ensure listeners are fresh for this specific node instance
		node.off('connect', onConnect)
		node.off('error', onError)
		node.off('disconnect', onDisconnect)

		// Add the listeners
		node.on('connect', onConnect)
		node.on('error', onError)
		node.on('disconnect', onDisconnect)

		this.logger.log(`Music Monitor: Node status listeners added for node ${nodeIdentifier}.`, 'info')
	}

	/**
	 * Fetches the list of nodes from the API and selects the best candidate based on refined criteria.
	 * @returns A NodeConfig object for the selected node, or null if none found or error occurred.
	 */
	private async fetchAndSelectNodeFromApi(): Promise<NodeConfig | null> {
		const apiUrl = 'https://lavalink-api.appujet.site/api/nodes' // Consider making this configurable
		this.logger.log(`Music Monitor: Fetching node list from API: ${apiUrl}`, 'info')
		try {
			const response = await axios.get<ApiResponse>(apiUrl, { timeout: 10000 }) // Increased timeout slightly

			if (response.status === 200 && response.data?.nodes?.length > 0) {
				const availableNodes = response.data.nodes

				// --- Refined Filtering ---
				const filteredNodes = availableNodes.filter((node) => {
					const managers = node.info?.sourceManagers ?? []
					// Ensure spotify is checked if needed by your bot's features
					const hasRequiredSources = managers.includes('youtube')
						&& managers.includes('soundcloud')
						&& managers.includes('spotify')

					// Check the latest statusHistory entry for online status if available and reliable
					const latestStatus = node.statusHistory?.[node.statusHistory.length - 1]
					const isOnline = latestStatus ? latestStatus.online : node.isConnected // Prefer history if available

					return isOnline === true // Must be online (prefer history check)
						&& node.secure === false // Must not be secure
						&& hasRequiredSources // Must have required source managers
				})

				if (filteredNodes.length === 0) {
					this.logger.log('Music Monitor: No nodes found matching required criteria (online, not secure, supports youtube/soundcloud).', 'warn')

					return null
				}

				// --- Refined Sorting ---
				const sortedNodes = filteredNodes.sort((a, b) => {
					// Prioritize nodes with lower player count first
					const playersA = a.connections?.playingPlayers ?? a.connections?.players ?? Number.POSITIVE_INFINITY
					const playersB = b.connections?.playingPlayers ?? b.connections?.players ?? Number.POSITIVE_INFINITY
					const playerDiff = playersA - playersB
					if (playerDiff !== 0) return playerDiff

					// Then CPU Load (Ascending) - Lower is better
					const cpuLoadA = a.cpu?.lavalinkLoad ?? a.cpu?.systemLoad ?? Number.POSITIVE_INFINITY
					const cpuLoadB = b.cpu?.lavalinkLoad ?? b.cpu?.systemLoad ?? Number.POSITIVE_INFINITY
					const cpuDiff = cpuLoadA - cpuLoadB
					if (cpuDiff !== 0) return cpuDiff

					// Then Response Time (Ascending) - Lower is better (use latest history entry)
					const responseTimeA = a.statusHistory?.[a.statusHistory.length - 1]?.responseTime ?? Number.POSITIVE_INFINITY
					const responseTimeB = b.statusHistory?.[b.statusHistory.length - 1]?.responseTime ?? Number.POSITIVE_INFINITY
					const responseDiff = responseTimeA - responseTimeB
					if (responseDiff !== 0) return responseDiff

					// Then Uptime (Descending) - Higher is generally more stable
					const uptimeDiff = (b.uptime ?? 0) - (a.uptime ?? 0)
					if (uptimeDiff !== 0) return uptimeDiff

					// Then Free Memory (Descending) - Higher is better
					const memoryDiff = (b.memory?.free ?? 0) - (a.memory?.free ?? 0)
					if (memoryDiff !== 0) return memoryDiff

					// Bonus for HTTP support (Optional tie-breaker)
					const hasHttpA = a.info?.sourceManagers?.includes('http') ? 0 : 1
					const hasHttpB = b.info?.sourceManagers?.includes('http') ? 0 : 1
					const httpDiff = hasHttpA - hasHttpB
					if (httpDiff !== 0) return httpDiff

					// Fallback sort
					return (a.identifier ?? '').localeCompare(b.identifier ?? '')
				})

				const selectedNode = sortedNodes[0]
				this.logger.log(`Music Monitor: API returned ${availableNodes.length} nodes. Filtered to ${filteredNodes.length}. Selected candidate: ${selectedNode.identifier} (${selectedNode.host}) based on players, resources, response time.`, 'info')

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
	@On('shutdown') // Assuming your decorator/framework supports this
	cleanupOnShutdown() {
		this.logger.log('Music Monitor: Cleaning up on shutdown...', 'info')
		this.cleanupWsListeners() // Clean up WS listeners

		const node = lavaPlayerManager.instance?.node
		if (node && !node.destroyed) { // Check if node exists and is not already destroyed
			const nodeIdentifier = node.options.identifier ?? node.options.host.address
			this.logger.log(`Music Monitor: Destroying node ${nodeIdentifier} on shutdown.`, 'info')
			node.destroy()
		}
		lavaPlayerManager.instance = null // Clear the instance
	}

}
