import { env } from '@/env'

export const generalConfig: GeneralConfigType = {

	name: 'tscord', // the name of your bot
	description: '', // the description of your bot
	defaultLocale: 'de', // default language of the bot, must be a valid locale
	ownerId: env.BOT_OWNER_ID,
	timezone: 'Europe/Paris', // default TimeZone to well format and localize dates (logs, stats, etc)

	simpleCommandsPrefix: '!', // default prefix for simple command messages (old way to do commands on discord)
	automaticDeferring: false, // enable or not the automatic deferring of the replies of the bot on the command interactions

	// useful links
	links: {
		invite: 'https://invite-bot.cyberca.de',
		supportServer: 'https://discord.com/your_invitation_link',
		gitRemoteRepo: 'https://github.com/cybercade/cybercade-bot',
	},

	musicPlayer: true, // enable or not the music player (Lavalink)

	automaticUploadImagesToImgur: false, // enable or not the automatic assets upload

	devs: [
		'350897207261659137', // Lucas
		'416308528274210828', // Jan
	], // discord IDs of the devs that are working on the bot (you don't have to put the owner's id here)

	// define the bot activities (phrases under its name). Types can be: PLAYING, LISTENING, WATCHING, STREAMING
	activities: [
		{
			text: env.BOT_ACTIVITY_TEXT,
			type: env.BOT_ACTIVITY_TYPE,
		},
	],

}

// global colors
export const colorsConfig = {
	primary: '#2F3136',
}
