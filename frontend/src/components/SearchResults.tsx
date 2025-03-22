import { SearchResultsProps } from '../types';

export default function SearchResults({ results, searchType, loading }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex justify-center mt-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const renderWebResults = () => {
    return results.web?.results?.map((result: any, index: number) => (
      <div key={index} className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg text-blue-600 hover:underline"
        >
          {result.title}
        </a>
        <p className="text-gray-600 text-sm mt-2">
          {result.description}
        </p>
      </div>
    ));
  };

  const renderImageResults = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.images?.results?.map((result: any, index: number) => (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={result.thumbnail}
                alt={result.title}
                className="w-full h-40 object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-800 line-clamp-2">
                {result.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNewsResults = () => {
    return results.news?.results?.map((result: any, index: number) => (
      <div key={index} className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg text-blue-600 hover:underline"
        >
          {result.title}
        </a>
        <p className="text-gray-600 text-sm mt-2">
          {result.description}
        </p>
        {result.age && (
          <p className="text-xs text-gray-500 mt-2">
            Published: {result.age}
          </p>
        )}
      </div>
    ));
  };

  const renderVideoResults = () => {
    console.log(results?.videos?.results);
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {results.videos?.results?.map((result: any, index: number) => (
          <a href={result.url} target="_blank" rel="noopener noreferrer" key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={result.thumbnail.src}
                alt={result.title}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-800 line-clamp-2">
                {result.title}
              </p>
              {result.duration && (
                <p className="text-xs text-gray-500 mt-1">
                  Duration: {result.duration}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {searchType === 'web' && renderWebResults()}
      {searchType === 'images' && renderImageResults()}
      {searchType === 'news' && renderNewsResults()}
      {searchType === 'videos' && renderVideoResults()}
    </div>
  );
} 