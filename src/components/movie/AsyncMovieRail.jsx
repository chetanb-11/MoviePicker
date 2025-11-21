import React, { useState, useEffect, useCallback } from 'react';
import { WifiOff, RefreshCw, Plus } from 'lucide-react';
import MovieGridCard from './MovieGridCard';

const AsyncMovieRail = ({ title, icon: Icon, fetchFn, onMovieClick, watchlist, toggleWatchlist, seenHistory, markSeen, unmarkSeen }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadData = useCallback(async (pageNum = 1) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        setError(false);
        try {
            const data = await fetchFn(pageNum);
            const newMovies = data.results || [];

            setMovies(prev => pageNum === 1 ? newMovies : [...prev, ...newMovies]);
            setHasMore(data.page < data.total_pages);
            setLoading(false);
            setLoadingMore(false);
        } catch (err) {
            setError(true);
            setLoading(false);
            setLoadingMore(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        loadData(1);
    }, [loadData]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadData(nextPage);
    };

    if (!loading && !error && movies.length === 0) return null;

    return (
        <div className="mb-10 animate-fade-in-up">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 px-1">
                {Icon && <Icon className="w-5 h-5 text-red-500" />} {title}
            </h3>

            {error && page === 1 ? (
                <div className="flex flex-col items-center justify-center h-40 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed mx-1">
                    <WifiOff className="w-8 h-8 text-slate-600 mb-2" />
                    <p className="text-slate-500 text-sm mb-3">Connection failed (Check Network)</p>
                    <button
                        onClick={() => loadData(1)}
                        className="flex items-center gap-2 text-xs bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition-colors shadow-lg shadow-red-900/20"
                    >
                        <RefreshCw className="w-3 h-3" /> Retry Loading
                    </button>
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar scroll-pl-4 min-h-[240px] px-1 items-stretch">
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] flex-shrink-0 animate-pulse">
                                <div className="bg-slate-800 rounded-xl aspect-[2/3] mb-3"></div>
                                <div className="h-4 bg-slate-800 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                            </div>
                        ))
                    ) : (
                        <>
                            {movies.map(m => {
                                const isSeen = seenHistory.some(seen => typeof seen === 'object' ? seen.id === m.id : seen === m.id);
                                return (
                                    <MovieGridCard
                                        key={m.id}
                                        movie={m}
                                        onClick={onMovieClick}
                                        toggleWatchlist={toggleWatchlist}
                                        isWatchlisted={watchlist.some(w => w.id === m.id)}
                                        toggleSeen={() => isSeen ? unmarkSeen(m.id) : markSeen(m)}
                                        isSeen={isSeen}
                                        className="min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px]"
                                    />
                                );
                            })}
                            {hasMore && (
                                <div className="min-w-[100px] flex items-center justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="group flex flex-col items-center justify-center gap-2 w-full h-full rounded-xl border-2 border-dashed border-slate-700 hover:border-red-500 hover:bg-red-500/10 transition-all p-4 min-h-[200px]"
                                    >
                                        <div className={`p-3 rounded-full bg-slate-800 group-hover:bg-red-500 transition-colors ${loadingMore ? 'animate-spin' : ''}`}>
                                            {loadingMore ? <RefreshCw className="w-6 h-6 text-slate-400 group-hover:text-white" /> : <Plus className="w-6 h-6 text-slate-400 group-hover:text-white" />}
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 group-hover:text-red-400 uppercase tracking-wider">
                                            {loadingMore ? 'Loading...' : 'Load More'}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AsyncMovieRail;
