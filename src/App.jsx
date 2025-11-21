import React, { useMemo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { createApi } from './services/api';
import { useLocalStorage } from './hooks/useLocalStorage';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import SurpriseMe from './pages/SurpriseMe';
import Seen from './pages/Seen';
import MovieDetail from './pages/MovieDetail';
import PersonDetail from './pages/PersonDetail';
import Collection from './pages/Collection';
import Discover from './pages/Discover';

export default function App() {
  const tmdbKey = import.meta.env.VITE_TMDB_API_KEY;
  const api = useMemo(() => createApi(tmdbKey), [tmdbKey]);
  const [watchlist, setWatchlist] = useLocalStorage('movie-picker-watchlist', []);
  const [seenHistory, setSeenHistory] = useLocalStorage('movie-picker-seen', []);
  const navigate = useNavigate();

  const toggleWatchlist = (movie) => {
    const exists = watchlist.find(m => m.id === movie.id);
    if (exists) setWatchlist(watchlist.filter(m => m.id !== movie.id));
    else setWatchlist([...watchlist, movie]);
  };

  const markSeen = (movie) => {
    const isAlreadySeen = seenHistory.some(m => typeof m === 'object' ? m.id === movie.id : m === movie.id);
    if (!isAlreadySeen) { setSeenHistory([...seenHistory, movie]); }
  };

  const unmarkSeen = (id) => {
    setSeenHistory(seenHistory.filter(m => typeof m === 'object' ? m.id !== id : m !== id));
  };

  const onMovieClick = (id) => navigate(`/movie/${id}`);
  const onPersonClick = (id) => navigate(`/person/${id}`);

  return (
    <Routes>
      <Route path="/" element={<Layout watchlist={watchlist} setWatchlist={setWatchlist} />}>
        <Route index element={
          <Home
            api={api}
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
            seenHistory={seenHistory}
            markSeen={markSeen}
            unmarkSeen={unmarkSeen}
            onMovieClick={onMovieClick}
          />
        } />
        <Route path="search" element={
          <Search
            api={api}
            onMovieClick={onMovieClick}
            onPersonClick={onPersonClick}
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
            seenHistory={seenHistory}
            markSeen={markSeen}
            unmarkSeen={unmarkSeen}
          />
        } />
        <Route path="discover" element={
          <Discover
            api={api}
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
            seenHistory={seenHistory}
            markSeen={markSeen}
            unmarkSeen={unmarkSeen}
            onMovieClick={onMovieClick}
          />
        } />
        <Route path="surprise" element={
          <SurpriseMe
            api={api}
            onMovieClick={onMovieClick}
            seenHistory={seenHistory}
            markSeen={markSeen}
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
          />
        } />
        <Route path="seen" element={
          <Seen
            seenHistory={seenHistory}
            onMovieClick={onMovieClick}
            onRemove={unmarkSeen}
          />
        } />
        <Route path="movie/:id" element={
          <MovieDetail
            api={api}
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
            seenHistory={seenHistory}
            markSeen={markSeen}
            unmarkSeen={unmarkSeen}
          />
        } />
        <Route path="person/:id" element={<PersonDetail api={api} />} />
        <Route path="collection/:id" element={
          <Collection
            api={api}
            watchlist={watchlist}
            toggleWatchlist={toggleWatchlist}
            seenHistory={seenHistory}
            markSeen={markSeen}
            unmarkSeen={unmarkSeen}
          />
        } />
      </Route>
    </Routes>
  );
}