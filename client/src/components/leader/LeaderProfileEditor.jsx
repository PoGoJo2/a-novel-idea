import { useEffect, useRef, useState } from 'react';
import * as profiles from '../../services/profileService.js';
import LeaderAvatar from '../LeaderAvatar.jsx';
import Loader from '../Loader.jsx';
import ErrorMessage from '../ErrorMessage.jsx';

// Shrink a chosen picture to a 320 x 320 square so it stays small enough to save with the profile.
const resizePhoto = (file) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 320;
      canvas.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 320, 320);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => reject(new Error('That file is not a picture we can use.'));
    img.src = URL.createObjectURL(file);
  });

// Leader tools > Edit my profile: photo, bio, background, book interests and favorite reads.
export default function LeaderProfileEditor() {
  const [form, setForm] = useState(null);
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    profiles.getMyProfile()
      .then(({ profile }) => {
        setGenres(profile.genres || []);
        setForm({ name: profile.name, photo: profile.photo, bio: profile.bio, history: profile.history, interests: profile.interests, favoriteReads: profile.favoriteReads });
      })
      .catch((err) => setError(err.message));
  }, []);

  if (!form && !error) return <Loader />;
  if (!form) return <ErrorMessage message={error} />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const toggle = (g) => setForm({ ...form, interests: form.interests.includes(g) ? form.interests.filter((x) => x !== g) : [...form.interests, g] });

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    try {
      setForm({ ...form, photo: await resizePhoto(file) });
    } catch (err) {
      setError(err.message);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const { profile } = await profiles.saveMyProfile({ photo: form.photo, bio: form.bio, history: form.history, interests: form.interests, favoriteReads: form.favoriteReads });
      setForm({ ...form, ...profile });
      setMessage('Profile saved. Readers will see it on the Meet the Leaders page.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <h2>Edit my profile</h2>
      <p className="muted small">This is what readers see about you on the Meet the Leaders page.</p>
      <ErrorMessage message={error} />
      {message && <p className="notice" role="status">{message}</p>}

      <form className="profile-form" onSubmit={save}>
        <div className="pf-photo">
          <LeaderAvatar name={form.name} photo={form.photo} />
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pickPhoto} />
          <button type="button" className="btn btn-small" onClick={() => fileRef.current?.click()}>{form.photo ? 'Change photo' : 'Add a photo'}</button>
          {form.photo && <button type="button" className="link-button small" onClick={() => setForm({ ...form, photo: '' })}>Remove photo</button>}
        </div>

        <div className="pf-fields">
          <label className="field">
            <span>Short bio</span>
            <textarea rows={3} maxLength={600} value={form.bio} onChange={set('bio')} placeholder="A few sentences about you as a reader and a leader." />
            <small className="muted">{form.bio.length} / 600</small>
          </label>
          <label className="field">
            <span>Background</span>
            <textarea rows={3} maxLength={800} value={form.history} onChange={set('history')} placeholder="How you got into leading book groups, and what you’ve led before." />
          </label>
          <fieldset className="field pf-genres">
            <legend>Book interests</legend>
            <div className="lc-tags">
              {genres.map((g) => (
                <button key={g} type="button" className={`tag tag-toggle${form.interests.includes(g) ? ' on' : ''}`} aria-pressed={form.interests.includes(g)} onClick={() => toggle(g)}>{g}</button>
              ))}
            </div>
          </fieldset>
          <label className="field">
            <span>Favorite reads</span>
            <input type="text" maxLength={300} value={form.favoriteReads} onChange={set('favoriteReads')} placeholder="Pride and Prejudice, Dune, Educated" />
          </label>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
        </div>
      </form>
    </section>
  );
}
