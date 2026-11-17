import { useNavigate, useLocation } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext.jsx';

const Heart = ({ on }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
    <path d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" />
  </svg>
);
const Mark = ({ on }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
    <path d="M6 3h12v18l-6-4.5L6 21z" />
  </svg>
);

// Two buttons for one book: Favorite (heart) and Save for next time (bookmark).
// variant "icons" = small round buttons on a cover; "labeled" = buttons with words (book page).
export default function SaveButtons({ bookId, title = 'this book', variant = 'icons' }) {
  const { loggedIn, isFavorite, isSaved, toggleFavorite, toggleSaved } = useLibrary();
  const navigate = useNavigate();
  const location = useLocation();
  const fav = isFavorite(bookId);
  const sav = isSaved(bookId);

  // Not logged in: send the reader to log in, then back here
  const guard = (action) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) return navigate('/login', { state: { from: location } });
    return action(bookId);
  };

  if (variant === 'labeled') {
    return (
      <div className="save-row">
        <button type="button" className={`save-btn fav${fav ? ' on' : ''}`} aria-pressed={fav} onClick={guard(toggleFavorite)}>
          <Heart on={fav} /> {fav ? 'Favorited' : 'Favorite'}
        </button>
        <button type="button" className={`save-btn sav${sav ? ' on' : ''}`} aria-pressed={sav} onClick={guard(toggleSaved)}>
          <Mark on={sav} /> {sav ? 'Saved for next time' : 'Save for next time'}
        </button>
      </div>
    );
  }

  return (
    <div className="cover-actions">
      <button type="button" className={`icon-btn fav${fav ? ' on' : ''}`} aria-pressed={fav} aria-label={`${fav ? 'Remove from favorites' : 'Favorite'}: ${title}`} title={fav ? 'Remove from favorites' : 'Favorite'} onClick={guard(toggleFavorite)}>
        <Heart on={fav} />
      </button>
      <button type="button" className={`icon-btn sav${sav ? ' on' : ''}`} aria-pressed={sav} aria-label={`${sav ? 'Remove from saved' : 'Save for next time'}: ${title}`} title={sav ? 'Remove from saved' : 'Save for next time'} onClick={guard(toggleSaved)}>
        <Mark on={sav} />
      </button>
    </div>
  );
}
