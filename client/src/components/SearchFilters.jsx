import { DAY_NAMES } from '../utils/time.js';

export default function SearchFilters({ filters, genres, onChange }) {
  const set = (field) => (event) => onChange({ ...filters, [field]: event.target.value });

  return (
    <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
      <div className="field grow">
        <label htmlFor="q">Search books or authors</label>
        <input id="q" type="search" value={filters.q} onChange={set('q')} placeholder="Try Hobbit or Austen" />
      </div>
      <div className="field">
        <label htmlFor="genre">Genre</label>
        <select id="genre" value={filters.genre} onChange={set('genre')}>
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="day">Meeting day</label>
        <select id="day" value={filters.day} onChange={set('day')}>
          <option value="">Any day</option>
          {DAY_NAMES.map((name, i) => (
            <option key={name} value={i}>{name}</option>
          ))}
        </select>
      </div>
    </form>
  );
}
