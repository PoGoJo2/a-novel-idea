import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import LeaderDecor from '../components/LeaderDecor.jsx';
import LeaderClasses from '../components/leader/LeaderClasses.jsx';
import LeaderVolunteer from '../components/leader/LeaderVolunteer.jsx';
import LeaderRecord from '../components/leader/LeaderRecord.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const TABS = [['classes', 'My classes'], ['volunteer', 'Volunteer to lead'], ['record', 'My record']];

// Leader page: the classes I lead, classes I can volunteer for, and my record of finished classes.
export default function LeaderPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('classes');

  if (user.role !== 'leader' && user.role !== 'admin') return <ErrorMessage message="This page is for group leaders only." />;

  return (
    <div className="dashboard leader-page">
      <LeaderDecor side="left" />
      <LeaderDecor side="right" />
      <p className="eyebrow">Leader tools</p>
      <h1>The Leader&rsquo;s Corner</h1>
      <hr className="rule" />
      <div className="admin-tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={`admin-tab${tab === key ? ' on' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      {tab === 'classes' && <LeaderClasses onGoVolunteer={() => setTab('volunteer')} />}
      {tab === 'volunteer' && <LeaderVolunteer />}
      {tab === 'record' && <LeaderRecord />}
    </div>
  );
}
