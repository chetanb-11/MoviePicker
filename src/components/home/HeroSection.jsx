import React from 'react';
import { Play, Info } from 'lucide-react';
import { IMG_BASE_URL } from '../../services/api';
import Button from '../ui/Button';

const HeroSection = ({ movie, onPlay, onMoreInfo }) => {
    if (!movie) return (
        <div className="w-full h-[70vh] bg-slate-900 animate-pulse" />
    );

    return (
        <div className="relative w-full h-[85vh] overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={`${IMG_BASE_URL}/original${movie.backdrop_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
                {/* Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20 pb-20 z-10 flex flex-col items-start max-w-4xl animate-slide-up">

                {/* Metadata Badges */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Featured</span>
                    <span className="text-slate-300 text-sm font-medium border border-slate-600 px-2 py-0.5 rounded">
                        {movie.release_date?.split('-')[0]}
                    </span>
                    <span className="text-amber-400 text-sm font-bold flex items-center gap-1">
                        ★ {movie.vote_average?.toFixed(1)}
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                    {movie.title}
                </h1>

                {/* Overview */}
                <p className="text-slate-200 text-base md:text-lg line-clamp-3 max-w-2xl mb-8 drop-shadow-md leading-relaxed">
                    {movie.overview}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-4">
                    <Button
                        variant="primary"
                        size="lg"
                        icon={<Play className="w-5 h-5 fill-current" />}
                        onClick={() => onPlay(movie)}
                    >
                        Watch Trailer
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        icon={<Info className="w-5 h-5" />}
                        onClick={() => onMoreInfo(movie.id)}
                        className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20"
                    >
                        More Info
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
