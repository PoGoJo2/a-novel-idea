import { useState } from 'react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ZONES = [['America/New_York', 'Eastern'], ['America/Chicago', 'Central'], ['America/Denver', 'Mountain'], ['America/Los_Angeles', 'Pacific'], ['Europe/London', 'London'], ['UTC', 'UTC']];
const blankSlot = () => ({ dayOfWeek: 4, startTime: '19:00', timezone: 'America/New_York', capacity: 12, meetingLink: '' });

// One form for both "new reading group" and "change this group".
// locked = the group has started, so its dates and times can no longer change.
export default function GroupForm({ initial, books, leaders, locked = false, busy, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    bookId: initial?.book?.id || '',
    leaderId: initial?.leader?.id || '',
    startDate: initial?.startDate ? String(initial.startDate).slice(0, 10) : '',
    totalWeeks: initial?.totalWeeks || 8,
    sessionMinutes: initial?.sessionMinutes || 60,
    timeSlots: initial?.timeSlots?.length ? initial.timeSlots.map((s) => ({ ...s })) : [blankSlot(), { ...blankSlot(), dayOfWeek: 6, startTime: '10:00' }],
  }));

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setSlot = (i, key, value) => setForm((f) => ({ ...f, timeSlots: f.timeSlots.map((s, n) => (n === i ? { ...s, [key]: value } : s)) }));
  const addSlot = () => setForm((f) => ({ ...f, timeSlots: [...f.timeSlots, blankSlot()] }));
  const removeSlot = (i) => setForm((f) => ({ ...f, timeSlots: f.timeSlots.filter((_, n) => n !== i) }));

  const submit = (e) => {
    e.preventDefault();
    const slots = form.timeSlots.map((s) => ({ ...s, dayOfWeek: Number(s.dayOfWeek), capacity: Number(s.capacity) }));
    const body = { leaderId: form.leaderId, sessionMinutes: Number(form.sessionMinutes) };
    if (books) body.bookId = form.bookId;
    if (!locked) Object.assign(body, { startDate: form.startDate, totalWeeks: Number(form.totalWeeks) });
    // after the group starts, the times are locked, so only the leader and class length are sent
    if (!locked) body.timeSlots = slots;
    onSubmit(body);
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      {books && (
        <label className="field">
          <span>Book</span>
          <select value={form.bookId} onChange={(e) => set('bookId', e.target.value)} required>
            <option value="">Choose a book…</option>
            {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
        </label>
      )}
      <label className="field">
        <span>Leader</span>
        <select value={form.leaderId} onChange={(e) => set('leaderId', e.target.value)} required>
          <option value="">Choose a leader…</option>
          {leaders.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.role})</option>)}
        </select>
      </label>
      <div className="admin-row">
        <label className="field">
          <span>Start date</span>
          <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} disabled={locked} required />
        </label>
        <label className="field">
          <span>Weeks</span>
          <input type="number" min={1} max={52} value={form.totalWeeks} onChange={(e) => set('totalWeeks', e.target.value)} disabled={locked} />
        </label>
        <label className="field">
          <span>Minutes per class</span>
          <input type="number" min={15} max={240} value={form.sessionMinutes} onChange={(e) => set('sessionMinutes', e.target.value)} />
        </label>
      </div>

      {locked ? (
        <p className="locked-note">Locked once the group starts: start date, weeks, meeting times. You can still change the leader and class length.</p>
      ) : (
        <>
          <h4 className="slots-title">Meetings each week ({form.timeSlots.length})</h4>
          {form.timeSlots.map((s, i) => (
            <div className="slot-card" key={s.id || i}>
              <div className="slot-grid">
                <label className="field"><span>Day</span>
                  <select value={s.dayOfWeek} onChange={(e) => setSlot(i, 'dayOfWeek', e.target.value)}>
                    {DAYS.map((d, n) => <option key={d} value={n}>{d}</option>)}
                  </select>
                </label>
                <label className="field"><span>Time</span>
                  <input type="time" value={s.startTime} onChange={(e) => setSlot(i, 'startTime', e.target.value)} required />
                </label>
                <label className="field"><span>Time zone</span>
                  <select value={s.timezone} onChange={(e) => setSlot(i, 'timezone', e.target.value)}>
                    {ZONES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="field"><span>Class size</span>
                  <input type="number" min={Math.max(s.seatsTaken || 1, 1)} max={100} value={s.capacity} onChange={(e) => setSlot(i, 'capacity', e.target.value)} />
                </label>
                {form.timeSlots.length > 1 ? <button type="button" className="btn btn-small slot-remove" onClick={() => removeSlot(i)}>Remove</button> : <span />}
              </div>
              <div className="slot-link">
                <label className="field"><span className="sr-only">Video link</span>
                  <input type="url" placeholder="Video link: https://…" value={s.meetingLink} onChange={(e) => setSlot(i, 'meetingLink', e.target.value)} />
                </label>
                {s.id && <span className="seats-taken">{s.seatsTaken || 0} of {s.capacity} taken</span>}
              </div>
            </div>
          ))}
          {form.timeSlots.length < 4 && <div><button type="button" className="btn btn-small" onClick={addSlot}>+ Add a meeting time</button></div>}
          <p className="muted small">Up to four meeting times a week.</p>
          <p className="locked-note">Locked once the group starts: start date, weeks, meeting times.</p>
        </>
      )}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>{submitLabel}</button>
        {onCancel && <button type="button" className="btn" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
