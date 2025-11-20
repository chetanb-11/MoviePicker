import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, Popcorn, Ticket, Shuffle, Info, Star, Calendar, Key, 
  Clapperboard, AlertCircle, Sparkles, MessageSquareQuote, 
  Lightbulb, Utensils, Tv, Youtube, Eye, EyeOff, Heart, Search, 
  X, Menu, ExternalLink 
} from 'lucide-react';

// --- CONSTANTS & CONFIG ---
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';

// --- HOOKS ---

// Hook to manage Local Storage (Watchlist & History)
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

// --- COMPONENTS ---

const Header = ({ onOpenWatchlist, hasApiKey }) => (
  <div className="flex justify-between items-center w-full max-w-4xl mb-8 animate-fade-in-down">
    <div className="flex items-center gap-3">
      <Film className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
      <div>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">Movie Picker</h1>
        <p className="text-xs md:text-sm text-slate-400 flex items-center gap-2">
          <span className="flex items-center gap-1 text-blue-400"><Sparkles className="w-3 h-3" /> AI Enhanced</span>
        </p>
      </div>
    </div>
    {hasApiKey && (
      <button 
        onClick={onOpenWatchlist}
        className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-full relative transition-colors"
        title="Open Watchlist"
      >
        <Heart className="w-6 h-6" />
      </button>
    )}
  </div>
);

