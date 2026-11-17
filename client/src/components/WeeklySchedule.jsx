// The reading plan: one row per week, with the chapters to read that week. Finished weeks show their notes (for members) in an expandable row.
export default function WeeklySchedule({ totalWeeks, currentWeek, isMember, notes = [], goals = [] }) {
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);
  const state = (week) => (week < currentWeek ? 'done' : week === currentWeek ? 'current' : 'upcoming');
  const label = { done: 'Finished', current: 'This week', upcoming: 'Coming up' };
  const goalFor = (week) => goals.find((g) => g.weekNumber === week)?.chapters || '';
  const noteFor = (week) => notes.find((n) => n.weekNumber === week);

  return (
    <section className="panel" aria-labelledby="schedule-title">
      <h2 id="schedule-title">Weekly schedule</h2>
      <ol className="week-list">
        {weeks.map((week) => {
          const note = noteFor(week);
          return (
            <li key={week} className={`week ${state(week)}`}>
              <div className="week-row">
                <span className="week-num">Week {week}</span>
                <span className="tag tag-spot">{label[state(week)]}</span>
                {goalFor(week) && <span className="week-goal">{goalFor(week)}</span>}
                {state(week) === 'done' && !isMember && <span className="muted small week-right">Notes are for members</span>}
                {state(week) === 'done' && isMember && !note && <span className="muted small week-right">No notes yet</span>}
              </div>
              {isMember && note && (
                <details className="note">
                  <summary>Read week {week} notes</summary>
                  <p>{note.content}</p>
                  <small className="muted">By {note.author}</small>
                </details>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
