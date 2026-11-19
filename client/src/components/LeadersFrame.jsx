// Book-stack border around the leader cards on the Meet the Leaders page: a column of books with bookworms
// on each side, the cards in the open middle, and a row of books with two reading bookworms underneath.
// Pictures live in client/public/leaders-frame.
export default function LeadersFrame({ children }) {
  return (
    <div className="leaders-framed">
      <img className="lf-col lf-left" src="/leaders-frame/left.png" alt="" aria-hidden="true" draggable="false" />
      <img className="lf-col lf-right" src="/leaders-frame/right.png" alt="" aria-hidden="true" draggable="false" />
      <div className="lf-center">
        {children}
        <img className="lf-bottom" src="/leaders-frame/bottom.png" alt="" aria-hidden="true" draggable="false" />
      </div>
    </div>
  );
}
