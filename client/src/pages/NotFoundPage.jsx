import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="center-page">
      <h1>Page not found</h1>
      <p className="lead">That page is not in this library.</p>
      <Link className="btn btn-primary" to="/">Back to browsing</Link>
    </div>
  );
}
