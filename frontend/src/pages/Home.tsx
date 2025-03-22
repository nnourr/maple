import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query)}&type=web`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl px-4 mb-12">
        <div className="pointer-events-none flex flex-row items-center justify-center scale-250 mb-4">
          <img src="/public/logo.svg" alt="Oak" className="w-16 h-16 mb-8 translate-x-[16px]" />
          <img src="/public/logo-text.png" alt="Oak" className="w-36 h-24 mb-2 " />
        </div>
        <form onSubmit={handleSearch} className="w-full">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the web..."
              className="bg-white focus:shadow-lg flex-1 px-4 py-3 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              className="px-8 py-3 bg-[#0e813e] text-white rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 hover:cursor-pointer"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;