const ApiKeyModal = ({ tmdbKey, setTmdbKey, geminiKey, setGeminiKey, onSave, error }) => (
  <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 rounded-2xl">
    <div className="w-full max-w-sm bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl">
      <Key className="w-10 h-10 text-amber-400 mb-4 mx-auto" />
      <h2 className="text-xl font-bold text-white mb-4 text-center">Setup API Keys</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">TMDB API Key</label>
          <input
            type="text"
            value={tmdbKey}
            onChange={(e) => setTmdbKey(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-xs font-mono focus:border-red-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Gemini API Key (Optional for AI)</label>
          <input
            type="text"
            value={geminiKey}
            onChange={(e) => setGeminiKey(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white text-xs font-mono focus:border-blue-500 outline-none"
          />
        </div>
        
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        
        <button onClick={onSave} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition-colors">
          Start App
        </button>
      </div>
    </div>
  </div>
);

const VibeSearch = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mb-6">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-200"></div>
        <div className="relative flex items-center bg-slate-900 rounded-lg p-1">
          <Sparkles className="w-5 h-5 text-blue-400 ml-3 animate-pulse" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your vibe (e.g. '90s sci-fi that feels optimistic')..."
            className="w-full bg-transparent text-white px-3 py-3 focus:outline-none text-sm placeholder-slate-500"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Search'}
          </button>
        </div>
      </div>
    </form>
  );
};

const GenreSelector = ({ genres, selectedGenre, onSelect }) => (
  <div className="mb-6">
    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
      <Popcorn className="w-3 h-3" /> Browse by Genre
    </h2>
    <div className="flex flex-wrap gap-2">
      {genres.map((genre) => (
        <button
          key={genre.id}
          onClick={() => onSelect(genre)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 
            ${selectedGenre?.id === genre.id 
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/50 scale-105' 
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
        >
          {genre.name}
        </button>
      ))}
    </div>
  </div>
);

const MovieRatings = ({ movie, geminiKey }) => {
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRatings = async () => {
    if (!geminiKey) return;
    setLoading(true);
    try {
      const response = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `Return a JSON object with estimated ratings for the movie "${movie.title}" (${movie.release_date?.split('-')[0]}). Format: { "imdb": "X.X/10", "rottenTomatoes": "XX%", "metacritic": "XX" }. If exact is unknown, give a best estimate based on critical consensus.` 
            }] 
          }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await response.json();
      setRatings(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (movie) {
        setRatings(null);
        // Auto fetch on mount if you want, or wait for user. Let's auto-fetch for better UX.
        fetchRatings();
    }
  }, [movie]);

  if (!ratings && loading) return <div className="text-xs text-slate-500 animate-pulse">Loading cross-platform ratings...</div>;
  if (!ratings) return null;

  return (
    <div className="flex gap-3 mt-3 border-t border-slate-700/50 pt-3">
      <div className="flex items-center gap-1 bg-[#f5c518]/10 px-2 py-1 rounded text-[#f5c518] text-xs border border-[#f5c518]/20" title="IMDb">
        <span className="font-black">IMDb</span> {ratings.imdb}
      </div>
      <div className="flex items-center gap-1 bg-[#fa320a]/10 px-2 py-1 rounded text-[#fa320a] text-xs border border-[#fa320a]/20" title="Rotten Tomatoes">
        <span className="font-black">RT</span> {ratings.rottenTomatoes}
      </div>
       <div className="flex items-center gap-1 bg-[#66cc33]/10 px-2 py-1 rounded text-[#66cc33] text-xs border border-[#66cc33]/20" title="Metacritic">
        <span className="font-black">Meta</span> {ratings.metacritic}
      </div>
    </div>
  );
};

const AiInsights = ({ movie, geminiKey }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState(null);

  const fetchInsight = async (type) => {
    if (!geminiKey) return alert("Please add a Gemini Key in settings");
    setLoading(true);
    setActiveType(type);
    setContent('');
    
    const prompts = {
      hype: `Give me a short, high-energy pitch on why I MUST watch "${movie.title}" right now.`,
      trivia: `Tell me one fascinating behind-the-scenes fact about "${movie.title}".`,
      snack: `Suggest a thematic snack pairing for "${movie.title}" and why.`
    };

    try {
      const response = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompts[type] }] }] })
      });
      const data = await response.json();
      setContent(data.candidates[0].content.parts[0].text);
    } catch (e) {
      setContent("AI is currently taking a nap. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Reset when movie changes
  useEffect(() => { setContent(''); setActiveType(null); }, [movie]);

  return (
    <div className="mt-4 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3" /> AI Insider
        </div>
      </div>

      {!content && !loading && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'hype', icon: MessageSquareQuote, label: 'Hype Me' },
            { id: 'trivia', icon: Lightbulb, label: 'Trivia' },
            { id: 'snack', icon: Utensils, label: 'Snacks' }
          ].map(btn => (
            <button 
              key={btn.id}
              onClick={() => fetchInsight(btn.id)}
              className="flex flex-col items-center gap-1 bg-slate-700/50 hover:bg-blue-600/20 p-2 rounded hover:text-blue-400 transition-colors group"
            >
              <btn.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
              <span className="text-[10px] text-slate-300">{btn.label}</span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {content && (
        <div className="animate-fade-in-up">
          <p className="text-xs text-slate-300 italic border-l-2 border-blue-500 pl-3 py-1 mb-2">
            "{content}"
          </p>
          <button onClick={() => setContent('')} className="text-[10px] text-slate-500 hover:underline w-full text-right">
            Ask something else
          </button>
        </div>
      )}
    </div>
  );
};

const MovieCard = ({ movie, geminiKey, onToggleWatchlist, isInWatchlist, onMarkSeen, isSeen }) => {
  if (!movie) return null;

  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  // Filter unique providers
  const providers = movie['watch/providers']?.results?.['US']?.flatrate?.slice(0, 4) || [];

  return (
    <div className="w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl animate-fade-in-up">
      {/* Hero Section */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden group">
        {trailer ? (
            <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${trailer.key}?rel=0&controls=1`} 
                title={movie.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
            ></iframe>
        ) : (
            <img 
                src={movie.backdrop_path ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}` : `https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                alt={movie.title} 
                className="w-full h-full object-cover opacity-80"
            />
        )}
        
        {/* Actions Overlay */}
        <div className="absolute top-3 right-3 flex gap-2">
            <button 
                onClick={onMarkSeen}
                className={`p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors ${isSeen ? 'bg-green-500/80 text-white' : 'bg-black/50 text-slate-300 hover:bg-black/80'}`}
                title={isSeen ? "Seen" : "Mark as Seen"}
            >
                {isSeen ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button 
                onClick={onToggleWatchlist}
                className={`p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors ${isInWatchlist ? 'bg-red-500/80 text-white' : 'bg-black/50 text-slate-300 hover:bg-black/80'}`}
                title="Watchlist"
            >
                <Heart className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} />
            </button>
        </div>
      </div>

      <div className="p-5">
        {/* Header Info */}
        <div className="flex justify-between items-start mb-3">
          <div>
             <h2 className="text-2xl font-bold text-white leading-tight mb-1">{movie.title}</h2>
             <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {movie.release_date?.split('-')[0]}</span>
                <span className="flex items-center gap-1 text-amber-400"><Star className="w-3 h-3 fill-current" /> {movie.vote_average.toFixed(1)} (TMDB)</span>
             </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-4 line-clamp-3">{movie.overview}</p>

        {/* Streaming Providers */}
        {providers.length > 0 && (
            <div className="mb-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Stream on</p>
                <div className="flex gap-2">
                    {providers.map(p => (
                        <div key={p.provider_id} className="bg-slate-800 p-1 rounded border border-slate-700" title={p.provider_name}>
                            <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} className="w-6 h-6 rounded-sm" />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* AI Ratings */}
        <MovieRatings movie={movie} geminiKey={geminiKey} />

        {/* AI Features */}
        <AiInsights movie={movie} geminiKey={geminiKey} />
      </div>
    </div>
  );
};

const WatchlistDrawer = ({ isOpen, onClose, watchlist, onRemove }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-full max-w-xs bg-slate-900 h-full border-l border-slate-800 shadow-2xl p-4 overflow-y-auto animate-slide-in-right">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-current" /> Watchlist
                </h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            {watchlist.length === 0 ? (
                <div className="text-center text-slate-600 mt-10">
                    <Film className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Your list is empty.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {watchlist.map(movie => (
                        <div key={movie.id} className="flex gap-3 bg-slate-800 p-2 rounded-lg group">
                            <img src={`${IMG_BASE_URL}${movie.poster_path}`} className="w-12 h-16 object-cover rounded" alt="" />
                            <div className="flex-1 overflow-hidden">
                                <h4 className="text-sm font-bold text-white truncate">{movie.title}</h4>
                                <p className="text-xs text-slate-400">{movie.release_date?.split('-')[0]}</p>
                                <button 
                                    onClick={() => onRemove(movie.id)}
                                    className="text-[10px] text-red-400 hover:text-red-300 mt-2"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};


// --- MAIN APP ---

export default function App() {
  // State
  const [tmdbKey, setTmdbKey] = useState('5fa14720951576fe860871bd26f3d398');
  const [geminiKey, setGeminiKey] = useState('AIzaSyBa--1mdMlGsq3_RCZcL4CS4L6QA9aWPb4');
  const [isKeyConfigured, setIsKeyConfigured] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [suggestedMovie, setSuggestedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [watchlist, setWatchlist] = useLocalStorage('movie-picker-watchlist', []);
  const [seenHistory, setSeenHistory] = useLocalStorage('movie-picker-seen', []);

  // Init
  useEffect(() => {
    if (isKeyConfigured && tmdbKey) fetchGenres();
  }, [isKeyConfigured, tmdbKey]);

  // API Calls
  const fetchGenres = async () => {
    try {
      const res = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${tmdbKey}&language=en-US`);
      const data = await res.json();
      if (data.genres) setGenres(data.genres);
    } catch (e) { console.error("Genre fetch failed"); }
  };

  const searchByVibe = async (query) => {
    if (!geminiKey) return setError("Gemini Key required for Vibe Search");
    setLoading(true);
    setSuggestedMovie(null);
    setSelectedGenre(null);

    try {
      // Ask AI to convert vibe to TMDB parameters
      const aiPrompt = `User wants a movie with this vibe: "${query}". 
      Return valid JSON with: 
      1. "with_genres": array of TMDB genre ids (Action=28, Adventure=12, Animation=16, Comedy=35, Crime=80, Documentary=99, Drama=18, Family=10751, Fantasy=14, History=36, Horror=27, Music=10402, Mystery=9648, Romance=10749, SciFi=878, TV Movie=10770, Thriller=53, War=10752, Western=37).
      2. "primary_release_date.gte": string date (YYYY-MM-DD) or null.
      3. "sort_by": "vote_average.desc" or "popularity.desc".
      4. "with_keywords": array of keyword strings (optional).
      Only return JSON.`;

      const aiRes = await fetch(`${GEMINI_URL}?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: aiPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        })
      });
      
      const aiData = await aiRes.json();
      const params = JSON.parse(aiData.candidates[0].content.parts[0].text);
      
      // Convert AI params to TMDB query
      let url = `${TMDB_BASE_URL}/discover/movie?api_key=${tmdbKey}&language=en-US&vote_count.gte=100&include_adult=false`;
      if (params.with_genres?.length) url += `&with_genres=${params.with_genres.join(',')}`;
      if (params['primary_release_date.gte']) url += `&primary_release_date.gte=${params['primary_release_date.gte']}`;
      url += `&sort_by=${params.sort_by || 'popularity.desc'}`;
      
      // Fetch
      const movieRes = await fetch(url);
      const movieData = await movieRes.json();
      
      await processMovieResults(movieData.results);

    } catch (e) {
      setError("AI Vibe Check failed. Try again.");
      setLoading(false);
    }
  };

  const pickMovieByGenre = async (genre) => {
    setSelectedGenre(genre);
    setLoading(true);
    setSuggestedMovie(null);
    
    try {
      const randomPage = Math.floor(Math.random() * 15) + 1;
      const res = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${tmdbKey}&with_genres=${genre.id}&sort_by=vote_average.desc&vote_count.gte=300&page=${randomPage}&language=en-US`
      );
      const data = await res.json();
      await processMovieResults(data.results);
    } catch (e) {
      setError("Failed to fetch movies.");
      setLoading(false);
    }
  };

  const processMovieResults = async (results) => {
    // Filter out seen movies
    const unseen = results.filter(m => !seenHistory.includes(m.id));
    const pool = unseen.length > 0 ? unseen : results; // Fallback if all seen
    
    if (pool.length === 0) {
        setError("No movies found.");
        setLoading(false);
        return;
    }

    const randomMovie = pool[Math.floor(Math.random() * pool.length)];
    
    // Fetch Details (Trailers & Providers)
    const detailsRes = await fetch(`${TMDB_BASE_URL}/movie/${randomMovie.id}?api_key=${tmdbKey}&append_to_response=videos,watch/providers`);
    const details = await detailsRes.json();
    
    setSuggestedMovie(details);
    setLoading(false);
  };

  // Watchlist Logic
  const toggleWatchlist = (movie) => {
    if (watchlist.some(m => m.id === movie.id)) {
        setWatchlist(watchlist.filter(m => m.id !== movie.id));
    } else {
        setWatchlist([...watchlist, movie]);
    }
  };

  const markSeen = (id) => {
    if (!seenHistory.includes(id)) setSeenHistory([...seenHistory, id]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center p-4 md:p-8">
      
      {!isKeyConfigured || showConfig ? (
        <ApiKeyModal 
            tmdbKey={tmdbKey} setTmdbKey={setTmdbKey} 
            geminiKey={geminiKey} setGeminiKey={setGeminiKey}
            onSave={() => { setIsKeyConfigured(true); setShowConfig(false); }}
        />
      ) : null}

      <div className="absolute top-4 right-4 z-10">
        <button onClick={() => setShowConfig(true)} className="p-2 text-slate-500 hover:text-white">
            <Key className="w-5 h-5" />
        </button>
      </div>

      <Header onOpenWatchlist={() => setShowWatchlist(true)} hasApiKey={isKeyConfigured} />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Controls */}
        <div className="md:col-span-4 lg:col-span-3 order-2 md:order-1 space-y-6">
           <VibeSearch onSearch={searchByVibe} loading={loading} />
           <GenreSelector genres={genres} selectedGenre={selectedGenre} onSelect={pickMovieByGenre} />
        </div>

        {/* Right Column: Display */}
        <div className="md:col-span-8 lg:col-span-9 order-1 md:order-2 min-h-[500px]">
            {loading ? (
                <div className="h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-400 animate-pulse">Finding your next favorite...</p>
                </div>
            ) : suggestedMovie ? (
                <MovieCard 
                    movie={suggestedMovie} 
                    geminiKey={geminiKey}
                    onToggleWatchlist={() => toggleWatchlist(suggestedMovie)}
                    isInWatchlist={watchlist.some(m => m.id === suggestedMovie.id)}
                    onMarkSeen={() => markSeen(suggestedMovie.id)}
                    isSeen={seenHistory.includes(suggestedMovie.id)}
                />
            ) : (
                <div className="h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed p-8 text-center">
                    <Clapperboard className="w-16 h-16 text-slate-700 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Ready to Watch?</h3>
                    <p className="text-slate-400 max-w-xs mx-auto">Select a genre from the left or describe your vibe to get started.</p>
                </div>
            )}
            {error && <div className="mt-4 p-4 bg-red-900/20 text-red-400 rounded border border-red-900/50 text-center">{error}</div>}
        </div>
      </div>

      <WatchlistDrawer 
        isOpen={showWatchlist} 
        onClose={() => setShowWatchlist(false)} 
        watchlist={watchlist} 
        onRemove={(id) => setWatchlist(watchlist.filter(m => m.id !== id))} 
      />

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-fade-in-down { animation: fadeInDown 0.6s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}