import { Config } from '../types';

export const config: Config = {
  SERVER_URL: import.meta.env.VITE_SERVER_URL,
}

if (!config.SERVER_URL) {
  throw new Error('Server URL is not configured');
}
