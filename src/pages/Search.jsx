import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Film, User } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import MovieCard from '../components/movie/MovieCard';
import Poster from '../components/ui/Poster';

const Search = ({ api, onMovieClick, onPersonClick, watchlist, toggleWatchlist, seenHistory, markSeen, unmarkSeen }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (!debouncedQuery) {
            setResults([]);
            return;
        }

        setLoading(true);
        api.searchMulti(debouncedQuery).then(data => {
            setResults(data.results || []);
            setLoading(false);
        });
    }, [debouncedQuery, api]);

    const clearSearch = () => {
        setQuery('');
        setResults([]);
    };

    return (
        <div className="min-h-screen bg-background pb-20 pt-6 px-4 md:px-8">
            {/* Search Input Area */}
            <div className="max-w-3xl mx-auto mb-12">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <SearchIcon className="w-6 h-6 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search movies, people, genres..."
                        className="w-full bg-slate-900 text-white text-lg rounded-full py-4 pl-14 pr-12 border-2 border-slate-800 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 outline-none transition-all shadow-xl placeholder:text-slate-600"
                        autoFocus
                    />
                    {query && (
                        <button
                            onClick={clearSearch}
                            className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Results Area */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {results.map(item => {
                            if (item.media_type === 'person') {
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => onPersonClick(item.id)}
                                        className="group cursor-pointer bg-slate-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-red-500 transition-all"
                                    >
                                        <div className="aspect-[2/3] overflow-hidden">
                                            <Poster path={item.profile_path} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-white font-bold truncate">{item.name}</h3>
                                            <p className="text-slate-500 text-xs uppercase mt-1 flex items-center gap-1">
                                                <User className="w-3 h-3" /> Person
                                            </p>
                                        </div>
                                    </div>
                                );
                            } else if (item.media_type === 'movie') {
                                const isSeen = seenHistory.some(seen => typeof seen === 'object' ? seen.id === item.id : seen === item.id);
                                return (
                                    <MovieCard
                                        key={item.id}
                                        movie={item}
                                        onClick={onMovieClick}
                                        onToggleWatchlist={toggleWatchlist}
                                        isWatchlisted={watchlist.some(w => w.id === item.id)}
                                        onToggleSeen={() => isSeen ? unmarkSeen(item.id) : markSeen(item)}
                                        isSeen={isSeen}
                                    />
                                );
                            }
                            return null;
                        })}
                    </div>
                ) : query ? (
                    <div className="text-center py-20 text-slate-500">
                        <Film className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-xl">No results found for "{query}"</p>
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-600">
                        <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">Start typing to explore the universe of movies...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
