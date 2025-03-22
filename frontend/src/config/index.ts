import { Config } from '../types';

export const config: Config = {
  SERVER_URL: import.meta.env.DEV ? 'http://localhost:3000' : 'https://maple-backend-production.up.railway.app', // fix later
}

if (!config.SERVER_URL) {
  throw new Error('Server URL is not configured');
}
