import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SearchType } from '../types';
import { config } from '../config';

const API_BASE_URL = `${config.SERVER_URL}/api/search`;

const searchTypes: { label: string; value: SearchType }[] = [
  { label: 'All', value: 'web' },
  { label: 'Images', value: 'images' },
  { label: 'News', value: 'news' },
  { label: 'Videos', value: 'videos' },
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const query = searchParams.get('q') || '';
  const type = (searchParams.get('type') as SearchType) || 'web';

  useEffect(() => {
    if (!query) {
      navigate('/');
      return;
    }
    performSearch();
  }, [query, type]);

  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/${type}`, {
        params: { q: query, count: 20 }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      alert(`Search failed. Please try again. ${error}`);
    } finally {
      setLoading(false);
    }
  }, [query, type]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery, type });
    }
  };

  const handleTypeChange = (newType: SearchType) => {
    setSearchParams({ q: query, type: newType });
  };

  return (
    <div className="min-h-screen">
      <div className="border-b bg-[#efefe0]  shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <a href="/" className="flex flex-row items-center justify-center mr-2">
              <img src="/public/logo.svg" alt="Oak" className="w-8 h-8" />
            </a>
              <div className="flex-1">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  name="search"
                  defaultValue={query}
                  className="w-full px-4 py-2 border bg-white border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
                />
              </form>
            </div>
          </div>
          <div className="flex gap-6 mt-4">
            {searchTypes.map((searchType) => (
              <button
                key={searchType.value}
                onClick={() => handleTypeChange(searchType.value)}
                className={`px-4 py-2 text-sm font-medium ${
                  type === searchType.value
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {searchType.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        ) : (
          <SearchResults results={results} type={type} />
        )}
      </main>
    </div>
  );
}

function SearchResults({ results, type }: { results: any; type: SearchType }) {
  if (!results) return null;
  console.log(results);
  const renderWebResults = () => (
    <div className="space-y-6">
      {results.web?.results?.map((result: any, index: number) => (
        <div key={index}>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg text-green-600 hover:underline"
          >
            {result.title}
          </a>
          <p className="text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: result.description }} />
        </div>
      ))}
    </div>
  );

  const renderImageResults = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {results.images?.results?.map((result: any, index: number) => (
        <div key={index} className="group">
          <img
            src={result.thumbnail}
            alt={result.title}
            className="w-full h-40 object-cover rounded-lg"
          />
          <p className="mt-2 text-sm text-gray-700 line-clamp-2">{result.title}</p>
        </div>
      ))}
    </div>
  );

  const renderNewsResults = () => (
    <div className="space-y-6">
      {results.news?.results?.map((result: any, index: number) => (
        <div key={index}>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg text-blue-600 hover:underline"
          >
            {result.title}
          </a>
          <p className="text-sm text-gray-600 mt-1">{result.description}</p>
          {result.age && (
            <p className="text-xs text-gray-500 mt-1">Published: {result.age}</p>
          )}
        </div>
      ))}
    </div>
  );

  const renderVideoResults = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {results.videos?.results?.map((result: any, index: number) => (
        <div key={index} className="group">
          <div className="relative">
            <img
              src={result.thumbnail}
              alt={result.title}
              className="w-full h-48 object-cover rounded-lg"
            />
            {result.duration && (
              <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {result.duration}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-700 line-clamp-2">{result.title}</p>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {type === 'web' && renderWebResults()}
      {type === 'images' && renderImageResults()}
      {type === 'news' && renderNewsResults()}
      {type === 'videos' && renderVideoResults()}
    </>
  );
} 