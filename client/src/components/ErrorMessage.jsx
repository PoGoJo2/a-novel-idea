export default function ErrorMessage({ message, details = [] }) {
  if (!message) return null;
  return (
    <div className="error-box" role="alert">
      <strong>{message}</strong>
      {details.length > 0 && (
        <ul>
          {details.map((d) => (
            <li key={`${d.field}-${d.message}`}>{d.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
