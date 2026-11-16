// The reading plan: one row per week, showing which weeks are finished, current, or coming up.
// Notes for each past meeting are added in a later stage; the button is a placeholder until then.
export default function WeeklySchedule({ totalWeeks, currentWeek, isMember }) {
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const state = (week) => (week < currentWeek ? 'done' : week === currentWeek ? 'current' : 'upcoming');
  const label = { done: 'Finished', current: 'This week', upcoming: 'Coming up' };

  return (
    <section className="panel" aria-labelledby="schedule-title">
      <h2 id="schedule-title">Weekly schedule</h2>
      <ol className="week-list">
        {weeks.map((week) => (
          <li key={week} className={`week ${state(week)}`}>
            <span className="week-num">Week {week}</span>
            <span className="tag tag-spot">{label[state(week)]}</span>
            {state(week) === 'done' && (
              <button type="button" className="btn btn-small" disabled title="Weekly notes arrive in a later stage">
                {isMember ? 'Read notes' : 'Notes (members)'}
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
