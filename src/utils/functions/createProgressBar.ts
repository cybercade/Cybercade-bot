import { Player } from 'moonlink.js'

import { formatDuration } from './formatDuration'

export function createProgressBar(player: Player, length: number = 10): string {
	const progress = Math.round((player.current.position / player.current.duration) * length)
	const button = player.paused ? '⏹️' : '▶️'
	const elapsedTime = player.current.isStream ? 'live' : `${formatDuration(player.current.position)}/${formatDuration(player.current.duration)}`

	return `${button} ${'▬'.repeat(progress)}🔘${'▬'.repeat(length - progress)} \`[${elapsedTime}]\``
};