import React, { useEffect, useState } from 'react';
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMBD_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        authorization: `Bearer ${API_KEY}`,
    },
};

const App = () => {
    const [SearchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [isloading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useDebounce(() => setDebouncedSearchTerm(SearchTerm), 500, [SearchTerm]);

    const fetchMovies = async (query) => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error('No se pudieron obtener las películas');
            }

            const data = await response.json();

            if (data.Response === 'False') {
                setErrorMessage(data.Error || 'No se pudieron obtener las películas');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);

            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }
        } catch (error) {
            console.error(`No se pudieron obtener las películas: ${error}`);
            setErrorMessage(`No se pudieron obtener las películas. Por favor, inténtelo de nuevo más tarde..`);
        } finally {
            setIsLoading(false);
        }
    };

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        } catch (error) {
            console.error(`No se pudieron obtener las películas: ${error}`);
        }
    };

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main>
            <div className="pattern" />

            <div className="wrapper">
                <header>
                    <img className="logo" src="../public/logo.png" alt="Logo" />
                    <img src="./hero.png" alt="Hero Banner" />
                    <h1 className="text-white text-5xl font-extrabold text-center">
                        Encuentra <span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text">Películas</span> que disfrutarás sin complicaciones
                    </h1>
                    <Search SearchTerm={SearchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2 className="text-transparent bg-gradient-to-r from-blue-300 to-cyan-400 bg-clip-text font-extrabold text-4xl">
                            Películas más populares
                        </h2>
                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="all-movies">
                    <h2 className="text-transparent bg-gradient-to-r from-purple-300 to-pink-500 bg-clip-text font-extrabold text-4xl">
                        Todas Las Películas
                    </h2>
                    {isloading ? (
                        <Spinner />
                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
};

export default App;