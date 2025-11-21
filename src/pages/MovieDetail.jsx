import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star, Calendar, Clock, ChevronLeft, ExternalLink } from 'lucide-react';
import { IMG_BASE_URL } from '../services/api';
import Poster from '../components/ui/Poster';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

const MovieDetail = ({ api, watchlist, toggleWatchlist, seenHistory, markSeen, unmarkSeen }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [cast, setCast] = useState([]);
    const [videos, setVideos] = useState([]);
    const [showTrailer, setShowTrailer] = useState(false);
    const [watchProviders, setWatchProviders] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        api.getMovie(id).then(data => {
            setMovie(data);
            setVideos(data.videos?.results || []);
            setCast(data.credits?.cast || []);

            // Get Watch Providers
            const providers = data['watch/providers']?.results?.IN || data['watch/providers']?.results?.US;
            setWatchProviders(providers);
        });
    }, [id, api]);

    if (!movie) return <div className="h-screen bg-background" />;

    const isWatchlisted = watchlist.some(m => m.id === movie.id);
    const isSeen = seenHistory.some(m => (typeof m === 'object' ? m.id : m) === movie.id);
    const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');

    const handleWatchlist = () => toggleWatchlist(movie);
    const handleSeen = () => isSeen ? unmarkSeen(movie.id) : markSeen(movie);

    return (
        <div className="bg-background min-h-screen pb-20">
            {/* Parallax Hero Backdrop */}
            <div className="relative h-[70vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={`${IMG_BASE_URL}/original${movie.backdrop_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
                </div>

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 z-50 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full px-6 md:px-12 pb-12 flex flex-col md:flex-row gap-8 items-end">
                    {/* Poster (Hidden on mobile, visible on desktop) */}
                    <div className="hidden md:block w-64 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
                        <Poster path={movie.poster_path} alt={movie.title} className="w-full" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-6 max-w-3xl">
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-xl">
                            {movie.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium text-slate-300">
                            <span className="flex items-center gap-1 text-amber-400">
                                <Star className="w-4 h-4 fill-current" /> {movie.vote_average?.toFixed(1)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" /> {movie.release_date?.split('-')[0]}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                            </span>
                            {movie.genres?.slice(0, 3).map(g => (
                                <span key={g.id} className="px-2 py-0.5 border border-slate-600 rounded-full text-xs">
                                    {g.name}
                                </span>
                            ))}
                        </div>

                        <p className="text-slate-200 text-lg leading-relaxed line-clamp-4 md:line-clamp-none drop-shadow-md">
                            {movie.overview}
                        </p>

                        <div className="flex flex-wrap gap-4 pt-2">
                            <Button
                                variant="primary"
                                size="lg"
                                icon={<Play className="w-5 h-5 fill-current" />}
                                onClick={() => trailer && setShowTrailer(true)}
                                disabled={!trailer}
                            >
                                {trailer ? 'Watch Trailer' : 'No Trailer'}
                            </Button>

                            <Button
                                variant="secondary"
                                size="lg"
                                icon={isWatchlisted ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                onClick={handleWatchlist}
                                className={isWatchlisted ? "bg-green-600 hover:bg-green-700 border-transparent" : ""}
                            >
                                {isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
                            </Button>

                            <Button
                                variant="secondary"
                                size="lg"
                                icon={isSeen ? <Check className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                                onClick={handleSeen}
                                className={isSeen ? "bg-blue-600 hover:bg-blue-700 border-transparent" : ""}
                            >
                                {isSeen ? 'Seen' : 'Mark Seen'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Content */}
            <div className="px-6 md:px-12 py-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Left Column: Cast & Crew */}
                <div className="lg:col-span-2 space-y-10">
                    <section>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-red-500 rounded-full" /> Top Cast
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {cast.slice(0, 8).map(person => (
                                <div
                                    key={person.id}
                                    onClick={() => navigate(`/person/${person.id}`)}
                                    className="group cursor-pointer bg-slate-900 rounded-xl p-3 hover:bg-slate-800 transition-colors"
                                >
                                    <div className="aspect-square rounded-full overflow-hidden mb-3 border-2 border-slate-700 group-hover:border-red-500 transition-colors">
                                        <Poster path={person.profile_path} className="w-full h-full object-cover" />
                                    </div>
                                    <h4 className="text-white font-bold text-sm truncate">{person.name}</h4>
                                    <p className="text-slate-500 text-xs truncate">{person.character}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Info & Providers */}
                <div className="space-y-8">
                    {/* Where to Watch */}
                    {watchProviders && (
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                            <h3 className="text-lg font-bold text-white mb-4">Where to Watch</h3>
                            {watchProviders.flatrate ? (
                                <div className="flex flex-wrap gap-3">
                                    {watchProviders.flatrate.map(provider => (
                                        <a
                                            key={provider.provider_id}
                                            href={watchProviders.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 rounded-lg overflow-hidden hover:scale-110 transition-transform shadow-lg"
                                            title={`Watch on ${provider.provider_name}`}
                                        >
                                            <img
                                                src={`${IMG_BASE_URL}/original${provider.logo_path}`}
                                                alt={provider.provider_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-sm">Not available for streaming in your region.</p>
                            )}
                            <a
                                href={watchProviders.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300"
                            >
                                View all options on TMDB <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}

                    {/* Facts */}
                    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
                        <h3 className="text-lg font-bold text-white mb-2">Movie Info</h3>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Status</span>
                            <span className="text-white">{movie.status}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Budget</span>
                            <span className="text-white">${(movie.budget / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Revenue</span>
                            <span className="text-white">${(movie.revenue / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Original Language</span>
                            <span className="text-white uppercase">{movie.original_language}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trailer Modal */}
            <Modal isOpen={showTrailer} onClose={() => setShowTrailer(false)}>
                {trailer && (
                    <div className="aspect-video w-full">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                            title="Trailer"
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
