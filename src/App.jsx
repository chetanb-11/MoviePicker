import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Film, Popcorn, Ticket, Shuffle, Info, Star, Calendar, Key, 
  Clapperboard, AlertCircle, Sparkles, MessageSquareQuote, 
  Lightbulb, Utensils, Tv, Youtube, Eye, EyeOff, Heart, Search, 
  X, Menu, ExternalLink, TrendingUp, Clock, Globe, DollarSign,
  Users, Image as ImageIcon, ChevronLeft, ChevronRight, Play
} from 'lucide-react';

// --- CONFIGURATION ---
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p';

// --- MOCK BACKEND LAYER (Client-side Proxy Pattern) ---
// In a real app, these would be fetch calls to your Node/Express backend
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
    
    // Discovery / Picker
    discoverMovie: (params) => fetchT('/discover/movie', params),
    
    // Rich Metadata
    getMovie: (id) => fetchT(`/movie/${id}`, { 
      append_to_response: 'images,credits,external_ids,watch/providers,videos,recommendations' 
    }),
    
    // Search & People
    searchMovie: (query, page=1) => fetchT('/search/movie', { query, page }),
    searchPerson: (query, page=1) => fetchT('/search/person', { query, page }),
    getPerson: (id) => fetchT(`/person/${id}`, { append_to_response: 'movie_credits,images' }),
    
    // Trending & Lists
    getTrending: (timeWindow = 'day') => fetchT(`/trending/movie/${timeWindow}`),
    getNowPlaying: (page=1) => fetchT('/movie/now_playing', { page }),
    getUpcoming: (page=1) => fetchT('/movie/upcoming', { page, region: 'US' }),
    getTopRatedIndia: () => fetchT('/discover/movie', { 
      region: 'IN', 
      sort_by: 'vote_average.desc', 
      'vote_count.gte': 200,
      'primary_release_date.gte': new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]
    }),
    
    // Collections
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

const ImageLightbox = ({ src, alt, onClose }) => (
  <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
    <button className="absolute top-4 right-4 text-white/70 hover:text-white"><X className="w-8 h-8" /></button>
    <img src={src} alt={alt} className="max-w-full max-h-[90vh] object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
  </div>
);

