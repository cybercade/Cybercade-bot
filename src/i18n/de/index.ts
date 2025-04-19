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
		MUSIC: {
			PLAYER_DISABLED: 'There is no player for this server.',
			NO_VOICE_CHANNEL: 'You must be in a voice channel to use this command.',
			NO_QUEUE: 'There is no queue for this server.',
			NO_TRACK: 'There is no track for this server.',
			NO_MATCHES: 'There are no matches for your search.',
			NO_PREVIOUS_TRACK: 'There is no previous track in this server.',
			NO_NEXT_TRACK: 'There is no next track in this server.',
			NO_VOLUME: 'The volume must be between 0 and 100.',
			NO_POSITION: 'The position must be between 0 and the length of the track.',
			NO_TIME: 'The time must be between 0 and the length of the track.',
			NO_DURATION: 'The duration must be between 0 and the length of the track.',
			NO_FILTER: 'The filter must be one of the following: {filters}',
		},
	},
	SHARED: {
		NO_COMMAND_DESCRIPTION: 'No description provided.',
		MUSIC: {
			EMBED: {
				INTERPRETER: 'Interpreter',
				LENGTH: 'Length',
				REQUESTED_BY: 'Requested by',
				ADDED_TO_QUEUE: 'Added to queue',
				ADDED_PLAYLIST_TO_QUEUE: 'Added playlist to queue',
				PLAYING: 'Now playing',
				SONGS: 'Songs',
				SONG_URL: 'Song URL',
				SAVED_SONG: 'Saved song',
				SONG_SAVED: 'Song saved',
				QUEUE: 'Queue',
				CURRENT_PLAYING: 'Current playing',
				PAGE: 'Page',
				STOPPED_PLAYING: 'Stopped playing',
				SKIPPED: 'Skipped to the next song!',
			},
		},
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
		PLAY: {
			NAME: 'play',
			DESCRIPTION: 'Play a song or a playlist',
			OPTIONS: {
				INPUT: {
					NAME: 'input',
					DESCRIPTION: 'The song or playlist to play',
				},
				POSITION: {
					NAME: 'position',
					DESCRIPTION: 'Add the song to the start or end of the queue',
				},
			},
			EMBED: {
				ADDED_TO_QUEUE: 'Added to queue',
				PLAYING: 'Now playing',
				NO_MATCHES: 'No matches found for your search',
				NO_TRACKS: 'No tracks found for your search',
				NO_PLAYLIST: 'No playlist found for your search',
				NO_PLAYLIST_TRACKS: 'No tracks found in the playlist',
			},
		},
		APPLICATION: {
			MODAL_TITLE: 'Bewerbung',
			MODAL_INPUT_NAME: 'Fiktiver Name',
			MODAL_INPUT_HANDLER: 'RSI Handle',
			MODAL_INPUT_APPLICATION: 'Bewerbung',
			MODAL_INPUT_APPLICATION_PLACEHOLDER: 'Erzähle uns etwas über dich!',
			CHANNEL_PREFIX: 'bewerbung',
			APPLICATION_PREFIX: 'Bewerbung von',
			ACCEPT: 'Akzeptieren',
			REJECT: 'Ablehnen',
			APPLICATION_SUCCESS: 'Bewerbung erfolgreich eingereicht!',
			MODAL_INPUT_REAL_NAME: 'Realer Vorname',
			ACCEPTED_MESSAGE: `**Herzlichen Glückwunsch, deine Bewerbung wurde angenommen!
Willkommen in der ArisCorp!**`,
			REJECTED_MESSAGE: 'Leider wurde deine Bewerbung abgelehnt.',
			ANNOUNCE_APPLICANT: `Hallo an alle Mitarbeiter der ArisCorp,

wir haben <@{user_id}> als neuen Anwärter gewonnen. Heißt ihn herzlich willkommen!`,
		},
		APPLICATION_INFO: {
			INFO: `🎚️ • Benutzung:

• Klicke auf "Bewerben", oder gebe den Befehl "/bewerben" ein.
• Nun öffnet sich ein Pop-Up in dem du folgende Infos eingibst:
  **-** Deinen fiktiven Namen (optional, dein echter Name)
  **-** Deinen RSI-Handle
  **-** Deine Bewerbung
• Nachdem du auf "Absenden" klickst, öffnet sich ein Kanal mit deiner Bewerbung.
• Jemand von unserem Recruitment-Team wird schnellstmöglich mit dir in Kontakt treten.

» **INFORMATION: Die ArisCorp hat eine Charter. Wir erwarten von jedem, der Teil der ArisCorp werden will, dass die Charter beachtet wird.**
*Diese ist unter https://ariscorp.de zu finden*

» Bitte habe Verständnis dafür, dass es zu Verzögerungen kommen kann. Du kannst jederzeit deine Bewerbung einsenden und sie bleibt so lange bestehen, bis sich jemand darum kümmert.`,
			BUTTON_APPLY: 'Bewerben',
		},
	},
} satisfies Translation

export default de
