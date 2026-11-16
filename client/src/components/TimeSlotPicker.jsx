import { slotLabel, nextMeetingLabel } from '../utils/time.js';

// The two weekly meeting times for a book. The reader picks one.
// "mySlotId" marks the time the reader is already booked into (if any).
export default function TimeSlotPicker({ slots, zone, value, onChange, mySlotId, disabled }) {
  return (
    <fieldset className="slot-picker" disabled={disabled}>
      <legend>Choose your weekly meeting time</legend>
      <div className="slot-options">
        {slots.map((slot) => {
          const full = slot.seatsLeft === 0 && slot.id !== mySlotId;
          const selected = value === slot.id;
          const next = nextMeetingLabel(slot.nextMeetingUtc, zone);
          return (
            <label key={slot.id} className={`slot-option${selected ? ' selected' : ''}${full ? ' full' : ''}`}>
              <input
                type="radio"
                name="meeting-time"
                value={slot.id}
                checked={selected}
                disabled={full}
                onChange={() => onChange(slot.id)}
              />
              <span className="slot-time">{slotLabel(slot, zone)}</span>
              <span className="slot-note">
                {full ? 'Full' : `${slot.seatsLeft} of ${slot.capacity} seats left`}
                {slot.id === mySlotId && ' · your time'}
              </span>
              {next && <span className="slot-next">Next meeting {next}</span>}
            </label>
          );
        })}
      </div>
      <p className="muted small">Times are shown in your time zone ({zone}). Meetings are held by video.</p>
    </fieldset>
  );
}