const Badge = ({ children, className = "" }) => (
  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${className}`}>
    {children}
  </span>
);

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

// --- VIEWS ---

const PersonDetailView = ({ personId, api, onBack, onMovieClick }) => {
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getPerson(personId);
        setPerson(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [personId]);

  if (loading) return <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!person) return null;

  const sortedCredits = person.movie_credits?.cast?.sort((a, b) => b.popularity - a.popularity) || [];

  return (
    <div className="animate-fade-in-up pb-20">
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <Poster path={person.profile_path} size="h632" className="rounded-xl shadow-2xl aspect-[2/3]" alt={person.name} />
          <div className="mt-6 space-y-4">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <h3 className="text-slate-400 text-xs font-bold uppercase mb-2">Personal Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Known For</span> <span>{person.known_for_department}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Gender</span> <span>{person.gender === 1 ? 'Female' : 'Male'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Birthday</span> <span>{person.birthday}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Place of Birth</span> <span className="text-right">{person.place_of_birth}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white mb-4">{person.name}</h1>
          {person.biography && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-white mb-2">Biography</h3>
              <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {person.biography}
              </p>
            </div>
          )}

          <h3 className="text-lg font-bold text-white mb-4">Filmography (Known For)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedCredits.slice(0, 15).map(movie => (
              <div key={movie.id} onClick={() => onMovieClick(movie.id)} className="cursor-pointer group">
                <Poster path={movie.poster_path} size="w342" className="rounded-lg aspect-[2/3] mb-2 group-hover:ring-2 ring-blue-500 transition-all" alt={movie.title} />
                <h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-white">{movie.title}</h4>
                <p className="text-xs text-slate-500">{movie.character}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MovieDetailView = ({ movieId, api, onBack, onPersonClick, onMovieClick, onCollectionClick }) => {
  const [movie, setMovie] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getMovie(movieId);
        setMovie(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, [movieId]);

  if (loading) return <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!movie) return null;

  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const director = movie.credits?.crew?.find(c => c.job === 'Director');
  const formatMoney = (amt) => amt ? `$${(amt/1000000).toFixed(1)}M` : 'N/A';

  return (
    <div className="animate-fade-in-up pb-20">
      {lightboxImg && <ImageLightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />}

      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white sticky top-0 bg-slate-950/80 p-2 rounded z-20 backdrop-blur w-fit">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero Backdrop */}
      <div className="relative w-full h-[50vh] md:h-[70vh] rounded-2xl overflow-hidden mb-8 group">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10" />
        <img src={`${IMG_BASE_URL}/original${movie.backdrop_path || movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-20">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 text-shadow">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 mb-4">
            <span className="border border-slate-600 px-2 py-0.5 rounded">{movie.release_date?.split('-')[0]}</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {Math.floor(movie.runtime/60)}h {movie.runtime%60}m</span>
            <span className="flex items-center gap-1 text-amber-400"><Star className="w-4 h-4 fill-current" /> {movie.vote_average.toFixed(1)} ({movie.vote_count})</span>
          </div>
          <p className="text-slate-200 max-w-2xl text-base md:text-lg leading-relaxed line-clamp-3 md:line-clamp-none">{movie.overview}</p>
          
          <div className="flex gap-3 mt-6">
            {trailer && (
              <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noreferrer" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                <Play className="w-5 h-5 fill-current" /> Watch Trailer
              </a>
            )}
             {movie.external_ids?.imdb_id && (
               <a href={`https://www.imdb.com/title/${movie.external_ids.imdb_id}`} target="_blank" rel="noreferrer" className="bg-slate-800 hover:bg-[#f5c518] hover:text-black text-white px-4 py-3 rounded-lg font-bold transition-colors flex items-center gap-2">
                 IMDb <ExternalLink className="w-4 h-4" />
               </a>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Top Cast */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4">Top Cast</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {movie.credits?.cast?.slice(0, 10).map(person => (
                <div key={person.id} onClick={() => onPersonClick(person.id)} className="min-w-[100px] w-[100px] cursor-pointer group">
                  <Poster path={person.profile_path} size="w185" className="rounded-lg h-[150px] mb-2 group-hover:ring-2 ring-blue-500" alt={person.name} />
                  <p className="text-xs font-bold text-white truncate">{person.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{person.character}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Collection */}
          {movie.belongs_to_collection && (
            <div 
              onClick={() => onCollectionClick(movie.belongs_to_collection.id)}
              className="relative h-40 rounded-xl overflow-hidden cursor-pointer group border border-slate-800"
            >
               <img src={`${IMG_BASE_URL}/w1280${movie.belongs_to_collection.backdrop_path}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" alt="" />
               <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                 <div className="text-center">
                   <p className="text-sm text-slate-300 uppercase tracking-widest mb-1">Part of the</p>
                   <h3 className="text-2xl font-bold text-white group-hover:scale-105 transition-transform">{movie.belongs_to_collection.name}</h3>
                   <span className="inline-block mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded-full">View Collection</span>
                 </div>
               </div>
            </div>
          )}

          {/* Images / Media */}
          {movie.images?.backdrops?.length > 0 && (
             <section>
               <h3 className="text-xl font-bold text-white mb-4">Media & Backdrops</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 {movie.images.backdrops.slice(0, 6).map((img, i) => (
                   <img 
                     key={i} 
                     src={`${IMG_BASE_URL}/w780${img.file_path}`} 
                     className="rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity border border-slate-800" 
                     onClick={() => setLightboxImg(`${IMG_BASE_URL}/original${img.file_path}`)}
                     alt=""
                   />
                 ))}
               </div>
             </section>
          )}

          {/* Recommendations */}
          {movie.recommendations?.results?.length > 0 && (
            <section>
                <h3 className="text-xl font-bold text-white mb-4">More Like This</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {movie.recommendations.results.slice(0, 4).map(m => (
                        <div key={m.id} onClick={() => onMovieClick(m.id)} className="cursor-pointer group">
                            <Poster path={m.backdrop_path} size="w780" className="rounded-lg aspect-video mb-2 group-hover:ring-2 ring-blue-500" alt={m.title} />
                            <h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-white">{m.title}</h4>
                            <div className="flex justify-between text-[10px] text-slate-500">
                                <span>{m.release_date?.split('-')[0]}</span>
                                <span className="text-amber-500 flex items-center gap-1"><Star className="w-3 h-3" /> {m.vote_average.toFixed(1)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
          )}
        </div>

        {/* Sidebar Metadata */}
        <div className="space-y-6">
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
                    <div className="text-sm text-slate-300 flex flex-col gap-1">
                        <span className="flex items-center gap-2"><DollarSign className="w-3 h-3 text-red-400" /> {formatMoney(movie.budget)}</span>
                        <span className="flex items-center gap-2"><TrendingUp className="w-3 h-3 text-green-400" /> {formatMoney(movie.revenue)}</span>
                    </div>
                </div>
                <div>
                     <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Spoken Languages</h4>
                     <div className="flex flex-wrap gap-1">
                        {movie.spoken_languages?.map(l => <span key={l.iso_639_1} className="text-xs bg-slate-800 px-2 py-1 rounded">{l.name}</span>)}
                     </div>
                </div>
                 <div>
                     <h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Production</h4>
                     <div className="text-xs text-slate-400 space-y-1">
                        {movie.production_companies?.slice(0,3).map(c => <div key={c.id} className="flex items-center gap-2">{c.name}</div>)}
                     </div>
                </div>
            </div>
            
            {/* Providers */}
            {movie['watch/providers']?.results?.US?.flatrate && (
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                    <h4 className="text-slate-500 text-xs font-bold uppercase mb-3">Stream Now (US)</h4>
                    <div className="flex flex-wrap gap-3">
                        {movie['watch/providers'].results.US.flatrate.map(p => (
                            <img key={p.provider_id} src={`${IMG_BASE_URL}/original${p.logo_path}`} className="w-10 h-10 rounded-lg shadow" title={p.provider_name} alt={p.provider_name} />
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const CollectionView = ({ collectionId, api, onBack, onMovieClick }) => {
    const [collection, setCollection] = useState(null);
    
    useEffect(() => {
        api.getCollection(collectionId).then(setCollection).catch(console.error);
    }, [collectionId]);

    if(!collection) return <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="animate-fade-in-up pb-20">
            <button onClick={onBack} className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white">
                <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="relative rounded-2xl overflow-hidden mb-8 border border-slate-800">
                <img src={`${IMG_BASE_URL}/original${collection.backdrop_path}`} className="w-full h-64 object-cover opacity-60" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                <div className="absolute bottom-8 left-8">
                    <h1 className="text-4xl font-bold text-white mb-2">{collection.name}</h1>
                    <p className="text-slate-300 max-w-xl text-sm">{collection.overview}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {collection.parts.sort((a,b) => new Date(a.release_date) - new Date(b.release_date)).map(movie => (
                    <div key={movie.id} onClick={() => onMovieClick(movie.id)} className="cursor-pointer group bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-colors">
                        <Poster path={movie.poster_path} size="w342" className="aspect-[2/3]" alt={movie.title} />
                        <div className="p-3">
                            <h3 className="font-bold text-white text-sm truncate">{movie.title}</h3>
                            <p className="text-xs text-slate-500">{movie.release_date?.split('-')[0]}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SearchPage = ({ api, onMovieClick, onPersonClick }) => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('movie'); // 'movie' | 'person'
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
  }, [debouncedQuery, type]);

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
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    autoFocus
                />
            </div>
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700 shrink-0">
                <button 
                    onClick={() => setType('movie')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${type === 'movie' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Movies
                </button>
                <button 
                    onClick={() => setType('person')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${type === 'person' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    People
                </button>
            </div>
          </div>
      </div>

      {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
             {[...Array(8)].map((_,i) => <div key={i} className="bg-slate-900 aspect-[2/3] rounded-xl" />)}
          </div>
      ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {results.map(item => (
                <div 
                    key={item.id} 
                    onClick={() => type === 'movie' ? onMovieClick(item.id) : onPersonClick(item.id)}
                    className="cursor-pointer group bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-blue-500/50 transition-all hover:-translate-y-1"
                >
                    <Poster 
                        path={type === 'movie' ? item.poster_path : item.profile_path} 
                        size="w342" 
                        className="aspect-[2/3]" 
                        alt={item.name || item.title}
                    />
                    <div className="p-3">
                        <h4 className="text-sm font-bold text-white truncate">{item.title || item.name}</h4>
                        <p className="text-xs text-slate-500 truncate">
                           {type === 'movie' ? item.release_date?.split('-')[0] : item.known_for_department}
                        </p>
                    </div>
                </div>
            ))}
            {results.length === 0 && query && (
                <div className="col-span-full text-center text-slate-500 py-20">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    No results found for "{query}"
                </div>
            )}
          </div>
      )}
    </div>
  );
};

const Dashboard = ({ api, onMovieClick }) => {
  const [lists, setLists] = useState({ trending: [], nowPlaying: [], upcoming: [], indiaTop: [] });

  useEffect(() => {
    const fetchAll = async () => {
        try {
            const [t, n, u, i] = await Promise.all([
                api.getTrending('day'),
                api.getNowPlaying(),
                api.getUpcoming(),
                api.getTopRatedIndia()
            ]);
            setLists({ trending: t.results, nowPlaying: n.results, upcoming: u.results, indiaTop: i.results });
        } catch (e) { console.error(e); }
    };
    fetchAll();
  }, []);

  const MovieRail = ({ title, movies, icon: Icon }) => (
    <div className="mb-10">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-red-500" />} {title}
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar scroll-pl-4">
            {movies.map(m => (
                <div 
                    key={m.id} 
                    onClick={() => onMovieClick(m.id)}
                    className="min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] cursor-pointer group relative"
                >
                    <Poster path={m.poster_path} size="w500" className="rounded-xl aspect-[2/3] shadow-lg mb-3 group-hover:ring-2 ring-red-500 transition-all" alt={m.title} />
                    <div className="flex items-start justify-between gap-2">
                         <h4 className="text-sm font-medium text-slate-200 line-clamp-2 leading-tight group-hover:text-white transition-colors">{m.title}</h4>
                         <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {m.vote_average.toFixed(1)}
                         </span>
                    </div>
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
        <MovieRail title="Top Rated in India" movies={lists.indiaTop} icon={Globe} />
    </div>
  );
};

// --- MAIN APP SHELL ---

export default function App() {
  const [tmdbKey, setTmdbKey] = useState('5fa14720951576fe860871bd26f3d398');
  const [view, setView] = useState('dashboard'); // dashboard, search, detail, person, collection, picker
  const [selectedId, setSelectedId] = useState(null); // movieId, personId, or collectionId
  const [history, setHistory] = useState([]); // For simple back navigation

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

  const NavItem = ({ icon: Icon, label, targetView, active }) => (
    <button 
        onClick={() => { setHistory([]); setView(targetView); }}
        className={`flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-all ${active ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
    >
        <Icon className="w-6 h-6 md:w-5 md:h-5" />
        <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* Sidebar / Bottom Nav */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 z-40 md:static md:w-64 md:h-screen md:border-r md:border-t-0 md:flex md:flex-col p-2 md:p-6">
        <div className="hidden md:flex items-center gap-3 mb-10 px-2">
            <div className="bg-red-600 p-2 rounded-lg"><Film className="w-6 h-6 text-white" /></div>
            <h1 className="text-xl font-bold tracking-tight">Cine<span className="text-red-500">Verse</span></h1>
        </div>

        <nav className="flex md:flex-col justify-around md:justify-start gap-1 md:gap-2 w-full">
            <NavItem icon={TrendingUp} label="Discover" targetView="dashboard" active={view === 'dashboard'} />
            <NavItem icon={Search} label="Search" targetView="search" active={view === 'search'} />
            {/* Re-using the original Picker logic would go here as a separate view component if desired */}
            <div className="hidden md:block mt-auto">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <p className="text-xs text-slate-500 mb-2">API Connected</p>
                    <div className="flex items-center gap-2 text-green-400 text-xs font-mono">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Online
                    </div>
                </div>
            </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen md:h-screen custom-scrollbar">
        {view === 'dashboard' && <Dashboard api={api} onMovieClick={id => navigate('detail', id)} />}
        {view === 'search' && <SearchPage api={api} onMovieClick={id => navigate('detail', id)} onPersonClick={id => navigate('person', id)} />}
        {view === 'detail' && <MovieDetailView movieId={selectedId} api={api} onBack={goBack} onPersonClick={id => navigate('person', id)} onMovieClick={id => navigate('detail', id)} onCollectionClick={id => navigate('collection', id)} />}
        {view === 'person' && <PersonDetailView personId={selectedId} api={api} onBack={goBack} onMovieClick={id => navigate('detail', id)} />}
        {view === 'collection' && <CollectionView collectionId={selectedId} api={api} onBack={goBack} onMovieClick={id => navigate('detail', id)} />}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71, 85, 105, 0.8); }
        .text-shadow { text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}