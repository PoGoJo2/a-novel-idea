import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as catalogService from '../services/catalogService.js';
import * as goalService from '../services/goalService.js';
import { viewerZone } from '../utils/time.js';
import BookCarousel from '../components/BookCarousel.jsx';
import SearchFilters from '../components/SearchFilters.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

// Hand-picked favorites shown in the Top Recommended row (matched by title)
const TOP_PICKS = [
  'Pride and Prejudice', 'The Hobbit', 'Dune', 'And Then There Were None',
  'Frankenstein', 'Fahrenheit 451', 'A Wizard of Earthsea', 'The Time Machine',
];

export default function BrowsePage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ q: '', genre: '', day: '' });
  const [genres, setGenres] = useState([]);
  const [groups, setGroups] = useState([]);
  const [goals, setGoals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // The list of genres for the filter menu (loaded once)
  useEffect(() => {
    catalogService.getGenres().then((data) => setGenres(data.genres)).catch(() => {});
  }, []);

  // This week's reading goal for each group, shown on the book cards
  useEffect(() => {
    goalService.getCurrentGoals().then((data) => setGoals(data.goals)).catch(() => {});
  }, []);

  // Reload the groups whenever a filter changes (small delay while typing)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const timer = setTimeout(async () => {
      try {
        const data = await catalogService.getGroups({ ...filters, limit: 50 });
        if (!cancelled) setGroups(data.groups);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filters]);

  // Group the results by genre: { Fantasy: [...], Mystery: [...] }
  const byGenre = groups.reduce((acc, group) => {
    (acc[group.book.genre] = acc[group.book.genre] || []).push(group);
    return acc;
  }, {});

  // The Top Recommended row only shows when nobody is searching or filtering
  const noFilters = !filters.q && !filters.genre && filters.day === '';
  const topGroups = TOP_PICKS.map((title) => groups.find((g) => g.book.title === title)).filter(Boolean);

  return (
    <div>
      <p className="eyebrow">The journey</p>
      <h1>Find a book. Join its group.</h1>
      <hr className="rule" />

      <SearchFilters filters={filters} genres={genres} onChange={setFilters} />

      <ErrorMessage message={error} />
      {loading && <Loader text="Finding books..." />}

      {!loading && !error && groups.length === 0 && (
        <p className="empty">No groups match your search. Try a different word, genre, or day.</p>
      )}

      {!loading && !error && noFilters && topGroups.length >= 3 && (
        <BookCarousel title="Top Recommended" groups={topGroups} zone={viewerZone(user)} goals={goals} />
      )}

      {!loading &&
        Object.entries(byGenre).map(([genre, list]) => (
          <BookCarousel key={genre} title={genre} groups={list} zone={viewerZone(user)} goals={goals} />
        ))}
    </div>
  );
}
