import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as profiles from '../services/profileService.js';
import LeaderAvatar from '../components/LeaderAvatar.jsx';
import LeadersFrame from '../components/LeadersFrame.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

// Page: who leads the reading groups, their background and the books they love.
export default function LeadersPage() {
  const [leaders, setLeaders] = useState(null);
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const [more, setMore] = useState({ up: false, down: false });

  // Shows the "scroll for more" hints only when some leaders are out of view
  const checkScroll = () => {
    const el = listRef.current;
    if (!el) return;
    setMore({ up: el.scrollTop > 24, down: el.scrollTop + el.clientHeight < el.scrollHeight - 24 });
  };
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [leaders]);

  useEffect(() => {
    profiles.getLeaders().then((d) => setLeaders(d.leaders)).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="leaders-page">
      <p className="eyebrow">Our guides</p>
      <h1>Meet the Leaders</h1>
      <hr className="rule" />
      <p className="muted">Every reading group has a leader who plans the weekly chapters, guides the talk, and offers one-on-one help. Click a leader to see their profile and classes.</p>
      <ErrorMessage message={error} />
      {!leaders && !error && <Loader text="Finding our leaders..." />}

      <LeadersFrame>
      {more.up && <p className="lc-scroll-hint up" aria-hidden="true">▲ More leaders above</p>}
      <div className="leader-cards leader-scroll" ref={listRef} onScroll={checkScroll} tabIndex={0} aria-label="Leaders (scroll to see more)">
        {(leaders || []).map((l) => (
          <Link key={l.id} to={`/leaders/${l.id}`} className="leader-card leader-tile-link" aria-label={`Open ${l.name}'s profile`}>
            <LeaderAvatar name={l.name} photo={l.photo} />
            <h2>{l.name}</h2>
            {l.bio ? <p className="lc-bio lc-clamp">{l.bio}</p> : <p className="muted small">This leader hasn’t written a bio yet.</p>}
            {l.interests.length > 0 && (
              <div className="lc-tags">{l.interests.map((g) => <span key={g} className="tag">{g}</span>)}</div>
            )}
            <footer className="lc-foot">
              <span className="muted small">
                {l.leading.length > 0 ? `Leading ${l.leading.length} class${l.leading.length === 1 ? '' : 'es'}` : 'Not leading a group right now'}
              </span>
              <span className="lc-open">View profile →</span>
            </footer>
          </Link>
        ))}
      </div>
      {more.down && <p className="lc-scroll-hint" aria-hidden="true">Scroll to see more leaders ▼</p>}
      </LeadersFrame>
    </div>
  );
}
