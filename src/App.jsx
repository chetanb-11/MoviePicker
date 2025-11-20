import React, { useState, useEffect, useMemo } from 'react';
import { 
  Film, Popcorn, Ticket, Shuffle, Info, Star, Calendar, Key, 
  Clapperboard, AlertCircle, TrendingUp, Search, X, 
  ExternalLink, Clock, DollarSign, Eye, EyeOff, Heart,
  ChevronLeft, Play, Trash2, Menu
} from 'lucide-react';

// --- CONFIGURATION ---
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

// --- MOCK BACKEND LAYER ---
const createApi = (apiKey) => {
  const fetchT = async (endpoint, params = {}) => {
    if (!apiKey) throw new Error("API Key missing");
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', apiKey);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  };

  return {
    getGenres: () => fetchT('/genre/movie/list'),
    discoverMovie: (params) => fetchT('/discover/movie', params),
    getMovie: (id) => fetchT(`/movie/${id}`, { 
      append_to_response: 'images,credits,external_ids,watch/providers,videos,recommendations' 
    }),
    searchMovie: (query, page=1) => fetchT('/search/movie', { query, page }),
    searchPerson: (query, page=1) => fetchT('/search/person', { query, page }),
    getPerson: (id) => fetchT(`/person/${id}`, { append_to_response: 'movie_credits,images' }),
    getTrending: (timeWindow = 'day') => fetchT(`/trending/movie/${timeWindow}`),
    getNowPlaying: (page=1) => fetchT('/movie/now_playing', { page }),
    getUpcoming: (page=1) => fetchT('/movie/upcoming', { page, region: 'US' }),
    getTopRatedIndia: () => fetchT('/discover/movie', { 
      region: 'IN', sort_by: 'vote_average.desc', 'vote_count.gte': 200,
      'primary_release_date.gte': new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]
    }),
    getCollection: (id) => fetchT(`/collection/${id}`),
  };
};

// --- HOOKS ---
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) { return initialValue; }
  });
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) { console.error(error); }
  };
  return [storedValue, setValue];
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// --- UI COMPONENTS ---

const Poster = ({ path, size = "w342", className = "", alt }) => (
  <div className={`bg-slate-800 overflow-hidden relative ${className}`}>
    {path ? (
      <img src={`${IMG_BASE_URL}/${size}${path}`} alt={alt} className="w-full h-full object-cover" loading="lazy" />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-slate-600">
        <Film className="w-1/3 h-1/3 opacity-20" />
      </div>
    )}
  </div>
);

