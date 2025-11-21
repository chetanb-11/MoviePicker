import React, { useMemo } from 'react';
import { TrendingUp, Ticket, Trophy, Clock, Calendar, Sword, Smile, Ghost } from 'lucide-react';
import AsyncMovieRail from '../components/movie/AsyncMovieRail';

const Home = ({ api, watchlist, toggleWatchlist, seenHistory, markSeen, unmarkSeen, onMovieClick }) => {
    const rails = useMemo(() => [
        { title: 'Trending Today', icon: TrendingUp, fetch: () => api.getTrending('day') },
        { title: 'Now In Theaters', icon: Ticket, fetch: () => api.getNowPlaying() },
        { title: 'All-Time Top Rated', icon: Trophy, fetch: () => api.getTopRated() },
        { title: 'Top Rated in India', icon: Clock, fetch: () => api.getTopRatedIndia() },
        { title: 'Coming Soon', icon: Calendar, fetch: () => api.getUpcoming() },
        { title: 'Action Packed', icon: Sword, fetch: () => api.getActionMovies() },
        { title: 'Laugh Out Loud', icon: Smile, fetch: () => api.getComedyMovies() },
        { title: 'Scares & Thrills', icon: Ghost, fetch: () => api.getHorrorMovies() }
    ], [api]);

    return (
        <div className="animate-fade-in-up pb-20 lg:pb-10">
            {rails.map(rail => (
                <AsyncMovieRail
                    key={rail.title}
                    title={rail.title}
                    icon={rail.icon}
                    fetchFn={rail.fetch}
                    onMovieClick={onMovieClick}
                    watchlist={watchlist}
                    toggleWatchlist={toggleWatchlist}
                    seenHistory={seenHistory}
                    markSeen={markSeen}
                    unmarkSeen={unmarkSeen}
                />
            ))}
        </div>
    );
};

export default Home;
