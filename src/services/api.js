const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const createApi = (apiKey) => {
  
  // Smart Fetcher: Tries multiple ways to get data to bypass ISP blocks
  const fetchWithFallback = async (endpoint, params = {}) => {
    if (!apiKey) throw new Error("API Key missing");

    // 1. Prepare the Target URL
    const urlObj = new URL(`${TMDB_BASE_URL}${endpoint}`);
    urlObj.searchParams.append('api_key', apiKey);
    Object.keys(params).forEach(key => urlObj.searchParams.append(key, params[key]));
    const targetUrl = urlObj.toString();

    // 2. Define Strategies (Priority Order)
    const strategies = [
      // Strategy A: Direct Connection (Fastest, works on Wi-Fi)
      { name: 'Direct', url: targetUrl }, 
      // Strategy B: Primary Proxy (Bypasses simple DNS blocks)
      { name: 'Proxy A', url: `https://corsproxy.io/?${encodeURIComponent(targetUrl)}` },
      // Strategy C: Secondary Proxy (Backup if Proxy A is down/blocked)
      { name: 'Proxy B', url: `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}` }
    ];

    let lastError;

    // 3. Attempt each strategy sequentially
    for (const strategy of strategies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout per try

        const res = await fetch(strategy.url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          return await res.json();
        }
        
        // If unauthorized (401), the key is wrong, don't retry other proxies
        if (res.status === 401) throw new Error("Invalid API Key");

      } catch (error) {
        // console.warn(`Strategy ${strategy.name} failed:`, error);
        lastError = error;
        // Loop continues to next strategy...
      }
    }

    // If we get here, all strategies failed
    console.error(`All connection strategies failed for ${endpoint}`);
    throw lastError || new Error("Network connection failed");
  };

  return {
    getGenres: () => fetchWithFallback('/genre/movie/list'),
    discoverMovie: (params) => fetchWithFallback('/discover/movie', params),
    getMovie: (id) => fetchWithFallback(`/movie/${id}`, { 
      append_to_response: 'images,credits,external_ids,watch/providers,videos,recommendations' 
    }),
    searchMovie: (query, page=1) => fetchWithFallback('/search/movie', { query, page }),
    searchPerson: (query, page=1) => fetchWithFallback('/search/person', { query, page }),
    getPerson: (id) => fetchWithFallback(`/person/${id}`, { append_to_response: 'movie_credits,images' }),
    
    getTrending: (timeWindow = 'day') => fetchWithFallback(`/trending/movie/${timeWindow}`),
    getNowPlaying: (page=1) => fetchWithFallback('/movie/now_playing', { page }),
    getUpcoming: (page=1) => fetchWithFallback('/movie/upcoming', { page, region: 'US' }),
    
    getTopRatedIndia: () => fetchWithFallback('/discover/movie', { 
      region: 'IN', sort_by: 'vote_average.desc', 'vote_count.gte': 200,
      'primary_release_date.gte': new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]
    }),
    getTopRated: () => fetchWithFallback('/movie/top_rated', { page: 1 }),
    getActionMovies: () => fetchWithFallback('/discover/movie', { with_genres: 28, sort_by: 'popularity.desc' }),
    getComedyMovies: () => fetchWithFallback('/discover/movie', { with_genres: 35, sort_by: 'popularity.desc' }),
    getHorrorMovies: () => fetchWithFallback('/discover/movie', { with_genres: 27, sort_by: 'popularity.desc' }),

    getCollection: (id) => fetchWithFallback(`/collection/${id}`),
  };
};

export const IMG_BASE_URL = 'https://image.tmdb.org/t/p';
