import React from 'react';
import { Heart, Eye, EyeOff, Star } from 'lucide-react';
import Poster from '../ui/Poster';

const MovieGridCard = ({ movie, onClick, toggleWatchlist, isWatchlisted, toggleSeen, isSeen, className = "" }) => (
    <div className={`group relative flex-shrink-0 cursor-pointer ${className}`}>
        <div onClick={() => onClick(movie.id)} className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
            <Poster path={movie.poster_path} size="w500" className="aspect-[2/3] transition-transform duration-300 group-hover:scale-105" alt={movie.title} />

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); toggleWatchlist(movie); }}
                    className={`p-2 rounded-full backdrop-blur-md shadow-lg border border-white/10 transition-all hover:scale-110 active:scale-95
            ${isWatchlisted ? 'bg-red-600 text-white' : 'bg-black/60 text-white hover:bg-red-600'}`}
                >
                    <Heart className={`w-4 h-4 ${isWatchlisted ? 'fill-current' : ''}`} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); toggleSeen(movie); }}
                    className={`p-2 rounded-full backdrop-blur-md shadow-lg border border-white/10 transition-all hover:scale-110 active:scale-95
            ${isSeen ? 'bg-green-600 text-white' : 'bg-black/60 text-white hover:bg-green-600'}`}
                >
                    {isSeen ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
            </div>

            {isSeen && (
                <div className="absolute top-2 left-2 bg-green-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg border border-green-400/30">
                    SEEN
                </div>
            )}
        </div>

        <div className="mt-2 px-1" onClick={() => onClick(movie.id)}>
            <h4 className="text-sm font-medium text-slate-200 line-clamp-1 group-hover:text-white transition-colors">{movie.title}</h4>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                    <Star className="w-3 h-3 fill-current" /> {movie.vote_average?.toFixed(1)}
                </span>
            </div>
        </div>
    </div>
);

export default MovieGridCard;
