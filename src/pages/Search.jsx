import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import MovieGridCard from '../components/movie/MovieGridCard';
import Poster from '../components/ui/Poster';

const Search = ({ api, onMovieClick, onPersonClick, watchlist, toggleWatchlist, seenHistory, markSeen, unmarkSeen }) => {
    const [query, setQuery] = useState('');
    const [type, setType] = useState('movie');
    const debouncedQuery = useDebounce(query, 500);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!debouncedQuery) { setResults([]); return; }
        setLoading(true);
        (type === 'movie' ? api.searchMovie(debouncedQuery) : api.searchPerson(debouncedQuery))
            .then(data => setResults(data.results || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [debouncedQuery, type, api]);

    return (
        <div className="animate-fade-in-up pb-20 lg:pb-10 w-full max-w-5xl mx-auto">
            <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md pt-4 pb-6 z-30">
                <h2 className="text-2xl font-bold text-white mb-4">Search Database</h2>
                <div className="flex gap-4 mb-4">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder={type === 'movie' ? "Find a movie..." : "Find an actor or director..."}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700 shrink-0">
                        <button onClick={() => setType('movie')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${type === 'movie' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>Movies</button>
                        <button onClick={() => setType('person')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${type === 'person' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>People</button>
                    </div>
                </div>
            </div>
            {loading ? <div className="text-center text-slate-500">Searching...</div> : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {results.map(item => {
                        if (type === 'movie') {
                            const isSeen = seenHistory.some(m => typeof m === 'object' ? m.id === item.id : m === item.id);
                            return (
                                <MovieGridCard
                                    key={item.id}
                                    movie={item}
                                    onClick={onMovieClick}
                                    toggleWatchlist={toggleWatchlist}
                                    isWatchlisted={watchlist.some(w => w.id === item.id)}
                                    toggleSeen={() => isSeen ? unmarkSeen(item.id) : markSeen(item)}
                                    isSeen={isSeen}
                                />
                            );
                        } else {
                            return (
                                <div key={item.id} onClick={() => onPersonClick(item.id)} className="cursor-pointer group bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-red-500/50 transition-all hover:-translate-y-1">
                                    <Poster path={item.profile_path} size="w342" className="aspect-[2/3]" alt={item.name} />
                                    <div className="p-3">
                                        <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                                        <p className="text-xs text-slate-500 truncate">{item.known_for_department}</p>
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            )}
        </div>
    );
};

export default Search;
