import React, { useState, useEffect } from 'react';
import { Shuffle, Star, Heart, Eye, Popcorn, Calendar } from 'lucide-react';
import Poster from '../components/ui/Poster';
import Badge from '../components/ui/Badge';

const DECADES = [
    { label: 'All Time', value: 'all' },
    { label: '2020s', value: '2020' },
    { label: '2010s', value: '2010' },
    { label: '2000s', value: '2000' },
    { label: '1990s', value: '1990' },
    { label: '1980s', value: '1980' },
    { label: 'Classic', value: 'classic' },
];

const SurpriseMe = ({ api, onMovieClick, seenHistory, markSeen, watchlist, toggleWatchlist }) => {
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedDecade, setSelectedDecade] = useState('all');
    const [suggestedMovie, setSuggestedMovie] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getGenres().then(data => setGenres(data.genres || [])).catch(console.error);
    }, [api]);

    const toggleGenre = (genre) => {
        setSuggestedMovie(null);
        setError(null);
        if (selectedGenres.find(g => g.id === genre.id)) {
            setSelectedGenres(selectedGenres.filter(g => g.id !== genre.id));
        } else {
            setSelectedGenres([...selectedGenres, genre]);
        }
    };

    const pickMovie = async () => {
        if (selectedGenres.length === 0) {
            setError("Please select at least one genre!");
            return;
        }
        setLoading(true);
        setError(null);
        setSuggestedMovie(null);

        try {
            const params = {
                with_genres: selectedGenres.map(g => g.id).join(','),
                sort_by: 'vote_average.desc',
                'vote_count.gte': 300,
                page: Math.floor(Math.random() * 10) + 1, // Reduced random page range for better relevance
                language: 'en-US'
            };

            if (selectedDecade !== 'all') {
                if (selectedDecade === 'classic') {
                    params['primary_release_date.lte'] = '1979-12-31';
                } else {
                    const startYear = parseInt(selectedDecade);
                    params['primary_release_date.gte'] = `${startYear}-01-01`;
                    params['primary_release_date.lte'] = `${startYear + 9}-12-31`;
                }
            }

            const res = await api.discoverMovie(params);
            const candidates = res.results.filter(m => !seenHistory.some(seen => typeof seen === 'object' ? seen.id === m.id : seen === m.id));

            if (candidates.length > 0) {
                setSuggestedMovie(candidates[Math.floor(Math.random() * candidates.length)]);
            } else {
                setError("No movies found for these criteria. Try different options!");
            }
        } catch (e) {
            setError("Failed to pick a movie. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isWatchlisted = suggestedMovie && watchlist.some(m => m.id === suggestedMovie.id);

    return (
        <div className="max-w-4xl mx-auto pt-8 animate-fade-in-up pb-24 lg:pb-10 px-4">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                    <Shuffle className="w-8 h-8 text-purple-500" /> Random Picker
                </h2>
                <p className="text-slate-400">Mix and match genres and eras to find your perfect movie.</p>
            </div>

            {/* Controls Section */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 mb-10 backdrop-blur-sm">
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <Popcorn className="w-4 h-4" /> Select Genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {genres.map(g => {
                            const isSelected = selectedGenres.find(sel => sel.id === g.id);
                            return (
                                <button
                                    key={g.id}
                                    onClick={() => toggleGenre(g)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${isSelected
                                            ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/40 scale-105'
                                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                                        }`}
                                >
                                    {g.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Select Era
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {DECADES.map(decade => (
                            <button
                                key={decade.value}
                                onClick={() => { setSelectedDecade(decade.value); setSuggestedMovie(null); }}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${selectedDecade === decade.value
                                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/40'
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                                    }`}
                            >
                                {decade.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Result Section */}
            <div className="min-h-[400px] flex flex-col items-center justify-center relative">
                {loading ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-purple-400 font-mono">Consulting the archives...</p>
                    </div>
                ) : suggestedMovie ? (
                    <div className="w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col md:flex-row animate-fade-in-up">
                        <div className="w-full md:w-2/5 relative">
                            <Poster path={suggestedMovie.poster_path} size="w500" className="h-64 md:h-full" alt={suggestedMovie.title} />
                        </div>
                        <div className="p-6 md:p-8 flex-1 flex flex-col text-left">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedGenres.map(g => (
                                    <Badge key={g.id} className="bg-purple-500/10 text-purple-400 border-purple-500/30">{g.name}</Badge>
                                ))}
                                <div className="flex items-center gap-1 text-amber-400 text-sm font-bold ml-auto">
                                    <Star className="w-4 h-4 fill-current" /> {suggestedMovie.vote_average.toFixed(1)}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{suggestedMovie.title}</h3>
                            <p className="text-slate-500 text-sm mb-4">{suggestedMovie.release_date?.split('-')[0]}</p>
                            <p className="text-slate-300 leading-relaxed mb-6 line-clamp-4">{suggestedMovie.overview}</p>

                            <div className="mt-auto grid grid-cols-2 gap-3">
                                <button onClick={() => onMovieClick(suggestedMovie.id)} className="col-span-2 bg-white text-slate-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                                    View Details
                                </button>
                                <button onClick={() => toggleWatchlist(suggestedMovie)} className={`py-3 rounded-lg font-medium border flex items-center justify-center gap-2 transition-colors ${isWatchlisted ? 'bg-red-600 border-red-600 text-white' : 'border-slate-600 text-slate-300 hover:border-white hover:text-white'}`}>
                                    <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} /> {isWatchlisted ? 'Saved' : 'Save'}
                                </button>
                                <button onClick={() => { markSeen(suggestedMovie); pickMovie(); }} className="py-3 rounded-lg font-medium border border-slate-600 text-slate-300 flex items-center justify-center gap-2 hover:border-white hover:text-white transition-colors">
                                    <Eye className="w-4 h-4" /> Mark Seen & Next
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-600">
                        <Popcorn className="w-20 h-20 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">
                            {selectedGenres.length > 0
                                ? "Ready to roll! Click the button below."
                                : "Select at least one genre to start"}
                        </p>
                    </div>
                )}

                {error && (
                    <div className="absolute bottom-0 text-red-400 bg-red-900/20 px-4 py-2 rounded border border-red-900/50 animate-bounce">
                        {error}
                    </div>
                )}
            </div>

            <button
                onClick={pickMovie}
                disabled={loading || selectedGenres.length === 0}
                className="w-full max-w-md mx-auto mt-8 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Shuffle className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                {suggestedMovie ? "Pick Another Movie" : "Find My Movie"}
            </button>
        </div>
    );
};

export default SurpriseMe;
