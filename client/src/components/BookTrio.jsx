// Three standing book covers used as artwork: a teal light-blue book in front,
// with a dark green book and a dark orange book behind it. Decoration only.
export default function BookTrio({ scale = 1 }) {
  return (
    <div className="trio" style={{ '--s': scale }} aria-hidden="true">
      <div className="trio-cover trio-green">
        <span className="moon" />
        <span className="cbar1" />
        <span className="cbar2" />
      </div>
      <div className="trio-cover trio-orange">
        <span className="star" />
        <span className="castle" />
        <span className="cbar1" />
        <span className="cbar2" />
      </div>
      <div className="trio-cover trio-blue">
        <span className="keyhole-head" />
        <span className="keyhole-body" />
        <span className="cbar1" />
        <span className="cbar2" />
      </div>
    </div>
  );
}
