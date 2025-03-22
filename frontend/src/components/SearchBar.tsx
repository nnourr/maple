import { SearchBarProps, SearchType } from '../types';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { config } from '../config';

const API_BASE_URL = `${config.SERVER_URL}/api/search`;

const searchTypes: { label: string; value: SearchType }[] = [
  { label: 'Web', value: 'web' },
  { label: 'Images', value: 'images' },
  { label: 'News', value: 'news' },
  { label: 'Videos', value: 'videos' },
];

export default function SearchBar({ onSearch, searchType, setSearchType, setLoading }: SearchBarProps) {
  let [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/${searchType}`, {
        params: {
          q: query,
          count: 20
        }
      });
      onSearch(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      onSearch(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSearch}>
          <div className="flex justify-center mb-6">
            <div className="rounded-lg border border-gray-200">
              {searchTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`px-4 py-2 text-sm font-medium ${
                    searchType === type.value
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } ${
                    type.value === 'web'
                      ? 'rounded-l-lg'
                      : type.value === 'videos'
                      ? 'rounded-r-lg'
                      : ''
                  }`}
                  onClick={() => setSearchType(type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search anything..."
              value={query}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('q', e.target.value);
                setSearchParams(newParams);
              }}
              className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="sr-only">Search</span>
              🔍
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 