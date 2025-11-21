import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import WatchlistDrawer from './WatchlistDrawer';

const Layout = ({ watchlist, setWatchlist }) => {
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const onMovieClick = (id) => {
        navigate(`/movie/${id}`);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col lg:flex-row">
            <WatchlistDrawer
                isOpen={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
                watchlist={watchlist}
                onRemove={(id) => setWatchlist(watchlist.filter(m => m.id !== id))}
                onMovieClick={onMovieClick}
            />
            <Sidebar watchlistCount={watchlist.length} onOpenDrawer={() => setDrawerOpen(true)} />
            <main className="flex-1 p-4 lg:p-8 overflow-y-auto min-h-screen lg:h-screen custom-scrollbar min-w-0">
                <Outlet />
            </main>
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.5); border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(71, 85, 105, 0.8); } .text-shadow { text-shadow: 0 2px 10px rgba(0,0,0,0.8); } @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } } .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; } .animate-slide-in-right { animation: slideInRight 0.3s ease-out forwards; }`}</style>
        </div>
    );
};

export default Layout;
