import { Config } from '../types';

export const config: Config = {
  SERVER_URL: import.meta.env.VITE_SERVER_URL || 'http://localhost:3000',
}

if (!config.SERVER_URL) {
  throw new Error('Server URL is not configured');
}
