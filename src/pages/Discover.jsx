import React, { useState, useEffect } from 'react';
import { Filter, SortAsc, Star, Calendar, Layers } from 'lucide-react';
import MovieGridCard from '../components/movie/MovieGridCard';
import Poster from '../components/ui/Poster';

const SORT_OPTIONS = [
    { label: 'Most Popular', value: 'popularity.desc' },
    { label: 'Least Popular', value: 'popularity.asc' },
    { label: 'Newest Releases', value: 'primary_release_date.desc' },
    { label: 'Oldest Releases', value: 'primary_release_date.asc' },
    { label: 'Top Rated', value: 'vote_average.desc' },
    { label: 'Lowest Rated', value: 'vote_average.asc' },
    { label: 'Highest Revenue', value: 'revenue.desc' },
];

const Discover = ({ api, onMovieClick, watchlist, toggleWatchlist, seenHistory, markSeen, unmarkSeen }) => {
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Filters
    const [selectedSort, setSelectedSort] = useState('popularity.desc');
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [year, setYear] = useState('');

    useEffect(() => {
        api.getGenres().then(data => setGenres(data.genres || [])).catch(console.error);
    }, [api]);

    useEffect(() => {
        setMovies([]);
        setPage(1);
        setHasMore(true);
        fetchMovies(1);
    }, [selectedSort, selectedGenres, minRating, year]);

    const fetchMovies = async (pageNum) => {
        setLoading(true);
        try {
            const params = {
                sort_by: selectedSort,
                page: pageNum,
                'vote_count.gte': 100, // Filter out junk
                'vote_average.gte': minRating,
                with_genres: selectedGenres.join(','),
            };

            if (year) {
                params.primary_release_year = year;
            }

            const data = await api.discoverMovie(params);
            const newMovies = data.results || [];

            setMovies(prev => pageNum === 1 ? newMovies : [...prev, ...newMovies]);
            setHasMore(data.page < data.total_pages);
        } catch (error) {
            console.error("Failed to fetch movies", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMovies(nextPage);
    };

    const toggleGenre = (genreId) => {
        setSelectedGenres(prev =>
            prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
        );
    };

    return (
        <div className="animate-fade-in-up pb-20 lg:pb-10">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Filters Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-6 sticky top-20">
                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</h3>

                        {/* Sort */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Sort By</label>
                            <div className="relative">
                                <select
                                    value={selectedSort}
                                    onChange={(e) => setSelectedSort(e.target.value)}
                                    className="w-full bg-slate-800 text-white text-sm rounded-lg p-2.5 border border-slate-700 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                >
                                    {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                                <SortAsc className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Genres */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Genres</label>
                            <div className="flex flex-wrap gap-2">
                                {genres.map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => toggleGenre(g.id)}
                                        className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${selectedGenres.includes(g.id) ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                                    >
                                        {g.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex justify-between">
                                <span>Min Rating</span>
                                <span className="text-amber-400">{minRating}+</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="9"
                                step="1"
                                value={minRating}
                                onChange={(e) => setMinRating(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>

                        {/* Year */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Release Year</label>
                            <input
                                type="number"
                                placeholder="e.g. 2023"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="w-full bg-slate-800 text-white text-sm rounded-lg p-2.5 border border-slate-700 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="flex-1 w-full">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-blue-500" /> Discover Movies
                    </h2>

                    {movies.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                            {movies.map(m => {
                                const isSeen = seenHistory.some(seen => typeof seen === 'object' ? seen.id === m.id : seen === m.id);
                                return (
                                    <MovieGridCard
                                        key={m.id}
                                        movie={m}
                                        onClick={onMovieClick}
                                        toggleWatchlist={toggleWatchlist}
                                        isWatchlisted={watchlist.some(w => w.id === m.id)}
                                        toggleSeen={() => isSeen ? unmarkSeen(m.id) : markSeen(m)}
                                        isSeen={isSeen}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        !loading && (
                            <div className="text-center py-20 text-slate-500">
                                <p className="text-lg">No movies found matching your criteria.</p>
                                <button onClick={() => { setSelectedSort('popularity.desc'); setSelectedGenres([]); setMinRating(0); setYear(''); }} className="mt-4 text-blue-400 hover:underline">Reset Filters</button>
                            </div>
                        )
                    )}

                    {loading && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="aspect-[2/3] bg-slate-800 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    )}

                    {!loading && hasMore && movies.length > 0 && (
                        <div className="text-center mt-8">
                            <button
                                onClick={handleLoadMore}
                                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-full transition-colors border border-slate-700"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Discover;
