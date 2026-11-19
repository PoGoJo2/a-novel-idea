import BookTrio from './BookTrio.jsx';
import BookShelf from './BookShelf.jsx';
import DeskStack from './DeskStack.jsx';
import FeatureList from './FeatureList.jsx';
import InkVine from './InkVine.jsx';

// The frame around the log-in and sign-up forms: artwork on the left, the form on the right,
// a vine in the corner, and a shelf of books along the bottom of the screen.
export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-grid">
        <section className="auth-art">
          <div className="auth-art-top">
            <InkVine />
            <BookTrio />
          </div>
          <h2>Your next chapter starts here</h2>
          <p className="muted">Pick a book, join its weekly group, and never miss a meeting.</p>
          <FeatureList />
        </section>
        <div className="auth-form">{children}</div>
      </div>
      <BookShelf />
      <DeskStack />
    </div>
  );
}
