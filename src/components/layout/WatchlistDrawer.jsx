import React from 'react';
import { Heart, X, Film, Trash2 } from 'lucide-react';
import Poster from '../ui/Poster';

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

export default WatchlistDrawer;
