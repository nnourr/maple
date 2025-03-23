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

const mockAds = [
  {
    title: 'Nike Air Max - Mens',
    description: 'Get The Latest Nike Products On Lyst. Freshen Up Your Look Today. Large Selection Of New Season Nike. Find Your One In A Million.',
    image: 'https://up.yimg.com/ib/th?id=OADD2.7559591798992_1NBEPF0WT3NXPBP45W&pid=21.2&w=16&c=1&rs=1&qlt=95',
    url: 'https://lyst.com',
    type: 'deal',
  },
  {
    title: 'Nike Shoes - Mens',
    description: 'Shop Over 500 Designers at REVOLVE. Free CA Shipping & Free Returns!',
    image: 'https://up.yimg.com/ib/th?pid=AdsPlus&id=ODLS.dc750a1e-9925-460b-8565-b583e9b8d3e1&w=32&h=32&c=1&rs=1&qlt=95',
    url: 'https://revolve.com',
    type: 'deal',
  },
  {
    title: 'Nike Shoes & Sneakers - Order At Finish Line',
    description: 'Shop The Latest Nike Shoes & Sneakers For Men & Women. Free Shipping & Returns On All Orders. Shop Now!',
    image: 'https://up.yimg.com/ib/th?pid=AdsPlus&id=ODLS.e2b9602e-671a-4fe6-9b2d-8d206574881a&w=32&h=32&c=1&rs=1&qlt=95',
    url: 'https://www.finishline.com',
    type: 'sideAd',
  },
];

