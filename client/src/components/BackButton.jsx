import { useLocation, useNavigate } from 'react-router-dom';

// "← Back": returns to the page the reader came from, or to Browse if there is nowhere to go back to.
export default function BackButton({ label = 'Back' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = () => (location.key === 'default' ? navigate('/') : navigate(-1));
  return (
    <button type="button" className="back-btn" onClick={goBack}>
      <span aria-hidden="true">←</span> {label}
    </button>
  );
}
