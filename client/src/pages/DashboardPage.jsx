import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import * as bookingService from '../services/bookingService.js';
import { viewerZone, meetingDateTime } from '../utils/time.js';
import MeetingCard from '../components/MeetingCard.jsx';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

// "My Meetings": the next meeting at the top, then every group the reader belongs to.
export default function DashboardPage() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState(null);
  const [error, setError] = useState('');
  const zone = viewerZone(user);

  useEffect(() => {
    bookingService
      .getMyMemberships()
      .then((data) => setMemberships(data.memberships))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <ErrorMessage message={error} />;
  if (!memberships) return <Loader text="Loading your meetings..." />;

  // The soonest upcoming meeting across all of the reader's groups
  const upcoming = memberships
    .filter((m) => m.nextMeetingUtc)
    .sort((a, b) => new Date(a.nextMeetingUtc) - new Date(b.nextMeetingUtc))[0];

  return (
    <div className="dashboard">
      <p className="eyebrow">My meetings</p>
      <h1>Hi, {user.name.split(' ')[0]}</h1>
      <hr className="rule" />

      {memberships.length === 0 ? (
        <section className="panel center-panel">
          <h2>You haven&apos;t joined a group yet</h2>
          <p className="muted">Pick a book, choose one of its two weekly meeting times, and you&apos;ll see it here.</p>
          <Link className="btn btn-primary" to="/">Browse books</Link>
        </section>
      ) : (
        <>
          {upcoming && (
            <section className="panel next-meeting" aria-labelledby="next-title">
              <h2 id="next-title">Your next meeting</h2>
              <p className="next-when">{meetingDateTime(upcoming.nextMeetingUtc, zone)}</p>
              <p className="muted">{upcoming.group.book.title} · {zone}</p>
              {upcoming.slot?.meetingLink && (
                <a className="btn btn-primary" href={upcoming.slot.meetingLink} target="_blank" rel="noopener noreferrer">
                  Open video meeting
                </a>
              )}
            </section>
          )}

          <h2 className="section-title">My reading groups</h2>
          <div className="my-groups">
            {memberships.map((m) => (
              <MeetingCard key={m.id} membership={m} zone={zone} />
            ))}
          </div>

          <div className="dash-extras">
            <section className="panel">
              <h2>Weekly notes</h2>
              <p className="muted">Notes from each meeting will appear here so you can catch up if you miss one.</p>
            </section>
            <section className="panel">
              <h2>One-on-ones</h2>
              <p className="muted">Book a private session with your group leader to stay on track. Coming soon.</p>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