const sponsoredResults = [
  {
    title: 'Kotn | Sustainable Clothing & Home Decor. Quality, Comfort ...',
    description: 'Designed in Canada, ethically and sustainably made in the Nile Delta. Shop quality basics from 100% Egyptian cotton. Every purchase funds new schools.',
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAaVBMVEX///+kpaa3uLn39/c0LxqEdka9q2wkIx/r6+wTFBft14r/7Zr/6phSU1RSSjCunWPe3t/U1NR5enzOuXf/55ZISEhubm//8Z1hYmWVlpcAAADfyYHExMQ+Pz9pXz2Vh1c5ODX64pOIiYk8inaeAAABBUlEQVR4AYyR0W6EIBREcUXB3ouLLqLOqqL//5GVpGnJGk3P62FmIIj/kj3yK5XLolRZPKPPsvoiplKa+ilt81HRvsg5x+SIuFMfQV+y+6GXg0gZUZTM1FNMvzGlbi6ZmF8L1v4ILgit/XXDm2IblJQFu2cFM07JZeLepmSNlRxgHkmrLo6xjRbUIZ5Clenmzw7FKtnRq4z1VO9AErUG8SVM2zG9wmuRSo/Nxdm65ydmP3dJrQ/dRtzTihoHZk+TOgxLJSWqVmTnzzLA3pip07k6ydFbb1uEY8lYcUJDNV4cTOEsxywXWkTQiGusEjfs3Z31o76sDYPy18nHDHt3qVl8jzIAAFaVE0WaYJnqAAAAAElFTkSuQmCC',
    url: 'https://www.kotn.com',
    type: 'sponsored',
  },
  {
    title: 'Reforestation as a Service - 100% Free Tree Planting API',
    description: 'Tree Planting Platform — Automatically plant trees when your clients make a specific action on your website or app! Try our free to use RaaS (Reforestation as a Service) solution for enterprises!',
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAzFBMVEVHcExxWVaFdjY4AABCUSosAABiPjmryxs7GRc6AwBoSEN0XlgAAAB2qhE7AACEbGmAZ2Rum3yQfHq91VacwERiPDdnPzn5+Pj9/P3////7+vtfNC1SKyRHJR/Jwb/k5+Kdwjnw7+0tcT6toJ6NuUGyzjE6FA1Nh0HX0tHPx8bX5LSzzzh5r0x0oDNjoljd3NhQFgmxy4u1t7LN3Y+pyTnw8uSHryVIkWRqPDVtMymciojn7s7s8NtJfV9gdGSHpJJdkjMGTya+1WGyy6iuCz40AAAAF3RSTlMA8ChvY0G7/jFdz8YbZnPa1dT72sDT0CRfp4cAAAF9SURBVDiNvZLZeoIwEIVxDdrF7smEfRUVQQXEta3t+79Tk4AWqb1sz8fd+efMEiTpvyV3OvLv7u3A0YNAX9zfXLRbGwMIoUxgzC8g/RgoxuxjomSLmjW/gYU9JoLAZPxYqxd+5qExLQn8dNY/5r6FPM8rIzCN2xVgA7zow5ukaFdGYHir7GfwgB1KU9M89sDY+I4YiIDENE3XHbNNy4irE+DwxjB3XTcMjWy7w4QzxDn6ss4BMg/DMIqmS4RQkjGCLK5LoBOIgs8oivLhdGlOPG/CSuhIPgNobOd5PnyfuukEbWkVKFpg2Nt7e8gjUCJ6nloUQ7JDHQ62zSKWSVFwGlK6g2Kv18WeEfOM1NdsGbQAAAgFUj5p3Kudmh3XAqbyNeCh8ha9QJzKeG34fsPBYsRRJUCSuhbFMPJ9X9O02WwEbOLu+Q/RsEDnrqapqjLTwepLNXX1maoWvrJe6926z+ZQFJWL+atV76fP1H5WuFYv7Yu2UFOW67/z3+sLF3I4ptQjiEkAAAAASUVORK5CYII=',
    url: 'https://www.digitalhumani.com',
    type: 'sponsored',
  },
  {
    title: 'Encircled | Ethical & Sustainable Women\'s Clothing Made In ...',
    description: 'Encircled is a sustainable clothing brand that makes ethically and sustainably made clothing in Canada. Every purchase funds new schools.',
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAANlBMVEVHcEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAR2LVAAAAEnRSTlMADhoEMDpdcH2NnqxMJOPF1fz/JGL+AAAA+klEQVR4AbyRSZLFIAhAI6M4Jd7/si0kP2V39fqzAp8+KDy+Ewk88D9CLKrZSpX0F3FrHQB6Jxsn/WJdKC0drjgOuq6NJmlPI2d40Djhw0D56SrZsh/b5I8y3xISVbumrbRNfZjxrVZaU8osq+BxQ7AWLGu0yYM2qJacmQWjGlfb1bZKTg5N5vvF1X10K/6wj+xFFwiWSkY/PTWueKfE/OyNK91ydtuoiJ1d5YGqGMOFvE0DpnfdLUeKFnvSadzxwzj3Y4M27UHOLJhD11Kd9XWKRRpwNBCAMQvgCpCir8JXycvYxhzFrFTbvxnkrkhLrebFHvgzBIM+AACK/ggiQs0sggAAAABJRU5ErkJggg==',
    url: 'https://www.encircled.ca',
    type: 'sponsored',
  }
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
      <div className="flex flex-row gap-6">
        <div className="md:max-w-[50%] space-y-6">
          {sponsoredResults.map((result, index) => (
            <div key={index}>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Sponsored</h3>
              <div className='flex flex-row gap-2 items-center'>
                {result.image && (
                  <img 
                    src={result.image}
                    alt={result.title}
                    className="w-6 h-6 rounded-full bg-[#dadabc] p-0.5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              <div className='flex flex-col'>
                <p className="text-sm text-gray-600">{result.title}</p>
                <p className="text-xs text-gray-500">{result.url}</p>
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
          <div className="border-t border-gray-200" />

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
        <div className="md:max-w-[50%]">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Ads related to your search</h3>
          <div className="space-y-6">
            {mockAds.map((ad, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center gap-2">
                <img src={ad.image} alt={ad.title} className="w-12 h-12 rounded-full" />
                <div>
                  <h4 className="text-sm font-medium">{ad.title}</h4>
                  <p className="text-xs text-gray-500">{ad.description}</p>
                </div>
              </div>
              <a href={ad.url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                Shop Now
              </a>
              </div>
            ))}
          </div>
        </div>
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