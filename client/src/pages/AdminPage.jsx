import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as adminService from '../services/adminService.js';
import Loader from '../components/Loader.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import AdminGroups from '../components/admin/AdminGroups.jsx';
import AdminBooks from '../components/admin/AdminBooks.jsx';
import AdminPeople from '../components/admin/AdminPeople.jsx';
import AdminFeedback from '../components/admin/AdminFeedback.jsx';
import AdminLeaderRequests from '../components/admin/AdminLeaderRequests.jsx';
import AdminTools, { GearCluster } from '../components/admin/AdminTools.jsx';

const TABS = [['overview', 'Overview'], ['groups', 'Groups'], ['books', 'Books'], ['people', 'People'], ['feedback', 'Complaints & reviews']];

const Stat = ({ label, value }) => (
  <div className="stat">
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
);

// Administrator page: a quick look at the whole club.
export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [groupsKey, setGroupsKey] = useState(0); // bumps to reload the group tiles after a leader changes

  useEffect(() => {
    if (user?.role !== 'admin') return;
    adminService.getStats().then((data) => setStats(data.stats)).catch((err) => setError(err.message));
  }, [user]);

  if (user?.role !== 'admin') return <ErrorMessage message="This page is for administrators only." />;

  return (
    <div className="dashboard admin-page">
      <AdminTools side="left" />
      <AdminTools side="right" />
      <GearCluster />
      <p className="eyebrow">Administrator</p>
      <h1>The club at a glance</h1>
      <hr className="rule" />
      <div className="admin-tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={`admin-tab${tab === key ? ' on' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      {tab === 'groups' && <AdminLeaderRequests onDecided={() => setGroupsKey((k) => k + 1)} />}
      {tab === 'groups' && <AdminGroups key={groupsKey} />}
      {tab === 'books' && <AdminBooks />}
      {tab === 'people' && <AdminPeople />}
      {tab === 'feedback' && <AdminFeedback />}
      {tab === 'overview' && <ErrorMessage message={error} />}
      {tab === 'overview' && !stats && !error && <Loader />}
      {tab === 'overview' && stats && (
        <>
          <section className="panel">
            <h2>People</h2>
            <div className="stat-grid">
              <Stat label="Total accounts" value={stats.users.total} />
              <Stat label="Members" value={stats.users.member} />
              <Stat label="Leaders" value={stats.users.leader} />
              <Stat label="Administrators" value={stats.users.admin} />
              <Stat label="Active bookings" value={stats.activeMemberships} />
            </div>
          </section>

          <section className="panel">
            <h2>Reading groups</h2>
            <div className="stat-grid">
              <Stat label="Total groups" value={stats.groups.total} />
              <Stat label="Open for sign-up" value={stats.groups.open} />
              <Stat label="Coming soon" value={stats.groups.comingSoon} />
              <Stat label="Already started" value={stats.groups.started} />
            </div>
            <p className="muted small">"Coming soon" groups are waiting for their leader to set the chapters or pages for every week.</p>
          </section>

          <section className="panel">
            <h2>Books ({stats.books.total})</h2>
            <div className="stat-grid">
              {stats.books.byGenre.map((g) => <Stat key={g.genre} label={g.genre} value={g.count} />)}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
