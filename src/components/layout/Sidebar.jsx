import React from 'react';
import { Film, TrendingUp, Search, Shuffle, History, Heart, Compass } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const NavItem = ({ icon: Icon, label, to }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `flex flex-col lg:flex-row items-center lg:gap-3 p-2 lg:px-4 lg:py-3 rounded-xl transition-all ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
    >
        <Icon className="w-6 h-6 lg:w-5 lg:h-5" />
        <span className="text-[10px] lg:text-sm font-medium mt-1 lg:mt-0">{label}</span>
    </NavLink>
);

const Sidebar = ({ watchlistCount, onOpenDrawer }) => {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 z-50 lg:static lg:w-64 lg:h-screen lg:border-r lg:border-t-0 lg:flex lg:flex-col p-2 lg:p-6">
            <div className="hidden lg:flex items-center gap-3 mb-10 px-2">
                <div className="bg-red-600 p-2 rounded-lg">
                    <Film className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">Bucky<span className="text-red-500">Verse</span></h1>
            </div>
            <nav className="flex lg:flex-col justify-around lg:justify-start gap-1 lg:gap-2 w-full">
                <NavItem icon={TrendingUp} label="Home" to="/" />
                <NavItem icon={Compass} label="Discover" to="/discover" />
                <NavItem icon={Search} label="Search" to="/search" />
                <NavItem icon={Shuffle} label="Surprise Me" to="/surprise" />
                <NavItem icon={History} label="Seen It" to="/seen" />
                <button onClick={onOpenDrawer} className="flex flex-col lg:flex-row items-center lg:gap-3 p-2 lg:px-4 lg:py-3 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white lg:mt-auto">
                    <Heart className="w-6 h-6 lg:w-5 lg:h-5" />
                    <span className="text-[10px] lg:text-sm font-medium mt-1 lg:mt-0">Watchlist ({watchlistCount})</span>
                </button>
            </nav>
        </div>
    );
};

export default Sidebar;
