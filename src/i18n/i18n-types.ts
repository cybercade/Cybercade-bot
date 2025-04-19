// This file was auto-generated by 'typesafe-i18n'. Any manual changes will be overwritten.
/* eslint-disable */
import type { BaseTranslation as BaseTranslationType, LocalizedString, RequiredParams } from 'typesafe-i18n'

export type BaseTranslation = BaseTranslationType
export type BaseLocale = 'en'

export type Locales =
	| 'de'
	| 'en'

export type Translation = RootTranslation

export type Translations = RootTranslation

type RootTranslation = {
	GUARDS: {
		/**
		 * T​h​i​s​ ​c​o​m​m​a​n​d​ ​i​s​ ​c​u​r​r​e​n​t​l​y​ ​d​i​s​a​b​l​e​d​.
		 */
		DISABLED_COMMAND: string
		/**
		 * T​h​i​s​ ​b​o​t​ ​i​s​ ​c​u​r​r​e​n​t​l​y​ ​i​n​ ​m​a​i​n​t​e​n​a​n​c​e​ ​m​o​d​e​.
		 */
		MAINTENANCE: string
		/**
		 * T​h​i​s​ ​c​o​m​m​a​n​d​ ​c​a​n​ ​o​n​l​y​ ​b​e​ ​u​s​e​d​ ​i​n​ ​a​ ​s​e​r​v​e​r​.
		 */
		GUILD_ONLY: string
		/**
		 * T​h​i​s​ ​c​o​m​m​a​n​d​ ​c​a​n​ ​o​n​l​y​ ​b​e​ ​u​s​e​d​ ​i​n​ ​a​ ​N​S​F​W​ ​c​h​a​n​n​e​l​.
		 */
		NSFW: string
	}
	ERRORS: {
		/**
		 * A​n​ ​u​n​k​n​o​w​n​ ​e​r​r​o​r​ ​o​c​c​u​r​r​e​d​.
		 */
		UNKNOWN: string
		MUSIC: {
			/**
			 * M​u​s​i​c​ ​p​l​a​y​e​r​ ​i​s​ ​d​i​s​a​b​l​e​d​.
			 */
			PLAYER_DISABLED: string
			/**
			 * T​h​e​r​e​ ​a​r​e​ ​n​o​ ​m​a​t​c​h​e​s​ ​f​o​r​ ​y​o​u​r​ ​s​e​a​r​c​h​.
			 */
			NO_MATCHES: string
			/**
			 * D​u​ ​m​u​s​s​t​ ​d​i​c​h​ ​i​n​ ​e​i​n​e​m​ ​S​p​r​a​c​h​k​a​n​a​l​ ​b​e​f​i​n​d​e​n​.
			 */
			NO_VOICE_CHANNEL: string
			/**
			 * T​h​e​r​e​ ​i​s​ ​n​o​ ​p​r​e​v​i​o​u​s​ ​t​r​a​c​k​ ​i​n​ ​t​h​i​s​ ​s​e​r​v​e​r​.
			 */
			NO_PREVIOUS_TRACK: string
			/**
			 * T​h​e​r​e​ ​i​s​ ​n​o​ ​n​e​x​t​ ​t​r​a​c​k​ ​i​n​ ​t​h​i​s​ ​s​e​r​v​e​r​.
			 */
			NO_NEXT_TRACK: string
		}
	}
	SHARED: {
		/**
		 * N​o​ ​d​e​s​c​r​i​p​t​i​o​n​ ​p​r​o​v​i​d​e​d​.
		 */
		NO_COMMAND_DESCRIPTION: string
		MUSIC: {
			EMBED: {
				/**
				 * I​n​t​e​r​p​r​e​t​e​r
				 */
				INTERPRETER: string
				/**
				 * L​e​n​g​t​h
				 */
				LENGTH: string
				/**
				 * R​e​q​u​e​s​t​e​d​ ​b​y
				 */
				REQUESTED_BY: string
				/**
				 * A​d​d​e​d​ ​t​o​ ​q​u​e​u​e
				 */
				ADDED_TO_QUEUE: string
				/**
				 * A​d​d​e​d​ ​p​l​a​y​l​i​s​t​ ​t​o​ ​q​u​e​u​e
				 */
				ADDED_PLAYLIST_TO_QUEUE: string
				/**
				 * N​o​w​ ​p​l​a​y​i​n​g
				 */
				PLAYING: string
				/**
				 * S​o​n​g​s
				 */
				SONGS: string
				/**
				 * S​o​n​g​ ​U​R​L
				 */
				SONG_URL: string
				/**
				 * S​a​v​e​d​ ​s​o​n​g
				 */
				SAVED_SONG: string
				/**
				 * S​o​n​g​ ​s​a​v​e​d​!
				 */
				SONG_SAVED: string
				/**
				 * Q​u​e​u​e
				 */
				QUEUE: string
				/**
				 * C​u​r​r​e​n​t​ ​p​l​a​y​i​n​g
				 */
				CURRENT_PLAYING: string
				/**
				 * P​a​g​e
				 */
				PAGE: string
				/**
				 * S​t​o​p​p​e​d​ ​p​l​a​y​i​n​g​!
				 */
				STOPPED_PLAYING: string
				/**
				 * S​k​i​p​p​e​d​ ​t​o​ ​t​h​e​ ​n​e​x​t​ ​s​o​n​g​!
				 */
				SKIPPED: string
			}
		}
	}
	COMMANDS: {
		INVITE: {
			/**
			 * I​n​v​i​t​e​ ​t​h​e​ ​b​o​t​ ​t​o​ ​y​o​u​r​ ​s​e​r​v​e​r​!
			 */
			DESCRIPTION: string
			EMBED: {
				/**
				 * I​n​v​i​t​e​ ​m​e​ ​o​n​ ​y​o​u​r​ ​s​e​r​v​e​r​!
				 */
				TITLE: string
				/**
				 * [​C​l​i​c​k​ ​h​e​r​e​]​(​{​l​i​n​k​}​)​ ​t​o​ ​i​n​v​i​t​e​ ​m​e​!
				 * @param {unknown} link
				 */
				DESCRIPTION: RequiredParams<'link'>
			}
		}
		PREFIX: {
			/**
			 * p​r​e​f​i​x
			 */
			NAME: string
			/**
			 * C​h​a​n​g​e​ ​t​h​e​ ​p​r​e​f​i​x​ ​o​f​ ​t​h​e​ ​b​o​t​.
			 */
			DESCRIPTION: string
			OPTIONS: {
				PREFIX: {
					/**
					 * n​e​w​_​p​r​e​f​i​x
					 */
					NAME: string
					/**
					 * T​h​e​ ​n​e​w​ ​p​r​e​f​i​x​ ​o​f​ ​t​h​e​ ​b​o​t​.
					 */
					DESCRIPTION: string
				}
			}
			EMBED: {
				/**
				 * P​r​e​f​i​x​ ​c​h​a​n​g​e​d​ ​t​o​ ​`​{​p​r​e​f​i​x​}​`​.
				 * @param {string} prefix
				 */
				DESCRIPTION: RequiredParams<'prefix'>
			}
		}
		MAINTENANCE: {
			/**
			 * S​e​t​ ​t​h​e​ ​m​a​i​n​t​e​n​a​n​c​e​ ​m​o​d​e​ ​o​f​ ​t​h​e​ ​b​o​t​.
			 */
			DESCRIPTION: string
			EMBED: {
				/**
				 * M​a​i​n​t​e​n​a​n​c​e​ ​m​o​d​e​ ​s​e​t​ ​t​o​ ​`​{​s​t​a​t​e​}​`​.
				 * @param {string} state
				 */
				DESCRIPTION: RequiredParams<'state'>
			}
		}
		STATS: {
			/**
			 * G​e​t​ ​s​o​m​e​ ​s​t​a​t​s​ ​a​b​o​u​t​ ​t​h​e​ ​b​o​t​.
			 */
			DESCRIPTION: string
			HEADERS: {
				/**
				 * C​o​m​m​a​n​d​s
				 */
				COMMANDS: string
				/**
				 * G​u​i​l​d
				 */
				GUILDS: string
				/**
				 * A​c​t​i​v​e​ ​U​s​e​r​s
				 */
				ACTIVE_USERS: string
				/**
				 * U​s​e​r​s
				 */
				USERS: string
			}
		}
		HELP: {
			/**
			 * G​e​t​ ​g​l​o​b​a​l​ ​h​e​l​p​ ​a​b​o​u​t​ ​t​h​e​ ​b​o​t​ ​a​n​d​ ​i​t​s​ ​c​o​m​m​a​n​d​s
			 */
			DESCRIPTION: string
			EMBED: {
				/**
				 * H​e​l​p​ ​p​a​n​e​l
				 */
				TITLE: string
				/**
				 * {​c​a​t​e​g​o​r​y​}​ ​C​o​m​m​a​n​d​s
				 * @param {string} category
				 */
				CATEGORY_TITLE: RequiredParams<'category'>
			}
			SELECT_MENU: {
				/**
				 * S​e​l​e​c​t​ ​a​ ​c​a​t​e​g​o​r​y
				 */
				TITLE: string
				/**
				 * {​c​a​t​e​g​o​r​y​}​ ​c​o​m​m​a​n​d​s
				 * @param {string} category
				 */
				CATEGORY_DESCRIPTION: RequiredParams<'category'>
			}
		}
		PING: {
			/**
			 * P​o​n​g​!
			 */
			DESCRIPTION: string
			/**
			 * {​m​e​m​b​e​r​}​ ​P​o​n​g​!​ ​T​h​e​ ​m​e​s​s​a​g​e​ ​r​o​u​n​d​-​t​r​i​p​ ​t​o​o​k​ ​{​t​i​m​e​}​m​s​.​{​h​e​a​r​t​b​e​a​t​}
			 * @param {string} heartbeat
			 * @param {string} member
			 * @param {number} time
			 */
			MESSAGE: RequiredParams<'heartbeat' | 'member' | 'time'>
		}
		MUSIC: {
			PLAY: {
				/**
				 * p​l​a​y
				 */
				NAME: string
				/**
				 * P​l​a​y​ ​a​ ​s​o​n​g​ ​o​r​ ​a​ ​p​l​a​y​l​i​s​t
				 */
				DESCRIPTION: string
				OPTIONS: {
					INPUT: {
						/**
						 * i​n​p​u​t
						 */
						NAME: string
						/**
						 * T​h​e​ ​s​o​n​g​ ​o​r​ ​p​l​a​y​l​i​s​t​ ​t​o​ ​p​l​a​y
						 */
						DESCRIPTION: string
					}
					POSITION: {
						/**
						 * p​o​s​i​t​i​o​n
						 */
						NAME: string
						/**
						 * A​d​d​ ​t​h​e​ ​s​o​n​g​ ​t​o​ ​t​h​e​ ​s​t​a​r​t​ ​o​r​ ​e​n​d​ ​o​f​ ​t​h​e​ ​q​u​e​u​e
						 */
						DESCRIPTION: string
						END: {
							/**
							 * A​t​ ​t​h​e​ ​e​n​d
							 */
							NAME: string
						}
						START: {
							/**
							 * A​t​ ​t​h​e​ ​s​t​a​r​t
							 */
							NAME: string
						}
					}
				}
				EMBED: {
					/**
					 * A​d​d​e​d​ ​t​o​ ​q​u​e​u​e
					 */
					ADDED_TO_QUEUE: string
					/**
					 * N​o​w​ ​p​l​a​y​i​n​g
					 */
					PLAYING: string
					/**
					 * N​o​ ​m​a​t​c​h​e​s​ ​f​o​u​n​d​ ​f​o​r​ ​y​o​u​r​ ​s​e​a​r​c​h
					 */
					NO_MATCHES: string
					/**
					 * N​o​ ​t​r​a​c​k​s​ ​f​o​u​n​d​ ​f​o​r​ ​y​o​u​r​ ​s​e​a​r​c​h
					 */
					NO_TRACKS: string
					/**
					 * N​o​ ​p​l​a​y​l​i​s​t​ ​f​o​u​n​d​ ​f​o​r​ ​y​o​u​r​ ​s​e​a​r​c​h
					 */
					NO_PLAYLIST: string
					/**
					 * N​o​ ​t​r​a​c​k​s​ ​f​o​u​n​d​ ​i​n​ ​t​h​e​ ​p​l​a​y​l​i​s​t
					 */
					NO_PLAYLIST_TRACKS: string
				}
			}
			NOWPLAYING: {
				/**
				 * n​o​w​p​l​a​y​i​n​g
				 */
				NAME: string
				/**
				 * V​i​e​w​ ​c​u​r​r​e​n​t​l​y​ ​p​l​a​y​i​n​g​ ​s​o​n​g​ ​a​n​d​ ​q​u​e​u​e
				 */
				DESCRIPTION: string
			}
			QUEUE: {
				/**
				 * q​u​e​u​e
				 */
				NAME: string
				/**
				 * V​i​e​w​ ​c​u​r​r​e​n​t​l​y​ ​p​l​a​y​i​n​g​ ​s​o​n​g​ ​a​n​d​ ​q​u​e​u​e
				 */
				DESCRIPTION: string
			}
			SAVE: {
				/**
				 * s​a​v​e
				 */
				NAME: string
				/**
				 * S​a​v​e​ ​c​u​r​r​e​n​t​l​y​ ​p​l​a​y​i​n​g​ ​s​o​n​g
				 */
				DESCRIPTION: string
			}
			STOP: {
				/**
				 * s​t​o​p
				 */
				NAME: string
				/**
				 * S​t​o​p​ ​p​l​a​y​i​n​g​ ​m​u​s​i​c
				 */
				DESCRIPTION: string
			}
			SKIP: {
				/**
				 * s​k​i​p
				 */
				NAME: string
				/**
				 * P​l​a​y​ ​t​h​e​ ​n​e​x​t​ ​s​o​n​g​ ​i​n​ ​q​u​e​u​e
				 */
				DESCRIPTION: string
			}
		}
		APPLICATION: {
			/**
			 * A​p​p​l​i​c​a​t​i​o​n
			 */
			MODAL_TITLE: string
			/**
			 * N​a​m​e
			 */
			MODAL_INPUT_NAME: string
			/**
			 * R​e​a​l​ ​N​a​m​e
			 */
			MODAL_INPUT_REAL_NAME: string
			/**
			 * H​a​n​d​l​e​r
			 */
			MODAL_INPUT_HANDLER: string
			/**
			 * A​p​p​l​i​c​a​t​i​o​n
			 */
			MODAL_INPUT_APPLICATION: string
			/**
			 * T​e​l​l​ ​u​s​ ​a​b​o​u​t​ ​y​o​u​r​s​e​l​f​!
			 */
			MODAL_INPUT_APPLICATION_PLACEHOLDER: string
			/**
			 * a​p​p​l​i​c​a​t​i​o​n
			 */
			CHANNEL_PREFIX: string
			/**
			 * A​p​p​l​i​c​a​t​i​o​n​ ​f​r​o​m
			 */
			APPLICATION_PREFIX: string
			/**
			 * A​c​c​e​p​t
			 */
			ACCEPT: string
			/**
			 * R​e​j​e​c​t
			 */
			REJECT: string
			/**
			 * A​p​p​l​i​c​a​t​i​o​n​ ​s​u​c​c​e​s​s​f​u​l​l​y​ ​s​u​b​m​i​t​t​e​d​!
			 */
			APPLICATION_SUCCESS: string
			/**
			 * Y​o​u​ ​h​a​v​e​ ​b​e​e​n​ ​a​c​c​e​p​t​e​d​ ​a​s​ ​a​n​ ​a​p​p​l​i​c​a​n​t​!
			 */
			ACCEPTED_MESSAGE: string
			/**
			 * Y​o​u​ ​h​a​v​e​ ​b​e​e​n​ ​r​e​j​e​c​t​e​d​ ​a​s​ ​a​n​ ​a​p​p​l​i​c​a​n​t​!
			 */
			REJECTED_MESSAGE: string
			/**
			 * H​e​l​l​o​ ​e​v​e​r​y​o​n​e​ ​a​t​ ​A​r​i​s​C​o​r​p​,​
		​
		​w​e​ ​h​a​v​e​ ​<​@​{​u​s​e​r​_​i​d​}​>​ ​a​s​ ​n​e​w​ ​a​p​p​l​i​c​a​n​t​!
			 * @param {unknown} user_id
			 */
			ANNOUNCE_APPLICANT: RequiredParams<'user_id'>
		}
		APPLICATION_INFO: {
			/**
			 * N​/​A
			 */
			INFO: string
			/**
			 * A​p​p​l​y
			 */
			BUTTON_APPLY: string
		}
		CONFIG: {
			/**
			 * c​o​n​f​i​g
			 */
			NAME: string
			/**
			 * I​n​t​e​r​a​c​t​ ​w​i​t​h​ ​g​u​i​l​d​ ​s​e​t​t​i​n​g​s​.
			 */
			DESCRIPTION: string
			SET: {
				/**
				 * s​e​t
				 */
				NAME: string
				/**
				 * C​o​n​f​i​g​u​r​e​ ​g​u​i​l​d​ ​s​e​t​t​i​n​g​s​.
				 */
				DESCRIPTION: string
				PRIMARY_COLOR: {
					/**
					 * p​r​i​m​a​r​y​c​o​l​o​r
					 */
					NAME: string
					/**
					 * S​e​t​ ​t​h​e​ ​p​r​i​m​a​r​y​ ​c​o​l​o​r​ ​o​f​ ​t​h​e​ ​b​o​t​.
					 */
					DESCRIPTION: string
					OPTIONS: {
						COLOR: {
							/**
							 * n​e​w​_​c​o​l​o​r
							 */
							NAME: string
							/**
							 * T​h​e​ ​n​e​w​ ​p​r​i​m​a​r​y​ ​c​o​l​o​r​ ​o​f​ ​t​h​e​ ​b​o​t​.​ ​(​H​e​x​-​C​o​d​e​)
							 */
							DESCRIPTION: string
						}
						EMBED: {
							/**
							 * P​r​i​m​a​r​y​ ​c​o​l​o​r​ ​c​h​a​n​g​e​d​ ​t​o​ ​`​{​p​r​e​f​i​x​}​`​.
							 * @param {string} prefix
							 */
							DESCRIPTION: RequiredParams<'prefix'>
							/**
							 * P​l​e​a​s​e​ ​p​r​o​v​i​d​e​ ​a​ ​v​a​l​i​d​ ​h​e​x​ ​c​o​l​o​r​ ​c​o​d​e​.
							 */
							REGEX_ERROR: string
						}
					}
				}
			}
		}
	}
}

