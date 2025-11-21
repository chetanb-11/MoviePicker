import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Eye, EyeOff, Clock, Star, Play, ExternalLink, Tv, DollarSign, TrendingUp } from 'lucide-react';
import { IMG_BASE_URL } from '../services/api';
import Poster from '../components/ui/Poster';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

const MovieDetail = ({ api, watchlist, toggleWatchlist, seenHistory, markSeen, unmarkSeen }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showTrailer, setShowTrailer] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.getMovie(id).then(setMovie).catch(console.error).finally(() => setLoading(false));
    }, [id, api]);

    if (loading) return <div className="flex justify-center p-20"><div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!movie) return null;

    const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const director = movie.credits?.crew?.find(c => c.job === 'Director');
    const isWatchlisted = watchlist.some(m => m.id === movie.id);
    const isSeen = seenHistory.some(m => typeof m === 'object' ? m.id === movie.id : m === movie.id);
    const watchProvider = movie['watch/providers']?.results?.IN || movie['watch/providers']?.results?.US;
    const providers = watchProvider?.flatrate;
    const watchLink = watchProvider?.link;

    const onPersonClick = (personId) => navigate(`/person/${personId}`);
    const onMovieClick = (movieId) => navigate(`/movie/${movieId}`);

    return (
        <div className="animate-fade-in-up pb-20 lg:pb-10">
            <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white sticky top-0 bg-slate-950/80 p-2 rounded z-20 backdrop-blur w-fit"><ChevronLeft className="w-4 h-4" /> Back</button>
            <div className="relative w-full h-[50vh] md:h-[70vh] rounded-2xl overflow-hidden mb-8 group shadow-2xl border border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-10" />
                <img src={`${IMG_BASE_URL}/original${movie.backdrop_path || movie.poster_path}`} alt={movie.title} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 z-30 flex gap-3">
                    <button onClick={() => toggleWatchlist(movie)} className={`p-3 rounded-full backdrop-blur-md border transition-all ${isWatchlisted ? 'bg-red-600 text-white border-red-500' : 'bg-black/40 text-white border-white/10'}`}><Heart className={`w-5 h-5 ${isWatchlisted ? 'fill-current' : ''}`} /></button>
                    <button onClick={() => isSeen ? unmarkSeen(movie.id) : markSeen(movie)} className={`p-3 rounded-full backdrop-blur-md border transition-all ${isSeen ? 'bg-green-600 text-white border-green-500' : 'bg-black/40 text-white border-white/10'}`}>{isSeen ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}</button>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 z-20">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 text-shadow">{movie.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 mb-4">
                        <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">{movie.release_date?.split('-')[0]}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                        <span className="flex items-center gap-1 text-amber-400 font-bold"><Star className="w-4 h-4 fill-current" /> {movie.vote_average.toFixed(1)}</span>
                        {isSeen && <span className="text-green-400 text-xs uppercase font-bold tracking-wider border border-green-500/30 px-2 py-0.5 rounded bg-green-500/10">Seen</span>}
                    </div>
                    <p className="text-slate-200 max-w-2xl text-lg leading-relaxed line-clamp-3 md:line-clamp-none drop-shadow-md">{movie.overview}</p>
                    <div className="flex gap-3 mt-6">
                        {trailer && (
                            <button
                                onClick={() => setShowTrailer(true)}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-red-900/40"
                            >
                                <Play className="w-5 h-5 fill-current" /> Watch Trailer
                            </button>
                        )}
                        {movie.external_ids?.imdb_id && (<a href={`https://www.imdb.com/title/${movie.external_ids.imdb_id}`} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-[#f5c518] hover:text-black text-white px-4 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 backdrop-blur-sm border border-white/10">IMDb <ExternalLink className="w-4 h-4" /></a>)}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <section><h3 className="text-xl font-bold text-white mb-4">Top Cast</h3><div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">{movie.credits?.cast?.slice(0, 10).map(person => (<div key={person.id} onClick={() => onPersonClick(person.id)} className="min-w-[100px] w-[100px] cursor-pointer group"><Poster path={person.profile_path} size="w185" className="rounded-lg h-[150px] mb-2 group-hover:ring-2 ring-blue-500 transition-all" alt={person.name} /><p className="text-xs font-bold text-white truncate">{person.name}</p><p className="text-[10px] text-slate-400 truncate">{person.character}</p></div>))}</div></section>
                    {movie.recommendations?.results?.length > 0 && (<section><h3 className="text-xl font-bold text-white mb-4">More Like This</h3><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">{movie.recommendations.results.slice(0, 4).map(m => (<div key={m.id} onClick={() => onMovieClick(m.id)} className="cursor-pointer group"><Poster path={m.backdrop_path} size="w780" className="rounded-lg aspect-video mb-2 group-hover:ring-2 ring-blue-500 transition-all" alt={m.title} /><h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-white">{m.title}</h4></div>))}</div></section>)}
                </div>
                <div className="space-y-6">
                    <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                        {providers && providers.length > 0 && (
                            <div className="pb-4 mb-4 border-b border-slate-800">
                                <h4 className="text-slate-500 text-xs font-bold uppercase mb-3 flex items-center gap-2"><Tv className="w-4 h-4" /> Stream Now</h4>
                                <div className="flex flex-wrap gap-3">
                                    {providers.map(p => (
                                        <a key={p.provider_id} href={watchLink} target="_blank" rel="noreferrer" className="hover:scale-110 transition-transform block">
                                            <img src={`${IMG_BASE_URL}/original${p.logo_path}`} className="w-10 h-10 rounded-lg shadow-lg" title={`Watch on ${p.provider_name}`} alt={p.provider_name} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div><h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Director</h4><p className="text-white font-medium">{director?.name || 'Unknown'}</p></div>
                        <div><h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Status</h4><Badge className={movie.status === 'Released' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-slate-600 text-slate-400'}>{movie.status}</Badge></div>
                        <div><h4 className="text-slate-500 text-xs font-bold uppercase mb-1">Budget / Revenue</h4><div className="text-sm text-slate-300 space-y-1"><div className="flex items-center gap-2"><DollarSign className="w-3 h-3 text-red-400" /> {movie.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : 'N/A'}</div><div className="flex items-center gap-2"><TrendingUp className="w-3 h-3 text-green-400" /> {movie.revenue ? `$${(movie.revenue / 1000000).toFixed(1)}M` : 'N/A'}</div></div></div>
                    </div>
                </div>
            </div>

            {/* Trailer Modal */}
            <Modal isOpen={showTrailer} onClose={() => setShowTrailer(false)}>
                {trailer && (
                    <div className="aspect-video w-full">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                            title={trailer.name}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MovieDetail;
