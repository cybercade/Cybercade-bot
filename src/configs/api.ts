import { env } from '@/env'

export const apiConfig: APIConfigType = {

	enabled: true, // is the API server enabled or not
	port: env.API_PORT || 4000, // the port on which the API server should be exposed
}
