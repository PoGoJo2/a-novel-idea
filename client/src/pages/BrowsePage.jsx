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

// Genre rows always appear in this order, one under another
const GENRE_ORDER = ['Mystery', 'Fantasy', 'Classics', 'Science Fiction', 'Horror', 'Romance', 'Thriller / Action', 'True Crime', 'Autobiography', 'Self Help / Personal Development'];
const genreRank = (genre) => (GENRE_ORDER.includes(genre) ? GENRE_ORDER.indexOf(genre) : GENRE_ORDER.length);

export default function BrowsePage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ q: '', genre: '', day: '' });
  const [genres, setGenres] = useState([]);
  const [groups, setGroups] = useState([]);
  const [goals, setGoals] = useState({});
  const [status, setStatus] = useState(null); // { soon: Set, started: Set, needsLeader: Set } (null until loaded)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // The list of genres for the filter menu (loaded once)
  useEffect(() => {
    catalogService.getGenres().then((data) => setGenres(data.genres)).catch(() => {});
  }, []);

  // Every group is shown. Some are greyed out: "coming soon" (the leader has not set the weekly plan yet) and
  // "started" (week 3 or later, so joining is closed)
  useEffect(() => {
    goalService.getBrowsable()
      .then((data) => setStatus({ soon: new Set(data.comingSoon), started: new Set(data.started), needsLeader: new Set(data.needsLeader || []) }))
      .catch(() => {});
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
        // The server sends at most 50 groups at a time, so keep asking until every page has arrived
        const first = await catalogService.getGroups({ ...filters, limit: 50, page: 1 });
        let all = first.groups;
        for (let page = 2; page <= (first.totalPages || 1); page += 1) {
          const more = await catalogService.getGroups({ ...filters, limit: 50, page });
          all = all.concat(more.groups);
        }
        if (!cancelled) setGroups(all);
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
  const shown = groups;
  const soon = status ? status.soon : new Set();
  const started = status ? status.started : new Set();
  const needsLeader = status ? status.needsLeader : new Set();
  const byGenre = shown.reduce((acc, group) => {
    (acc[group.book.genre] = acc[group.book.genre] || []).push(group);
    return acc;
  }, {});

  // The Top Recommended row only shows when nobody is searching or filtering
  const noFilters = !filters.q && !filters.genre && filters.day === '';
  const topGroups = TOP_PICKS.map((title) => shown.find((g) => g.book.title === title && !soon.has(String(g.id)) && !started.has(String(g.id)) && !needsLeader.has(String(g.id)))).filter(Boolean);

  return (
    <div>
      <p className="eyebrow">The journey</p>
      <h1>Find a book. Join its group.</h1>
      <hr className="rule" />

      <SearchFilters filters={filters} genres={genres} onChange={setFilters} />

      <ErrorMessage message={error} />
      {loading && <Loader text="Finding books..." />}

      {!loading && !error && shown.length === 0 && (
        <p className="empty">No groups match your search. Try a different word, genre, or day.</p>
      )}

      {!loading && !error && noFilters && topGroups.length >= 3 && (
        <BookCarousel title="Top Recommended" groups={topGroups} zone={viewerZone(user)} goals={goals} soon={soon} started={started} needsLeader={needsLeader} />
      )}

      {!loading &&
        Object.entries(byGenre).sort(([a], [b]) => genreRank(a) - genreRank(b)).map(([genre, list]) => (
          <BookCarousel key={genre} title={genre} groups={list} zone={viewerZone(user)} goals={goals} soon={soon} started={started} needsLeader={needsLeader} />
        ))}
    </div>
  );
}
