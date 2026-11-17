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
  const [notify, setNotify] = useState([]); // books the reader wants to hear about when a new group starts
  const [version, setVersion] = useState(0); // bumps on every change so the Library page can reload
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setSaved([]);
      setNotify([]);
      return;
    }
    libraryService
      .getIds()
      .then((data) => {
        setFavorites(data.favorites);
        setSaved(data.saved);
        setNotify(data.notify || []);
      })
      .catch(() => {});
  }, [user]);

  const toggle = useCallback(
    async (bookId, list) => {
      const [ids, setIds, add, remove] = {
        favorites: [favorites, setFavorites, libraryService.addFavorite, libraryService.removeFavorite],
        saved: [saved, setSaved, libraryService.addSaved, libraryService.removeSaved],
        notify: [notify, setNotify, libraryService.addNotify, libraryService.removeNotify],
      }[list];
      const turningOn = !ids.includes(bookId);
      setError('');
      setIds(turningOn ? [...ids, bookId] : ids.filter((id) => id !== bookId));
      try {
        const data = await (turningOn ? add(bookId) : remove(bookId));
        setFavorites(data.favorites);
        setSaved(data.saved);
        setNotify(data.notify || []);
        setVersion((v) => v + 1);
      } catch (err) {
        setIds(ids); // put it back the way it was
        setError(err.message);
      }
    },
    [favorites, saved, notify]
  );

  const value = useMemo(
    () => ({
      loggedIn: Boolean(user),
      isFavorite: (id) => favorites.includes(id),
      isSaved: (id) => saved.includes(id),
      toggleFavorite: (id) => toggle(id, 'favorites'),
      toggleSaved: (id) => toggle(id, 'saved'),
      isNotify: (id) => notify.includes(id),
      toggleNotify: (id) => toggle(id, 'notify'),
      version,
      error,
    }),
    [user, favorites, saved, notify, toggle, version, error]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export const useLibrary = () => useContext(LibraryContext);
