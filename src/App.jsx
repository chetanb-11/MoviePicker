import React, { useState, useEffect } from 'react';
import { Film, Popcorn, Ticket, Shuffle, Info, Star, Calendar, Key, Clapperboard, AlertCircle, Sparkles, MessageSquareQuote, Lightbulb, Utensils } from 'lucide-react';

export default function App() {
  // TMDB API Key State (renamed to avoid conflict with Gemini key)
  const [tmdbKey, setTmdbKey] = useState('5fa14720951576fe860871bd26f3d398');
  const [isKeySaved, setIsKeySaved] = useState(true);
  
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [suggestedMovie, setSuggestedMovie] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // AI State
  const [aiContent, setAiContent] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiType, setAiType] = useState(null); // 'hype', 'trivia', 'snack'

  // Fetch Genres on Load
  useEffect(() => {
    if (isKeySaved && tmdbKey) {
      fetchGenres();
    }
  }, [isKeySaved, tmdbKey]);

  // --- TMDB Functions ---

  const fetchGenres = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${tmdbKey}&language=en-US`);
      const data = await response.json();
      
      if (data.success === false) {
        throw new Error(data.status_message || "Invalid API Key");
      }
      
      setGenres(data.genres || []);
    } catch (err) {
      setError("Failed to load genres. Please check your API Key.");
      setIsKeySaved(false);
    } finally {
      setLoading(false);
    }
  };

  const pickMovie = async () => {
    if (!selectedGenre || !tmdbKey) return;

    setLoading(true);
    setError(null);
    setSuggestedMovie(null);
    setAiContent(null); // Reset AI content on new movie
    setAiType(null);

    try {
      const randomPage = Math.floor(Math.random() * 20) + 1; 
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbKey}&with_genres=${selectedGenre.id}&sort_by=vote_average.desc&vote_count.gte=300&page=${randomPage}&language=en-US`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const movie = data.results[randomIndex];
        setSuggestedMovie(movie);
      } else {
        setError("No movies found for this genre.");
      }
    } catch (err) {
      setError("Failed to fetch a movie. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Gemini AI Functions ---

  const fetchGeminiContent = async (type, movieTitle) => {
    const apiKey = "AIzaSyBa--1mdMlGsq3_RCZcL4CS4L6QA9aWPb4"; // Gemini API Key injected by environment
    if (!apiKey) {
        // Fallback if no key is present in environment (for demo purposes)
        setError("Gemini API Key is missing from environment.");
        return;
    }

    setAiLoading(true);
    setAiContent(null);
    setAiType(type);

    let prompt = "";
    switch (type) {
        case 'hype':
            prompt = `Act as an enthusiastic movie critic. Give me a short, 2-sentence persuasive pitch on why I MUST watch the movie "${movieTitle}" right now. Use emojis.`;
            break;
        case 'trivia':
            prompt = `Tell me one fascinating, lesser-known behind-the-scenes fact or trivia about the movie "${movieTitle}". Keep it short (under 40 words).`;
            break;
        case 'snack':
            prompt = `Suggest a specific snack or drink pairing that perfectly matches the vibe/theme of the movie "${movieTitle}". Explain why in one sentence.`;
            break;
        default:
            prompt = `Tell me about ${movieTitle}`;
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        if (!response.ok) throw new Error("AI Request Failed");

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        setAiContent(generatedText);
    } catch (err) {
        setAiContent("Oops! My AI brain froze. Try again.");
    } finally {
        setAiLoading(false);
    }
  };

  // --- Event Handlers ---

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (tmdbKey.trim().length > 10) {
      setIsKeySaved(true);
    } else {
        setError("Please enter a valid API Key");
    }
  };

  const handleResetKey = () => {
      setIsKeySaved(false);
      setGenres([]);
      setSelectedGenre(null);
      setSuggestedMovie(null);
      setTmdbKey('');
      setAiContent(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center justify-center p-4">
      
      {/* TAILWIND TEST - Remove this after testing */}
      <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
        <p className="font-bold">Tailwind Test</p>
        <p className="text-sm">If you see this green box, Tailwind is working!</p>
      </div>
      
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-down">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Film className="w-10 h-10 text-red-500" />
          <h1 className="text-4xl font-bold tracking-tight text-white">Movie Picker</h1>
        </div>
        <p className="text-slate-400 flex items-center justify-center gap-2">
            Powered by TMDB 
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-blue-400"><Sparkles className="w-3 h-3" /> AI Enhanced</span>
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 relative">
        
        {/* API Key Input Section (Overlay if not saved) */}
        {!isKeySaved ? (
          <div className="p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
            <Key className="w-12 h-12 text-amber-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Enter TMDB API Key</h2>
            <p className="text-slate-400 text-sm mb-6">
              Paste your TMDB API Key below to enable real-time movie data.
            </p>
            
            <form onSubmit={handleSaveKey} className="w-full">
              <input
                type="text"
                value={tmdbKey}
                onChange={(e) => {
                    setTmdbKey(e.target.value);
                    setError(null);
                }}
                placeholder="Ex: a1b2c3d4..."
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-4 text-center font-mono text-sm"
              />
              {error && (
                  <div className="flex items-center justify-center gap-2 text-red-400 text-sm mb-4">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                  </div>
              )}
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Start Exploring
              </button>
            </form>
            <div className="mt-4 text-xs text-slate-500">
                Don't have a key? <a href="https://www.themoviedb.org/signup" target="_blank" rel="noreferrer" className="text-red-400 hover:underline">Sign up here</a>
            </div>
          </div>
        ) : (
          /* Main App Logic */
          <>
            <div className="absolute top-4 right-4 z-10">
                <button 
                    onClick={handleResetKey}
                    className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded backdrop-blur-sm"
                    title="Change API Key"
                >
                    <Key className="w-3 h-3" /> Reset Key
                </button>
            </div>

            {/* Step 1: Genre Selection */}
            <div className="p-6 border-b border-slate-700 bg-slate-800">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Popcorn className="w-4 h-4" />
                Select a Genre
              </h2>
              
              {loading && genres.length === 0 ? (
                 <div className="flex justify-center py-4"><div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center max-h-32 overflow-y-auto custom-scrollbar">
                    {genres.map((genre) => (
                    <button
                        key={genre.id}
                        onClick={() => {
                            setSelectedGenre(genre);
                            setSuggestedMovie(null);
                            setAiContent(null);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105
                        ${selectedGenre?.id === genre.id 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                    >
                        {genre.name}
                    </button>
                    ))}
                </div>
              )}
            </div>

            {/* Step 2: The Picker */}
            <div className="p-6 flex flex-col items-center min-h-[350px] justify-start relative bg-gradient-to-b from-slate-800 to-slate-900">
              
              {!selectedGenre ? (
                <div className="text-center text-slate-500 animate-pulse mt-12">
                  <Clapperboard className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Choose a genre above to start</p>
                </div>
              ) : (
                <>
                  {/* Suggestion Display */}
                  {suggestedMovie && !loading ? (
                    <div className="w-full animate-fade-in-up">
                      <div className="bg-slate-950/50 rounded-xl overflow-hidden border border-slate-700/50 relative flex flex-col md:flex-row mb-4">
                        {/* Poster */}
                        {suggestedMovie.poster_path ? (
                            <div className="w-full md:w-1/3 relative">
                                <img 
                                    src={`https://image.tmdb.org/t/p/w500${suggestedMovie.poster_path}`} 
                                    alt={suggestedMovie.title}
                                    className="w-full h-48 md:h-full object-cover"
                                />
                            </div>
                        ) : null}

                        <div className="p-4 flex-1 flex flex-col">
                             <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold px-2 py-1 bg-amber-900/20 rounded border border-amber-500/20">
                                    <Star className="w-3 h-3 fill-current" />
                                    {suggestedMovie.vote_average.toFixed(1)}
                                </div>
                                <div className="text-slate-400 text-xs font-mono flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {suggestedMovie.release_date?.split('-')[0] || 'N/A'}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                            {suggestedMovie.title}
                            </h3>
                            
                            <p className="text-slate-400 text-xs leading-relaxed mb-3 line-clamp-4">
                            {suggestedMovie.overview}
                            </p>

                            <div className="mt-auto pt-2">
                                <a 
                                    href={`https://www.google.com/search?q=${encodeURIComponent(suggestedMovie.title + " movie")}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
                                >
                                    More Info <Info className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                      </div>

                      {/* ✨ AI Features Section */}
                      <div className="bg-blue-950/30 rounded-xl border border-blue-900/50 p-3">
                        <div className="flex items-center gap-2 mb-3">
                             <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                             <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">AI Insider</span>
                        </div>
                        
                        {!aiContent && !aiLoading && (
                            <div className="grid grid-cols-3 gap-2">
                                <button 
                                    onClick={() => fetchGeminiContent('hype', suggestedMovie.title)}
                                    className="flex flex-col items-center justify-center gap-1 bg-slate-800 hover:bg-blue-900/50 p-2 rounded-lg transition-colors text-center group"
                                >
                                    <MessageSquareQuote className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                                    <span className="text-[10px] text-slate-300">Hype Me Up</span>
                                </button>
                                <button 
                                    onClick={() => fetchGeminiContent('trivia', suggestedMovie.title)}
                                    className="flex flex-col items-center justify-center gap-1 bg-slate-800 hover:bg-purple-900/50 p-2 rounded-lg transition-colors text-center group"
                                >
                                    <Lightbulb className="w-4 h-4 text-slate-400 group-hover:text-purple-400" />
                                    <span className="text-[10px] text-slate-300">Fun Fact</span>
                                </button>
                                <button 
                                    onClick={() => fetchGeminiContent('snack', suggestedMovie.title)}
                                    className="flex flex-col items-center justify-center gap-1 bg-slate-800 hover:bg-green-900/50 p-2 rounded-lg transition-colors text-center group"
                                >
                                    <Utensils className="w-4 h-4 text-slate-400 group-hover:text-green-400" />
                                    <span className="text-[10px] text-slate-300">Snack Pairing</span>
                                </button>
                            </div>
                        )}

                        {aiLoading && (
                             <div className="text-center py-4">
                                <div className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <p className="text-xs text-blue-300 animate-pulse">Consulting the AI oracle...</p>
                             </div>
                        )}

                        {aiContent && (
                             <div className="animate-fade-in-up">
                                <p className="text-xs text-blue-100 leading-relaxed italic bg-blue-900/20 p-3 rounded border border-blue-800/50">
                                    "{aiContent}"
                                </p>
                                <button 
                                    onClick={() => setAiContent(null)}
                                    className="w-full text-[10px] text-slate-500 hover:text-slate-300 mt-2 text-center"
                                >
                                    Clear / Ask Something Else
                                </button>
                             </div>
                        )}
                      </div>
                    </div>
                  ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 text-sm font-mono animate-pulse">Fetching from TMDB...</p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 mt-12">
                      <Ticket className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p>Find a top-rated {selectedGenre.name} movie</p>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={pickMovie}
                    disabled={loading}
                    className={`mt-4 w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300
                      ${loading 
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-white text-slate-900 hover:bg-red-500 hover:text-white shadow-lg hover:shadow-red-500/50 active:scale-95'
                      }`}
                  >
                    <Shuffle className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    {suggestedMovie ? "Pick Another" : "Pick Movie"}
                  </button>
                  
                  {error && (
                      <div className="mt-2 text-red-400 text-xs">{error}</div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div className="mt-8 text-slate-600 text-xs flex flex-col items-center">
        <p>Powered by React & Tailwind CSS</p>
        <p className="opacity-50 mt-1">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      </div>
      
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(30, 41, 59, 0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(71, 85, 105, 0.8);
            border-radius: 4px;
        }
      `}</style>
    </div>
  );
}