import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import * as libraryService from '../services/libraryService.js';

const LibraryContext = createContext(null);

// Remembers which books the reader hearted or saved, so every page can show the same
// filled-in hearts and bookmarks. The server is the source of truth; the screen updates
// right away and rolls back if the server says no.
export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [saved, setSaved] = useState([]);
  const [version, setVersion] = useState(0); // bumps on every change so the Library page can reload
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setSaved([]);
      return;
    }
    libraryService
      .getIds()
      .then((data) => {
        setFavorites(data.favorites);
        setSaved(data.saved);
      })
      .catch(() => {});
  }, [user]);

  const toggle = useCallback(
    async (bookId, list) => {
      const [ids, setIds, add, remove] =
        list === 'favorites'
          ? [favorites, setFavorites, libraryService.addFavorite, libraryService.removeFavorite]
          : [saved, setSaved, libraryService.addSaved, libraryService.removeSaved];
      const turningOn = !ids.includes(bookId);
      setError('');
      setIds(turningOn ? [...ids, bookId] : ids.filter((id) => id !== bookId));
      try {
        const data = await (turningOn ? add(bookId) : remove(bookId));
        setFavorites(data.favorites);
        setSaved(data.saved);
        setVersion((v) => v + 1);
      } catch (err) {
        setIds(ids); // put it back the way it was
        setError(err.message);
      }
    },
    [favorites, saved]
  );

  const value = useMemo(
    () => ({
      loggedIn: Boolean(user),
      isFavorite: (id) => favorites.includes(id),
      isSaved: (id) => saved.includes(id),
      toggleFavorite: (id) => toggle(id, 'favorites'),
      toggleSaved: (id) => toggle(id, 'saved'),
      version,
      error,
    }),
    [user, favorites, saved, toggle, version, error]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = () => useContext(LibraryContext);
