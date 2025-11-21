import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, Calendar, Star, Film } from 'lucide-react';
import Poster from '../components/ui/Poster';

const PersonDetail = ({ api }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [person, setPerson] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getPerson(id).then(setPerson).catch(console.error).finally(() => setLoading(false));
    }, [id, api]);

    if (loading) return <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
    if (!person) return null;

    const sortedCredits = person.movie_credits?.cast?.sort((a, b) => b.popularity - a.popularity) || [];
    const timelineCredits = person.movie_credits?.cast
        ?.filter(m => m.release_date)
        ?.sort((a, b) => new Date(b.release_date) - new Date(a.release_date)) || [];

    const onMovieClick = (movieId) => navigate(`/movie/${movieId}`);

    // Calculate career stats
    const totalMovies = person.movie_credits?.cast?.length || 0;
    const avgRating = (person.movie_credits?.cast?.reduce((acc, m) => acc + m.vote_average, 0) / totalMovies).toFixed(1);
    const knownForGenre = person.movie_credits?.cast?.reduce((acc, m) => {
        m.genre_ids?.forEach(id => acc[id] = (acc[id] || 0) + 1);
        return acc;
    }, {});
    const topGenreId = Object.keys(knownForGenre || {}).sort((a, b) => knownForGenre[b] - knownForGenre[a])[0];

    return (
        <div className="animate-fade-in-up pb-20 lg:pb-10">
            <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white sticky top-0 bg-slate-950/80 p-2 rounded z-20 backdrop-blur w-fit"><ChevronLeft className="w-4 h-4" /> Back</button>

            <div className="flex flex-col md:flex-row gap-8 mb-12">
                {/* Sidebar Info */}
                <div className="w-full md:w-72 flex-shrink-0">
                    <Poster path={person.profile_path} size="h632" className="rounded-xl shadow-2xl aspect-[2/3] mb-6" alt={person.name} />

                    <div className="space-y-4">
                        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                            <h3 className="text-slate-400 text-xs font-bold uppercase mb-4 flex items-center gap-2"><Star className="w-3 h-3" /> Career Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-2xl font-bold text-white">{totalMovies}</div>
                                    <div className="text-[10px] text-slate-400 uppercase">Movies</div>
                                </div>
                                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-2xl font-bold text-amber-400">{isNaN(avgRating) ? 'N/A' : avgRating}</div>
                                    <div className="text-[10px] text-slate-400 uppercase">Avg Rating</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                            <h3 className="text-slate-400 text-xs font-bold uppercase mb-4">Personal Info</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">Known For</span>
                                    <span className="text-white font-medium">{person.known_for_department}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">Gender</span>
                                    <span className="text-white font-medium">{person.gender === 1 ? 'Female' : 'Male'}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-800 pb-2">
                                    <span className="text-slate-500">Birthday</span>
                                    <span className="text-white font-medium">{person.birthday || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Place of Birth</span>
                                    <span className="text-white font-medium text-right w-1/2">{person.place_of_birth || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{person.name}</h1>

                    {person.biography && (
                        <div className="mb-10">
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span> Biography
                            </h3>
                            <p className="text-slate-300 leading-relaxed text-base whitespace-pre-line max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                                {person.biography}
                            </p>
                        </div>
                    )}

                    {/* Known For */}
                    <div className="mb-12">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Film className="w-5 h-5 text-blue-500" /> Known For
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar">
                            {sortedCredits.slice(0, 10).map(movie => (
                                <div key={movie.id} onClick={() => onMovieClick(movie.id)} className="min-w-[140px] w-[140px] cursor-pointer group">
                                    <Poster path={movie.poster_path} size="w342" className="rounded-lg aspect-[2/3] mb-3 group-hover:ring-2 ring-blue-500 transition-all shadow-lg" alt={movie.title} />
                                    <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{movie.title}</h4>
                                    <p className="text-xs text-slate-500 truncate">{movie.character}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Career Timeline */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-500" /> Career Timeline
                        </h3>
                        <div className="relative border-l-2 border-slate-800 ml-3 space-y-8 pb-10">
                            {timelineCredits.slice(0, 20).map((movie, index) => (
                                <div key={`${movie.id}-${index}`} className="relative pl-8 group cursor-pointer" onClick={() => onMovieClick(movie.id)}>
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 group-hover:border-purple-500 group-hover:bg-purple-500 transition-all"></div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 hover:border-purple-500/30 hover:bg-slate-800 transition-all">
                                        <span className="text-purple-400 font-mono font-bold text-sm min-w-[50px]">{movie.release_date?.split('-')[0]}</span>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-bold truncate group-hover:text-purple-400 transition-colors">{movie.title}</h4>
                                            <p className="text-sm text-slate-500 truncate">{movie.character ? `as ${movie.character}` : 'Cast'}</p>
                                        </div>
                                        {movie.vote_average > 0 && (
                                            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-1 rounded-full">
                                                <Star className="w-3 h-3 fill-current" /> {movie.vote_average.toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {timelineCredits.length > 20 && (
                                <div className="pl-8 pt-2">
                                    <p className="text-slate-500 text-sm italic">...and {timelineCredits.length - 20} more movies</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonDetail;
