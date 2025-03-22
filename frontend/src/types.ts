export interface Config {
  SERVER_URL: string;
}

export type SearchType = 'web' | 'images' | 'news' | 'videos';

export interface SearchResult {
  title: string;
  url: string;
  description?: string;
  thumbnail?: string;
  age?: string;
  duration?: string;
}

export interface SearchResponse {
  web?: { results: SearchResult[] };
  images?: { results: SearchResult[] };
  news?: { results: SearchResult[] };
  videos?: { results: SearchResult[] };
}

export interface SearchBarProps {
  onSearch: (results: any) => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  setLoading: (loading: boolean) => void;
}

export interface SearchResultsProps {
  results: {
    web?: { results: SearchResult[] };
    images?: { results: SearchResult[] };
    news?: { results: SearchResult[] };
    videos?: { results: SearchResult[] };
  } | null;
  searchType: SearchType;
  loading: boolean;
} 