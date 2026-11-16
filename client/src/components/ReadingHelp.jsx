// Explains the safety net for readers who miss a meeting. Booking one-on-ones comes in a later stage.
export default function ReadingHelp({ isMember }) {
  return (
    <section className="panel" aria-labelledby="help-title">
      <h2 id="help-title">Missed a meeting?</h2>
      <ul className="help-list">
        <li><strong>Read the weekly notes</strong> the leader publishes after each meeting.</li>
        <li><strong>Book a one-on-one</strong> with the group leader (a limited number per reader) to catch up.</li>
        <li><strong>Ask the AI assistant</strong> for study notes on the part of the book your group is on.</li>
      </ul>
      {!isMember && <p className="muted small">Join the group to unlock notes and one-on-ones.</p>}
    </section>
  );
}
