import { SearchType } from '../types';
import { config } from '../config';

const API_BASE_URL = `${config.SERVER_URL}/api/search`;

export const searchBrave = async (query: string, offset: number, count: number, type: SearchType) => {
  const params = new URLSearchParams({
    q: query,
    offset: offset.toString(),
    count: count.toString()
  });

  const response = await fetch(`${API_BASE_URL}/${type}?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip',
    }
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
};
