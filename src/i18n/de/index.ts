/* eslint-disable */
import type { Translation } from '../i18n-types'

const de = {
	GUARDS: {
		DISABLED_COMMAND: 'This command is currently disabled.',
		MAINTENANCE: 'This bot is currently in maintenance mode.',
		GUILD_ONLY: 'This command can only be used in a server.',
		NSFW: 'This command can only be used in a NSFW channel.',
	},
	ERRORS: {
		UNKNOWN: 'An unknown error occurred.',
	},
	SHARED: {
		NO_COMMAND_DESCRIPTION: 'No description provided.',
	},
	COMMANDS: {
		INVITE: {
			DESCRIPTION: 'Invite the bot to your server!',
			EMBED: {
				TITLE: 'Invite me on your server!',
				DESCRIPTION: '[Click here]({link}) to invite me!',
			},
		},
		PREFIX: {
			NAME: 'prefix',
			DESCRIPTION: 'Change the prefix of the bot.',
			OPTIONS: {
				PREFIX: {
					NAME: 'new_prefix',
					DESCRIPTION: 'The new prefix of the bot.',
				},
			},
			EMBED: {
				DESCRIPTION: 'Prefix changed to `{prefix}`.',
			},
		},
		MAINTENANCE: {
			DESCRIPTION: 'Set the maintenance mode of the bot.',
			EMBED: {
				DESCRIPTION: 'Maintenance mode set to `{state}`.',
			},
		},
		STATS: {
			DESCRIPTION: 'Get some stats about the bot.',
			HEADERS: {
				COMMANDS: 'Commands',
				GUILDS: 'Guild',
				ACTIVE_USERS: 'Active Users',
				USERS: 'Users',
			},
		},
		HELP: {
			DESCRIPTION: 'Get global help about the bot and its commands',
			EMBED: {
				TITLE: 'Help panel',
				CATEGORY_TITLE: '{category} Commands',
			},
			SELECT_MENU: {
				TITLE: 'Select a category',
				CATEGORY_DESCRIPTION: '{category} commands',
			},
		},
		PING: {
			DESCRIPTION: 'Pong!',
			MESSAGE: '{member} Pong! The message round-trip took {time}ms.{heartbeat}',
		},
		RSS: {
			SUBSCRIBE: {
				SUCCESS: {

				},
				ERROR: 'Beim Abonnieren des RSS-Feeds ist ein Fehler aufgetreten.',
			},
			STATUS: {
				NO_ITEMS: 'Im angegebenen RSS-Feed wurden keine Artikel gefunden.',
				ERROR: 'Beim Abrufen des RSS-Feeds ist ein Fehler aufgetreten.',
			},
		},
		CONFIG: {
			GROUP_DESCRIPTION: 'Interact with guild settings.',
			SET: {
				GROUP_DESCRIPTION: 'Configure guild settings.',
				PRIMARY_COLOR: {
					DESCRIPTION: 'Set the primary color of the bot.',
					OPTIONS: {
						COLOR: {
							NAME: 'new_color',
							DESCRIPTION: 'The new primary color of the bot. (Hex-Code)',
						},
						EMBED: {
							DESCRIPTION: 'Primary color changed to `{prefix}`.',
							REGEX_ERROR: 'Please provide a valid hex color code.',
						},
					},
				},
			},
		},
	},
} satisfies Translation

export default de
