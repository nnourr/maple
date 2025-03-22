import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SearchType } from '../types';
import { config } from '../config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
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
      <div className="border-[#e8e8d4] bg-[#efefe0]  shadow-sm">
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
                  className="md:w-[60%] px-4 py-2 border bg-white border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
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

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <p className="text-6xl mb-4">😢</p>
      <h3 className="text-xl font-medium text-gray-900 mb-2">No results found</h3>
      <p className="text-gray-600">We couldn't find any {type} matching your search</p>
    </div>
  );

  const renderWebResults = () => {
    if (!results.web?.results?.length) return <EmptyState />;
    return (
      <div className="md:max-w-[60%] space-y-6">
        {results.web?.results?.map((result: any, index: number) => (
          <div key={index}>
            <div className='flex flex-row gap-2 items-center'>
              {result.profile.img && (
                <img 
                  src={result.profile.img}
                  alt={result.meta_url.hostname}
                  className="w-6 h-6 rounded-full bg-[#dadabc] p-0.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className='flex flex-col'>
                <p className="text-sm text-gray-600">{result.profile.name}</p>
                <p className="text-xs text-gray-500">{result.meta_url.hostname}{" "}{result.meta_url.path}</p>
              </div>
            </div>
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
  };

  const renderImageResults = () => {
    if (!results.results?.length) return <EmptyState />;
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.results?.map((result: any, index: number) => (
          result.thumbnail?.src ? (
            <div key={index} className="group relative">
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg"
              >
                <img
                  src={result.thumbnail.src}
                  alt={result.title}
                  className="w-full h-40 object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).closest('.group')?.remove();
                  }}
                />
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-green-600">{result.title}</p>
                  <div className="flex items-center gap-1">
                    {result.meta_url.favicon && (
                      <img 
                        src={result.meta_url.favicon} 
                        alt={result.meta_url.hostname}
                        className="w-4 h-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <p className="text-xs text-gray-500">{result.meta_url.hostname}</p>
                  </div>
                </div>
              </a>
            </div>
          ) : null
        ))}
      </div>
    );
  };

  const renderNewsResults = () => {
    if (!results.results?.length) return <EmptyState />;
    return (
      <div className="md:max-w-[60%] space-y-6">
        {results.results?.map((result: any, index: number) => (
          <div key={index} className="group flex flex-row justify-between items-start">
            <div className="flex flex-col flex-grow">
              <div className="flex flex-row gap-2 items-center mb-1">
                {result.meta_url.favicon && (
                  <img 
                    src={result.meta_url.favicon}
                    alt={result.meta_url.hostname}
                    className="w-4 h-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <p className="text-xs text-gray-500">{result.meta_url.hostname}</p>
              </div>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group-hover:underline"
              >
                <h3 className="text-lg text-green-600 font-medium">{result.title}</h3>
              </a>
              <p className="text-sm text-gray-600 mt-1">{result.description}</p>
            </div>
            <div className="h-full mt-2 flex flex-col items-end gap-2">
              <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded">
                {result.thumbnail?.src ? (
                  <img 
                    src={result.thumbnail.src}
                    alt={result.title}
                    className="w-full h-full object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).closest('img')?.remove();
                      (e.target as HTMLImageElement).closest('.w-20')?.classList.add('bg-gray-100');
                      const placeholder = document.createElement('span');
                      placeholder.className = 'text-xs text-gray-400';
                      placeholder.textContent = 'No image';
                      (e.target as HTMLImageElement).closest('.w-20')?.appendChild(placeholder);
                    }}
                  />
                ) : (
                  <span className="text-xs text-gray-400">No image</span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {result.age}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderVideoResults = () => {
    if (!results.results?.length) return <EmptyState />;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.results?.map((result: any, index: number) => (
          result.thumbnail?.src ? (
            <div key={index} className="group">
              <a 
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={result.thumbnail.src}
                    alt={result.title}
                    className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).closest('.group')?.remove();
                    }}
                  />
                  {result.video?.duration && (
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {result.video.duration}
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-green-600">
                    {result.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {result.meta_url.favicon && (
                      <img 
                        src={result.meta_url.favicon}
                        alt={result.meta_url.hostname}
                        className="w-4 h-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <p className="text-xs text-gray-500">{result.video?.creator || result.meta_url.hostname}</p>
                  </div>
                  {result.video?.views && (
                    <p className="text-xs text-gray-500">
                      {new Intl.NumberFormat().format(result.video.views)} views • {result.age}
                    </p>
                  )}
                </div>
              </a>
            </div>
          ) : null
        ))}
      </div>
    );
  };

  return (
    <>
      {type === 'web' && renderWebResults()}
      {type === 'images' && renderImageResults()}
      {type === 'news' && renderNewsResults()}
      {type === 'videos' && renderVideoResults()}
    </>
  );
} 