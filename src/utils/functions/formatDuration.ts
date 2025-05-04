export function formatDuration(ms: number): string {
	const seconds = Math.floor((ms / 1000) % 60)
	const minutes = Math.floor((ms / (1000 * 60)) % 60)
	const hours = Math.floor(ms / (1000 * 60 * 60))

	return `${hours ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
};