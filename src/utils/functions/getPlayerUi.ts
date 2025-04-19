import { fromMS, Queue } from '@discordx/lava-queue'

export function getPlayerUi(queue: Queue) {
	const song = queue.currentPlaybackTrack

	if (!song) {
		return ''
	}

	const position = queue.currentPlaybackPosition
	const button = queue.isPlaying ? '⏹️' : '▶️'
	const progressBar = getProgressBar(10, position / song.info.length)
	const elapsedTime = song.info.isStream ? 'live' : `${fromMS(position)}/${fromMS(song.info.length)}`
	// Check for Song and Queue Loop
	const loop = false ? '🔂' : false ? '🔁' : ''

	// const vol: string = typeof queue. === 'number' ? `${player.getVolume()!}%` : '';
	return `${button} ${progressBar} \`[${elapsedTime}]\` ${loop}`
};

export function getProgressBar(width: number, progress: number): string {
	const dotPosition = Math.floor(width * progress)

	let res = ''

	for (let i = 0; i < width; i++) {
		if (i === dotPosition) {
			res += '🔘'
		} else {
			res += '▬'
		}
	}

	return res
};