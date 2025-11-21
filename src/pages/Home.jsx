import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import AsyncMovieRail from '../components/movie/AsyncMovieRail';
import Modal from '../components/ui/Modal';
import { TrendingUp, Star, Film, Clock, Flame } from 'lucide-react';

const Home = ({ api, watchlist, toggleWatchlist, seenHistory, markSeen, unmarkSeen }) => {
    const navigate = useNavigate();
    const [featuredMovie, setFeaturedMovie] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerKey, setTrailerKey] = useState(null);

    useEffect(() => {
        // Fetch trending movies for the hero section
        api.getTrending().then(data => {
            if (data.results && data.results.length > 0) {
                const random = data.results[Math.floor(Math.random() * 5)]; // Pick one of top 5
                setFeaturedMovie(random);

                // Pre-fetch trailer for hero
                api.getMovie(random.id).then(detail => {
                    const trailer = detail.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
                    if (trailer) setTrailerKey(trailer.key);
                });
            }
        });
    }, [api]);

    const handlePlayTrailer = (movie) => {
        if (trailerKey) setShowTrailer(true);
        else navigate(`/movie/${movie.id}`);
    };

    const handleMoreInfo = (id) => {
        navigate(`/movie/${id}`);
    };

    return (
        <div className="pb-20 bg-background min-h-screen text-text-primary font-sans">
            <HeroSection
                movie={featuredMovie}
                onPlay={handlePlayTrailer}
                onMoreInfo={handleMoreInfo}
            />

            <div className="relative z-20 -mt-20 px-4 md:px-8 space-y-8">
                <AsyncMovieRail
                    title="Trending Now"
                    icon={Flame}
                    fetchFn={(page) => api.getTrending(page)}
                    onMovieClick={handleMoreInfo}
                    watchlist={watchlist}
                    toggleWatchlist={toggleWatchlist}
                    seenHistory={seenHistory}
                    markSeen={markSeen}
                    unmarkSeen={unmarkSeen}
                />

                <AsyncMovieRail
                    title="Top Rated Gems"
                    icon={Star}
                    fetchFn={(page) => api.getTopRated(page)}
                    onMovieClick={handleMoreInfo}
                    watchlist={watchlist}
                    toggleWatchlist={toggleWatchlist}
                    seenHistory={seenHistory}
                    markSeen={markSeen}
                    unmarkSeen={unmarkSeen}
                />

                <AsyncMovieRail
                    title="Action Packed"
                    icon={Film}
                    fetchFn={(page) => api.discoverMovie({ with_genres: 28, page })}
                    onMovieClick={handleMoreInfo}
                    watchlist={watchlist}
                    toggleWatchlist={toggleWatchlist}
                    seenHistory={seenHistory}
                    markSeen={markSeen}
                    unmarkSeen={unmarkSeen}
                />

                <AsyncMovieRail
                    title="Comedy Hits"
                    icon={TrendingUp}
                    fetchFn={(page) => api.discoverMovie({ with_genres: 35, page })}
                    onMovieClick={handleMoreInfo}
                    watchlist={watchlist}
                    toggleWatchlist={toggleWatchlist}
                    seenHistory={seenHistory}
                    markSeen={markSeen}
                    unmarkSeen={unmarkSeen}
                />
            </div>

            {/* Trailer Modal for Hero */}
            <Modal isOpen={showTrailer} onClose={() => setShowTrailer(false)}>
                {trailerKey && (
                    <div className="aspect-video w-full">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                            title="Trailer"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Home;