export type TranslationFunctions = {
	GUARDS: {
		/**
		 * This command is currently disabled.
		 */
		DISABLED_COMMAND: () => LocalizedString
		/**
		 * This bot is currently in maintenance mode.
		 */
		MAINTENANCE: () => LocalizedString
		/**
		 * This command can only be used in a server.
		 */
		GUILD_ONLY: () => LocalizedString
		/**
		 * This command can only be used in a NSFW channel.
		 */
		NSFW: () => LocalizedString
	}
	ERRORS: {
		/**
		 * An unknown error occurred.
		 */
		UNKNOWN: () => LocalizedString
		MUSIC: {
			/**
			 * Music player is disabled.
			 */
			PLAYER_DISABLED: () => LocalizedString
			/**
			 * There are no matches for your search.
			 */
			NO_MATCHES: () => LocalizedString
			/**
			 * Du musst dich in einem Sprachkanal befinden.
			 */
			NO_VOICE_CHANNEL: () => LocalizedString
			/**
			 * There is no previous track in this server.
			 */
			NO_PREVIOUS_TRACK: () => LocalizedString
			/**
			 * There is no next track in this server.
			 */
			NO_NEXT_TRACK: () => LocalizedString
		}
	}
	SHARED: {
		/**
		 * No description provided.
		 */
		NO_COMMAND_DESCRIPTION: () => LocalizedString
		MUSIC: {
			EMBED: {
				/**
				 * Interpreter
				 */
				INTERPRETER: () => LocalizedString
				/**
				 * Length
				 */
				LENGTH: () => LocalizedString
				/**
				 * Requested by
				 */
				REQUESTED_BY: () => LocalizedString
				/**
				 * Added to queue
				 */
				ADDED_TO_QUEUE: () => LocalizedString
				/**
				 * Added playlist to queue
				 */
				ADDED_PLAYLIST_TO_QUEUE: () => LocalizedString
				/**
				 * Now playing
				 */
				PLAYING: () => LocalizedString
				/**
				 * Songs
				 */
				SONGS: () => LocalizedString
				/**
				 * Song URL
				 */
				SONG_URL: () => LocalizedString
				/**
				 * Saved song
				 */
				SAVED_SONG: () => LocalizedString
				/**
				 * Song saved!
				 */
				SONG_SAVED: () => LocalizedString
				/**
				 * Queue
				 */
				QUEUE: () => LocalizedString
				/**
				 * Current playing
				 */
				CURRENT_PLAYING: () => LocalizedString
				/**
				 * Page
				 */
				PAGE: () => LocalizedString
				/**
				 * Stopped playing!
				 */
				STOPPED_PLAYING: () => LocalizedString
				/**
				 * Skipped to the next song!
				 */
				SKIPPED: () => LocalizedString
			}
		}
	}
	COMMANDS: {
		INVITE: {
			/**
			 * Invite the bot to your server!
			 */
			DESCRIPTION: () => LocalizedString
			EMBED: {
				/**
				 * Invite me on your server!
				 */
				TITLE: () => LocalizedString
				/**
				 * [Click here]({link}) to invite me!
				 */
				DESCRIPTION: (arg: { link: unknown }) => LocalizedString
			}
		}
		PREFIX: {
			/**
			 * prefix
			 */
			NAME: () => LocalizedString
			/**
			 * Change the prefix of the bot.
			 */
			DESCRIPTION: () => LocalizedString
			OPTIONS: {
				PREFIX: {
					/**
					 * new_prefix
					 */
					NAME: () => LocalizedString
					/**
					 * The new prefix of the bot.
					 */
					DESCRIPTION: () => LocalizedString
				}
			}
			EMBED: {
				/**
				 * Prefix changed to `{prefix}`.
				 */
				DESCRIPTION: (arg: { prefix: string }) => LocalizedString
			}
		}
		MAINTENANCE: {
			/**
			 * Set the maintenance mode of the bot.
			 */
			DESCRIPTION: () => LocalizedString
			EMBED: {
				/**
				 * Maintenance mode set to `{state}`.
				 */
				DESCRIPTION: (arg: { state: string }) => LocalizedString
			}
		}
		STATS: {
			/**
			 * Get some stats about the bot.
			 */
			DESCRIPTION: () => LocalizedString
			HEADERS: {
				/**
				 * Commands
				 */
				COMMANDS: () => LocalizedString
				/**
				 * Guild
				 */
				GUILDS: () => LocalizedString
				/**
				 * Active Users
				 */
				ACTIVE_USERS: () => LocalizedString
				/**
				 * Users
				 */
				USERS: () => LocalizedString
			}
		}
		HELP: {
			/**
			 * Get global help about the bot and its commands
			 */
			DESCRIPTION: () => LocalizedString
			EMBED: {
				/**
				 * Help panel
				 */
				TITLE: () => LocalizedString
				/**
				 * {category} Commands
				 */
				CATEGORY_TITLE: (arg: { category: string }) => LocalizedString
			}
			SELECT_MENU: {
				/**
				 * Select a category
				 */
				TITLE: () => LocalizedString
				/**
				 * {category} commands
				 */
				CATEGORY_DESCRIPTION: (arg: { category: string }) => LocalizedString
			}
		}
		PING: {
			/**
			 * Pong!
			 */
			DESCRIPTION: () => LocalizedString
			/**
			 * {member} Pong! The message round-trip took {time}ms.{heartbeat}
			 */
			MESSAGE: (arg: { heartbeat: string, member: string, time: number }) => LocalizedString
		}
		MUSIC: {
			PLAY: {
				/**
				 * play
				 */
				NAME: () => LocalizedString
				/**
				 * Play a song or a playlist
				 */
				DESCRIPTION: () => LocalizedString
				OPTIONS: {
					INPUT: {
						/**
						 * input
						 */
						NAME: () => LocalizedString
						/**
						 * The song or playlist to play
						 */
						DESCRIPTION: () => LocalizedString
					}
					POSITION: {
						/**
						 * position
						 */
						NAME: () => LocalizedString
						/**
						 * Add the song to the start or end of the queue
						 */
						DESCRIPTION: () => LocalizedString
						END: {
							/**
							 * At the end
							 */
							NAME: () => LocalizedString
						}
						START: {
							/**
							 * At the start
							 */
							NAME: () => LocalizedString
						}
					}
				}
				EMBED: {
					/**
					 * Added to queue
					 */
					ADDED_TO_QUEUE: () => LocalizedString
					/**
					 * Now playing
					 */
					PLAYING: () => LocalizedString
					/**
					 * No matches found for your search
					 */
					NO_MATCHES: () => LocalizedString
					/**
					 * No tracks found for your search
					 */
					NO_TRACKS: () => LocalizedString
					/**
					 * No playlist found for your search
					 */
					NO_PLAYLIST: () => LocalizedString
					/**
					 * No tracks found in the playlist
					 */
					NO_PLAYLIST_TRACKS: () => LocalizedString
				}
			}
			NOWPLAYING: {
				/**
				 * nowplaying
				 */
				NAME: () => LocalizedString
				/**
				 * View currently playing song and queue
				 */
				DESCRIPTION: () => LocalizedString
			}
			QUEUE: {
				/**
				 * queue
				 */
				NAME: () => LocalizedString
				/**
				 * View currently playing song and queue
				 */
				DESCRIPTION: () => LocalizedString
			}
			SAVE: {
				/**
				 * save
				 */
				NAME: () => LocalizedString
				/**
				 * Save currently playing song
				 */
				DESCRIPTION: () => LocalizedString
			}
			STOP: {
				/**
				 * stop
				 */
				NAME: () => LocalizedString
				/**
				 * Stop playing music
				 */
				DESCRIPTION: () => LocalizedString
			}
			SKIP: {
				/**
				 * skip
				 */
				NAME: () => LocalizedString
				/**
				 * Play the next song in queue
				 */
				DESCRIPTION: () => LocalizedString
			}
		}
		APPLICATION: {
			/**
			 * Application
			 */
			MODAL_TITLE: () => LocalizedString
			/**
			 * Name
			 */
			MODAL_INPUT_NAME: () => LocalizedString
			/**
			 * Real Name
			 */
			MODAL_INPUT_REAL_NAME: () => LocalizedString
			/**
			 * Handler
			 */
			MODAL_INPUT_HANDLER: () => LocalizedString
			/**
			 * Application
			 */
			MODAL_INPUT_APPLICATION: () => LocalizedString
			/**
			 * Tell us about yourself!
			 */
			MODAL_INPUT_APPLICATION_PLACEHOLDER: () => LocalizedString
			/**
			 * application
			 */
			CHANNEL_PREFIX: () => LocalizedString
			/**
			 * Application from
			 */
			APPLICATION_PREFIX: () => LocalizedString
			/**
			 * Accept
			 */
			ACCEPT: () => LocalizedString
			/**
			 * Reject
			 */
			REJECT: () => LocalizedString
			/**
			 * Application successfully submitted!
			 */
			APPLICATION_SUCCESS: () => LocalizedString
			/**
			 * You have been accepted as an applicant!
			 */
			ACCEPTED_MESSAGE: () => LocalizedString
			/**
			 * You have been rejected as an applicant!
			 */
			REJECTED_MESSAGE: () => LocalizedString
			/**
			 * Hello everyone at ArisCorp,
	
		we have <@{user_id}> as new applicant!
			 */
			ANNOUNCE_APPLICANT: (arg: { user_id: unknown }) => LocalizedString
		}
		APPLICATION_INFO: {
			/**
			 * N/A
			 */
			INFO: () => LocalizedString
			/**
			 * Apply
			 */
			BUTTON_APPLY: () => LocalizedString
		}
		CONFIG: {
			/**
			 * config
			 */
			NAME: () => LocalizedString
			/**
			 * Interact with guild settings.
			 */
			DESCRIPTION: () => LocalizedString
			SET: {
				/**
				 * set
				 */
				NAME: () => LocalizedString
				/**
				 * Configure guild settings.
				 */
				DESCRIPTION: () => LocalizedString
				PRIMARY_COLOR: {
					/**
					 * primarycolor
					 */
					NAME: () => LocalizedString
					/**
					 * Set the primary color of the bot.
					 */
					DESCRIPTION: () => LocalizedString
					OPTIONS: {
						COLOR: {
							/**
							 * new_color
							 */
							NAME: () => LocalizedString
							/**
							 * The new primary color of the bot. (Hex-Code)
							 */
							DESCRIPTION: () => LocalizedString
						}
						EMBED: {
							/**
							 * Primary color changed to `{prefix}`.
							 */
							DESCRIPTION: (arg: { prefix: string }) => LocalizedString
							/**
							 * Please provide a valid hex color code.
							 */
							REGEX_ERROR: () => LocalizedString
						}
					}
				}
			}
		}
	}
}

export type Formatters = {}
