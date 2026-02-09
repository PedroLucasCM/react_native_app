export const TMDB_CONFIG = {
  BASE_URL: "https://api.themoviedb.org/3",
  API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
  },
};

export const fetchMovies = async ({
  query,
}: {
  query: string;
}): Promise<Movie[]> => {
  const endpoint = query
    ? `/search/movie?query=${encodeURIComponent(query)}`
    : "/discover/movie?sort_by=popularity.desc";

  const response = await fetch(`${TMDB_CONFIG.BASE_URL}${endpoint}`, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.statusText}`);
  }

  const text = await response.text();
  if (!text.trim()) {
    throw new Error("Empty response from movie API");
  }

  const data: { results: Movie[] } = JSON.parse(text);

  return data.results ?? [];
};

export const fetchTVshows = async ({ query }: { query: string }) => {
  const endpoint = query
    ? `${TMDB_CONFIG.BASE_URL}/search/tv?query=${encodeURIComponent(query)}`
    : `${TMDB_CONFIG.BASE_URL}/discover/tv?sort_by=popularity.desc`;

  const response = await fetch(`${TMDB_CONFIG.BASE_URL}${endpoint}`, {
    method: "GET",
    headers: TMDB_CONFIG.headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch movies: ${response.statusText}`);
  }

  const data = await response.json();

  return data.results;
};
