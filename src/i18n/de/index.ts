/* eslint-disable */
import type { Translation } from '../i18n-types'

const de = {
	GUARDS: {
		DISABLED_COMMAND: 'Dieser Befehl ist aktuell deaktiviert.',
		MAINTENANCE: 'Dieser Bot ist aktuell in Wartungsarbeiten.',
		GUILD_ONLY: 'Dieser Befehl kann nur in einem Server verwendet werden.',
		NSFW: 'Dieser Befehl kann nur in einem NSFW-Kanal verwendet werden.',
	},
	ERRORS: {
		UNKNOWN: 'Ein unbekannter Fehler ist aufgetreten.',
		MUSIC: {
			PLAYER_DISABLED: 'Der Musik-Player ist deaktiviert.',
			NO_MATCHES: 'Es gab keine Treffer für deine Eingabe.',
			NO_VOICE_CHANNEL: 'Du musst dich in einem Sprachkanal befinden.',
			NO_PREVIOUS_TRACK: 'There is no previous track in this server.',
			NO_NEXT_TRACK: 'There is no next track in this server.',
		},
	},
	SHARED: {
		NO_COMMAND_DESCRIPTION: 'Keine Beschreibung festgelegt.',
		MUSIC: {
			EMBED: {
				INTERPRETER: 'Interpreter',
				LENGTH: 'Länge',
				REQUESTED_BY: 'Abgespielt von',
				ADDED_TO_QUEUE: 'Zur Warteschlange hinzugefügt',
				ADDED_PLAYLIST_TO_QUEUE: 'Playlist zur Warteschlang hinzugefügt',
				PLAYING: 'Aktuell spielend',
				SONGS: 'Lieder',
				SONG_URL: 'Lied URL',
				SAVED_SONG: 'Gespeichertes Lied',
				SONG_SAVED: 'Lied gespeichert',
				QUEUE: 'Warteschlange',
				CURRENT_PLAYING: 'Aktuell spielend',
				PAGE: 'Seite',
				STOPPED_PLAYING: 'Musik gestoppt',
				SKIPPED: 'Zum nächsten Lied gesprungen!',
			},
		},
	},
	COMMANDS: {
		INVITE: {
			DESCRIPTION: 'Lade den Bot in dein Server ein!',
			EMBED: {
				TITLE: 'Lade mich zu deinem Server ein!',
				DESCRIPTION: '[Klicke hier]({link}) um mich einzuladen!',
			},
		},
		PREFIX: {
			NAME: 'prefix',
			DESCRIPTION: 'Ändere den Präfix für den Bot.',
			OPTIONS: {
				PREFIX: {
					NAME: 'new_prefix',
					DESCRIPTION: 'Der neue Präfix für den Bot.',
				},
			},
			EMBED: {
				DESCRIPTION: 'Präfix geändert zu `{prefix}`.',
			},
		},
		MAINTENANCE: {
			DESCRIPTION: 'Setze den Wartungsmodus für den Bot.',
			EMBED: {
				DESCRIPTION: 'Wartungsmodus gesetzt zu `{state}`.',
			},
		},
		STATS: {
			DESCRIPTION: 'Zeige Statistiken für den Bot an.',
			HEADERS: {
				COMMANDS: 'Befehle',
				GUILDS: 'Server',
				ACTIVE_USERS: 'Aktive Benutzer',
				USERS: 'Benutzer',
			},
		},
		HELP: {
			DESCRIPTION: 'Zeige globale Hilfe über den Bot und Befehle',
			EMBED: {
				TITLE: 'Hilfe',
				CATEGORY_TITLE: '{category} Befehle',
			},
			SELECT_MENU: {
				TITLE: 'Wähle eine Kategorie',
				CATEGORY_DESCRIPTION: '{category} Befehle',
			},
		},
		PING: {
			DESCRIPTION: 'Pong!',
			MESSAGE: '{member} Pong! Die Nachricht brauchte {time}ms.{heartbeat}',
		},
		MUSIC: {
			PLAY: {
				NAME: 'play',
				DESCRIPTION: 'Spiele ein Lied oder eine Playlist ab',
				OPTIONS: {
					INPUT: {
						NAME: 'eingabe',
						DESCRIPTION: 'Der song oder die Playlist',
					},
					POSITION: {
						NAME: 'position',
						DESCRIPTION: 'Als nächstes spielen oder am Ende der Warteschlang hinzufügen?',
						END: {
							NAME: 'Am ende',
						},
						START: {
							NAME: 'Als nächstes',
						},
					},
				},
				EMBED: {
					ADDED_TO_QUEUE: 'Zur Warteschlange hinzugefügt',
					PLAYING: 'Aktuell abgespielt',
					NO_MATCHES: 'Keine Treffer für deine Suche gefunden',
					NO_TRACKS: 'Keine Lieder gefunden',
					NO_PLAYLIST: 'Keine Playlist gefunden für deine Suche',
					NO_PLAYLIST_TRACKS: 'Playlist ist leer',
				},
			},
			NOWPLAYING: {
				NAME: 'nowplaying',
				DESCRIPTION: 'Aktuell spielendes Lied und Warteschlange anzeigen lassen',
			},
			QUEUE: {
				NAME: 'queue',
				DESCRIPTION: 'Aktuell spielendes Lied und Warteschlange anzeigen lassen',
			},
			SAVE: {
				NAME: 'save',
				DESCRIPTION: 'Aktuell spielendes Lied speichern',
			},
			STOP: {
				NAME: 'stop',
				DESCRIPTION: 'Musik stoppen',
			},
			SKIP: {
				NAME: 'skip',
				DESCRIPTION: 'Spiele das nächste Lied in der Warteschlange',
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
		CONFIG: {
			NAME: 'config',
			DESCRIPTION: 'Interact with guild settings.',
			SET: {
				NAME: 'set',
				DESCRIPTION: 'Configure guild settings.',
				PRIMARY_COLOR: {
					NAME: 'primarycolor',
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
