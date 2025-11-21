import React from 'react';
import { Eye, Film, Trash2 } from 'lucide-react';
import Poster from '../components/ui/Poster';

const Seen = ({ seenHistory, onMovieClick, onRemove }) => (
    <div className="animate-fade-in-up pb-20 lg:pb-10 w-full max-w-5xl mx-auto">
        <div className="mb-8"><h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Eye className="w-8 h-8 text-green-500" /> Seen History</h2><p className="text-slate-400">Movies you've marked as watched.</p></div>
        {seenHistory.length === 0 ? (<div className="text-center text-slate-600 py-20"><Film className="w-16 h-16 mx-auto mb-4 opacity-20" /><p className="text-lg">You haven't marked any movies as seen yet.</p></div>) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {seenHistory.filter(m => typeof m === 'object').map(movie => (
                    <div key={movie.id} className="relative group bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-green-500/50 transition-all hover:-translate-y-1">
                        <div onClick={() => onMovieClick(movie.id)} className="cursor-pointer"><Poster path={movie.poster_path} size="w342" className="aspect-[2/3]" alt={movie.title} /><div className="p-3"><h4 className="text-sm font-bold text-white truncate">{movie.title}</h4><p className="text-xs text-slate-500 truncate">{movie.release_date?.split('-')[0]}</p></div></div>
                        <button onClick={(e) => { e.stopPropagation(); onRemove(movie.id); }} className="absolute top-2 right-2 bg-black/60 text-slate-300 p-1.5 rounded-full hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>
        )}
    </div>
);

export default Seen;