const Badge = ({ children, className = "" }) => (
  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${className}`}>
    {children}
  </span>
);

const WatchlistDrawer = ({ isOpen, onClose, watchlist, onRemove, onMovieClick }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        <div className="relative w-full max-w-xs bg-slate-900 h-full border-l border-slate-800 shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-current" /> Your Watchlist
                </h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 p-1 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {watchlist.length === 0 ? (
                    <div className="text-center text-slate-600 mt-20">
                        <Film className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No movies saved yet.</p>
                    </div>
                ) : (
                    watchlist.map(movie => (
                        <div key={movie.id} className="flex gap-3 bg-slate-800/50 p-2 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors group">
                            <div onClick={() => { onMovieClick(movie.id); onClose(); }} className="cursor-pointer">
                                <Poster path={movie.poster_path} size="w92" className="w-12 h-16 rounded object-cover" alt={movie.title} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h4 onClick={() => { onMovieClick(movie.id); onClose(); }} className="text-sm font-bold text-white truncate cursor-pointer hover:text-blue-400 transition-colors">{movie.title}</h4>
                                <p className="text-xs text-slate-400">{movie.release_date?.split('-')[0]}</p>
                            </div>
                            <button onClick={() => onRemove(movie.id)} className="p-2 text-slate-500 hover:text-red-400 self-center">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
};

// --- VIEWS ---

const PickerView = ({ api, onMovieClick, seenHistory, markSeen, watchlist, toggleWatchlist }) => {
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [suggestedMovie, setSuggestedMovie] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.getGenres().then(data => setGenres(data.genres || [])).catch(console.error);
    }, [api]);

    const pickMovie = async () => {
        if (!selectedGenre) return;
        setLoading(true);
        setError(null);
        setSuggestedMovie(null);

        try {
            // Fetch a random page (1-20) to ensure high popularity but some variety
            const randomPage = Math.floor(Math.random() * 20) + 1;
            const res = await api.discoverMovie({
                with_genres: selectedGenre.id,
                sort_by: 'vote_average.desc',
                'vote_count.gte': 300,
                page: randomPage,
                language: 'en-US'
            });

            // Client-side filtering of "Seen" movies
            const candidates = res.results.filter(m => !seenHistory.includes(m.id));
            
            if (candidates.length > 0) {
                const randomIdx = Math.floor(Math.random() * candidates.length);
                setSuggestedMovie(candidates[randomIdx]);
            } else {
                // Fallback if user has seen everything on this page (unlikely but possible)
                setError("You've seen a lot of these! Try spinning again.");
            }
        } catch (e) {
            setError("Failed to pick a movie.");
        } finally {
            setLoading(false);
        }
    };

    const isWatchlisted = suggestedMovie && watchlist.some(m => m.id === suggestedMovie.id);

    return (
        <div className="max-w-3xl mx-auto pt-8 animate-fade-in-up pb-24">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                    <Shuffle className="w-8 h-8 text-purple-500" /> Random Picker
                </h2>
                <p className="text-slate-400">Select a genre and let fate decide.</p>
            </div>

            {/* Genre Cloud */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
                {genres.map(g => (
                    <button
                        key={g.id}
                        onClick={() => { setSelectedGenre(g); setSuggestedMovie(null); setError(null); }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedGenre?.id === g.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 scale-105' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                    >
                        {g.name}
                    </button>
                ))}
            </div>

            {/* Result Area */}
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
                            <div className="flex justify-between items-start mb-2">
                                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">{selectedGenre.name}</Badge>
                                <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                                    <Star className="w-4 h-4 fill-current" /> {suggestedMovie.vote_average.toFixed(1)}
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-1">{suggestedMovie.title}</h3>
                            <p className="text-slate-500 text-sm mb-4">{suggestedMovie.release_date?.split('-')[0]}</p>
                            
                            <p className="text-slate-300 leading-relaxed mb-6 line-clamp-4">{suggestedMovie.overview}</p>
                            
                            <div className="mt-auto grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => onMovieClick(suggestedMovie.id)}
                                    className="col-span-2 bg-white text-slate-900 font-bold py-3 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    View Details
                                </button>
                                <button 
                                    onClick={() => toggleWatchlist(suggestedMovie)}
                                    className={`py-3 rounded-lg font-medium border transition-colors flex items-center justify-center gap-2 ${isWatchlisted ? 'bg-red-600 border-red-600 text-white' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}`}
                                >
                                    <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} /> {isWatchlisted ? 'Saved' : 'Save'}
                                </button>
                                <button 
                                    onClick={() => { markSeen(suggestedMovie.id); pickMovie(); }}
                                    className="py-3 rounded-lg font-medium border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Eye className="w-4 h-4" /> Mark Seen & Next
                                </button>
                            </div>
                         </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-600">
                        <Popcorn className="w-20 h-20 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">{selectedGenre ? "Ready to roll!" : "Choose a genre to start"}</p>
                    </div>
                )}
                
                {error && <div className="absolute bottom-0 text-red-400 bg-red-900/20 px-4 py-2 rounded border border-red-900/50">{error}</div>}
            </div>

            {/* Big Action Button */}
            {selectedGenre && (
                <button 
                    onClick={pickMovie}
                    disabled={loading}
                    className="w-full max-w-md mx-auto mt-8 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-purple-900/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Shuffle className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} /> 
                    {suggestedMovie ? "Pick Another Movie" : "Find My Movie"}
                </button>
            )}
        </div>
    );
};

const MovieDetailView = ({ movieId, api, onBack, onPersonClick, onMovieClick, onCollectionClick, watchlist, toggleWatchlist, seenHistory, markSeen, unmarkSeen }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getMovie(movieId).then(setMovie).catch(console.error).finally(() => setLoading(false));
  }, [movieId, api]);

  if (loading) return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!movie) return null;

  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const director = movie.credits?.crew?.find(c => c.job === 'Director');
  const isWatchlisted = watchlist.some(m => m.id === movie.id);
  const isSeen = seenHistory.includes(movie.id);

  return (
    <div className="animate-fade-in-up pb-20">
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white sticky top-0 bg-slate-950/80 p-2 rounded z-20 backdrop-blur w-fit">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="relative w-full h-[50vh] md:h-[70vh] rounded-2xl overflow-hidden mb-8 group shadow-2xl border border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10" />
        <img src={`${IMG_BASE_URL}/original${movie.backdrop_path || movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" />
        
        <div className="absolute top-4 right-4 z-30 flex gap-3">
             <button 
                onClick={() => toggleWatchlist(movie)}
                className={`p-3 rounded-full backdrop-blur-md border transition-all ${isWatchlisted ? 'bg-red-600 text-white border-red-500' : 'bg-black/40 text-white border-white/10 hover:bg-black/60'}`}
                title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
            >
                <Heart className={`w-5 h-5 ${isWatchlisted ? 'fill-current' : ''}`} />
            </button>
            <button 
                onClick={() => isSeen ? unmarkSeen(movie.id) : markSeen(movie.id)}
                className={`p-3 rounded-full backdrop-blur-md border transition-all ${isSeen ? 'bg-green-600 text-white border-green-500' : 'bg-black/40 text-white border-white/10 hover:bg-black/60'}`}
                title={isSeen ? "Mark as Unseen" : "Mark as Seen"}
            >
                {isSeen ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-20">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 text-shadow">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 mb-4">
            <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">{movie.release_date?.split('-')[0]}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {Math.floor(movie.runtime/60)}h {movie.runtime%60}m</span>
            <span className="flex items-center gap-1 text-amber-400 font-bold"><Star className="w-4 h-4 fill-current" /> {movie.vote_average.toFixed(1)}</span>
            {isSeen && <span className="text-green-400 text-xs uppercase font-bold tracking-wider border border-green-500/30 px-2 py-0.5 rounded bg-green-500/10">Seen</span>}
          </div>
          <p className="text-slate-200 max-w-2xl text-lg leading-relaxed line-clamp-3 md:line-clamp-none drop-shadow-md">{movie.overview}</p>
          
          <div className="flex gap-3 mt-6">
            {trailer && (
              <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noreferrer" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-red-900/40">
                <Play className="w-5 h-5 fill-current" /> Watch Trailer
              </a>
            )}
             {movie.external_ids?.imdb_id && (
               <a href={`https://www.imdb.com/title/${movie.external_ids.imdb_id}`} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-[#f5c518] hover:text-black text-white px-4 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 backdrop-blur-sm border border-white/10">
                 IMDb <ExternalLink className="w-4 h-4" />
               </a>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Cast */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4">Top Cast</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {movie.credits?.cast?.slice(0, 10).map(person => (
                <div key={person.id} onClick={() => onPersonClick(person.id)} className="min-w-[100px] w-[100px] cursor-pointer group">
                  <Poster path={person.profile_path} size="w185" className="rounded-lg h-[150px] mb-2 group-hover:ring-2 ring-blue-500 transition-all" alt={person.name} />
                  <p className="text-xs font-bold text-white truncate">{person.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
          
          {/* Similar Movies */}
          {movie.recommendations?.results?.length > 0 && (
            <section>
                <h3 className="text-xl font-bold text-white mb-4">More Like This</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {movie.recommendations.results.slice(0, 4).map(m => (
                        <div key={m.id} onClick={() => onMovieClick(m.id)} className="cursor-pointer group">
                            <Poster path={m.backdrop_path} size="w780" className="rounded-lg aspect-video mb-2 group-hover:ring-2 ring-blue-500 transition-all" alt={m.title} />
                            <h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-white">{m.title}</h4>
                        </div>
                    ))}
                </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
             {/* Metadata Sidebar */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                <div>
                    <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Director</h4>
                    <p className="text-white font-medium">{director?.name || 'Unknown'}</p>
                </div>
                <div>
                    <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Status</h4>
                    <Badge className={movie.status === 'Released' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-slate-600 text-slate-400'}>{movie.status}</Badge>
                </div>
                <div>
                    <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Budget / Revenue</h4>
                     <div className="text-sm text-slate-300 space-y-1">
                        <div className="flex items-center gap-2"><DollarSign className="w-3 h-3 text-red-400" /> {movie.budget ? `$${(movie.budget/1000000).toFixed(1)}M` : 'N/A'}</div>
                        <div className="flex items-center gap-2"><TrendingUp className="w-3 h-3 text-green-400" /> {movie.revenue ? `$${(movie.revenue/1000000).toFixed(1)}M` : 'N/A'}</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ api, onMovieClick }) => {
  const [lists, setLists] = useState({ trending: [], nowPlaying: [], upcoming: [], indiaTop: [] });

  useEffect(() => {
    const fetchAll = async () => {
        try {
            const [t, n, u, i] = await Promise.all([
                api.getTrending('day'), api.getNowPlaying(), api.getUpcoming(), api.getTopRatedIndia()
            ]);
            setLists({ trending: t.results, nowPlaying: n.results, upcoming: u.results, indiaTop: i.results });
        } catch (e) { console.error(e); }
    };
    fetchAll();
  }, [api]);

  const MovieRail = ({ title, movies, icon: Icon }) => (
    <div className="mb-10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-red-500" />} {title}
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar scroll-pl-4">
            {movies.map(m => (
                <div key={m.id} onClick={() => onMovieClick(m.id)} className="min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] cursor-pointer group relative">
                    <Poster path={m.poster_path} size="w500" className="rounded-xl aspect-[2/3] shadow-lg mb-3 group-hover:ring-2 ring-red-500 transition-all" alt={m.title} />
                    <h4 className="text-sm font-medium text-slate-200 line-clamp-2 leading-tight group-hover:text-white transition-colors">{m.title}</h4>
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="animate-fade-in-up pb-20">
        <MovieRail title="Trending Today" movies={lists.trending} icon={TrendingUp} />
        <MovieRail title="Now In Theaters" movies={lists.nowPlaying} icon={Ticket} />
        <MovieRail title="Coming Soon" movies={lists.upcoming} icon={Calendar} />
        <MovieRail title="Top Rated in India" movies={lists.indiaTop} icon={Clock} />
    </div>
  );
};

const SearchPage = ({ api, onMovieClick, onPersonClick }) => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie'); 
  const debouncedQuery = useDebounce(query, 500);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery) { setResults([]); return; }
    const search = async () => {
      setLoading(true);
      try {
        const data = type === 'movie' ? await api.searchMovie(debouncedQuery) : await api.searchPerson(debouncedQuery);
        setResults(data.results || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    search();
  }, [debouncedQuery, type, api]);

  return (
    <div className="animate-fade-in-up pb-20 w-full max-w-5xl mx-auto">
      <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md pt-4 pb-6 z-30">
          <h2 className="text-2xl font-bold text-white mb-4">Search Database</h2>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
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
            {results.map(item => (
                <div key={item.id} onClick={() => type === 'movie' ? onMovieClick(item.id) : onPersonClick(item.id)} className="cursor-pointer group bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-red-500/50 transition-all hover:-translate-y-1">
                    <Poster path={type === 'movie' ? item.poster_path : item.profile_path} size="w342" className="aspect-[2/3]" alt={item.name || item.title} />
                    <div className="p-3">
                        <h4 className="text-sm font-bold text-white truncate">{item.title || item.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{type === 'movie' ? item.release_date?.split('-')[0] : item.known_for_department}</p>
                    </div>
                </div>
            ))}
          </div>
      )}
    </div>
  );
};

// --- MAIN APP SHELL ---

export default function App() {
  const [tmdbKey] = useState('5fa14720951576fe860871bd26f3d398');
  const [view, setView] = useState('dashboard'); 
  const [selectedId, setSelectedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const [watchlist, setWatchlist] = useLocalStorage('movie-picker-watchlist', []);
  const [seenHistory, setSeenHistory] = useLocalStorage('movie-picker-seen', []);

  const api = useMemo(() => createApi(tmdbKey), [tmdbKey]);

  const navigate = (newView, id = null) => {
    setHistory(prev => [...prev, { view, selectedId }]);
    setView(newView);
    if (id) setSelectedId(id);
    window.scrollTo(0,0);
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) {
        setHistory(prevHist => prevHist.slice(0, -1));
        setView(prev.view);
        setSelectedId(prev.selectedId);
    } else {
        setView('dashboard');
    }
  };

  // Helper functions passed down
  const toggleWatchlist = (movie) => {
    const exists = watchlist.find(m => m.id === movie.id);
    if (exists) setWatchlist(watchlist.filter(m => m.id !== movie.id));
    else setWatchlist([...watchlist, movie]);
  };

  const markSeen = (id) => {
    if (!seenHistory.includes(id)) setSeenHistory([...seenHistory, id]);
  };
  const unmarkSeen = (id) => {
    setSeenHistory(seenHistory.filter(sid => sid !== id));
  };

  const NavItem = ({ icon: Icon, label, targetView }) => (
    <button 
        onClick={() => { setHistory([]); setView(targetView); }}
        className={`flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-all ${view === targetView ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
    >
        <Icon className="w-6 h-6 md:w-5 md:h-5" />
        <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      
      <WatchlistDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        watchlist={watchlist}
        onRemove={(id) => setWatchlist(watchlist.filter(m => m.id !== id))}
        onMovieClick={(id) => navigate('detail', id)}
      />

      {/* Sidebar */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 z-50 md:static md:w-64 md:h-screen md:border-r md:border-t-0 md:flex md:flex-col p-2 md:p-6">
        <div className="hidden md:flex items-center gap-3 mb-10 px-2">
            <div className="bg-red-600 p-2 rounded-lg"><Film className="w-6 h-6 text-white" /></div>
            <h1 className="text-xl font-bold tracking-tight">Cine<span className="text-red-500">Verse</span></h1>
        </div>

        <nav className="flex md:flex-col justify-around md:justify-start gap-1 md:gap-2 w-full">
            <NavItem icon={TrendingUp} label="Discover" targetView="dashboard" />
            <NavItem icon={Search} label="Search" targetView="search" />
            <NavItem icon={Shuffle} label="Surprise Me" targetView="picker" />
            
            <button 
                onClick={() => setDrawerOpen(true)}
                className="flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white md:mt-auto"
            >
                <Heart className="w-6 h-6 md:w-5 md:h-5" />
                <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">Watchlist ({watchlist.length})</span>
            </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen md:h-screen custom-scrollbar">
        {view === 'dashboard' && <Dashboard api={api} onMovieClick={id => navigate('detail', id)} />}
        {view === 'search' && <SearchPage api={api} onMovieClick={id => navigate('detail', id)} onPersonClick={id => navigate('person', id)} />}
        
        {view === 'picker' && (
            <PickerView 
                api={api} 
                onMovieClick={id => navigate('detail', id)} 
                seenHistory={seenHistory}
                markSeen={markSeen}
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
            />
        )}
        
        {view === 'detail' && (
            <MovieDetailView 
                movieId={selectedId} 
                api={api} 
                onBack={goBack} 
                onPersonClick={id => navigate('person', id)} 
                onMovieClick={id => navigate('detail', id)}
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
                seenHistory={seenHistory}
                markSeen={markSeen}
                unmarkSeen={unmarkSeen}
            />
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71, 85, 105, 0.8); }
        .text-shadow { text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}