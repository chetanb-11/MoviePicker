import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { IMG_BASE_URL } from '../services/api';
import MovieGridCard from '../components/movie/MovieGridCard';

const Collection = ({ api, watchlist, toggleWatchlist, seenHistory, markSeen, unmarkSeen }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [collection, setCollection] = useState(null);

    useEffect(() => { api.getCollection(id).then(setCollection).catch(console.error); }, [id, api]);

    if (!collection) return <div className="flex justify-center p-10"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

    const onMovieClick = (movieId) => navigate(`/movie/${movieId}`);

    return (
        <div className="animate-fade-in-up pb-20">
            <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white"><ChevronLeft className="w-4 h-4" /> Back</button>
            <div className="relative rounded-2xl overflow-hidden mb-8 border border-slate-800"><img src={`${IMG_BASE_URL}/original${collection.backdrop_path}`} className="w-full h-64 object-cover opacity-60" alt="" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" /><div className="absolute bottom-8 left-8"><h1 className="text-4xl font-bold text-white mb-2">{collection.name}</h1><p className="text-slate-300 max-w-xl text-sm">{collection.overview}</p></div></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">{collection.parts.sort((a, b) => new Date(a.release_date) - new Date(b.release_date)).map(movie => { const isSeen = seenHistory.some(m => typeof m === 'object' ? m.id === movie.id : m === movie.id); return (<MovieGridCard key={movie.id} movie={movie} onClick={onMovieClick} toggleWatchlist={toggleWatchlist} isWatchlisted={watchlist.some(m => m.id === movie.id)} toggleSeen={() => isSeen ? unmarkSeen(movie.id) : markSeen(movie)} isSeen={isSeen} />); })}</div>
        </div>
    );
};

export default Collection;
