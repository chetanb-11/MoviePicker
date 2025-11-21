import React, { useState } from 'react';
import { Star, Heart, Eye, PlayCircle } from 'lucide-react';
import { IMG_BASE_URL } from '../../services/api';
import Poster from '../ui/Poster';

const MovieCard = ({ movie, onClick, onToggleWatchlist, onToggleSeen, isWatchlisted, isSeen }) => {
    const [isHovered, setIsHovered] = useState(false);

    if (!movie) return null;

    return (
        <div
            className="relative group w-[160px] md:w-[200px] flex-shrink-0 cursor-pointer transition-all duration-300 ease-out hover:z-10"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick(movie.id)}
        >
            {/* Main Card Container - Scales up on hover */}
            <div className={`relative rounded-xl overflow-hidden bg-slate-900 transition-all duration-300 ${isHovered ? 'scale-105 shadow-2xl shadow-black/50 ring-2 ring-slate-700' : ''}`}>

                {/* Poster Image */}
                <div className="aspect-[2/3] relative">
                    <Poster
                        path={movie.poster_path}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay (Always visible but stronger on hover) */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-60'}`} />

                    {/* Top Right Badges */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleWatchlist(movie); }}
                            className={`p-2 rounded-full backdrop-blur-md ${isWatchlisted ? 'bg-red-600 text-white' : 'bg-black/40 text-white hover:bg-white hover:text-black'}`}
                        >
                            <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleSeen(movie); }}
                            className={`p-2 rounded-full backdrop-blur-md ${isSeen ? 'bg-green-600 text-white' : 'bg-black/40 text-white hover:bg-white hover:text-black'}`}
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content Info */}
                <div className="absolute bottom-0 left-0 w-full p-3 md:p-4 transform transition-transform duration-300">
                    <h3 className="text-white font-bold text-sm md:text-base line-clamp-2 leading-tight mb-1 group-hover:text-red-400 transition-colors">
                        {movie.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                            <Star className="w-3 h-3 fill-current" />
                            {movie.vote_average?.toFixed(1)}
                        </span>
                        <span>{movie.release_date?.split('-')[0]}</span>
                    </div>

                    {/* Expanded Info on Hover */}
                    <div className={`overflow-hidden transition-all duration-300 ${isHovered ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                        <p className="text-[10px] text-slate-300 line-clamp-2 mb-2">
                            {movie.overview}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-white uppercase tracking-wider">
                            <PlayCircle className="w-3 h-3 text-red-500" /> Click to details
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
