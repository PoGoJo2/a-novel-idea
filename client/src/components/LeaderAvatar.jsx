// A leader's round photo, or their first initial when they have not added one yet.
export default function LeaderAvatar({ name = '', photo = '', size = 'large' }) {
  return (
    <span className={`leader-avatar ${size}`} aria-hidden="true">
      {photo ? <img src={photo} alt="" draggable="false" /> : <span>{name.charAt(0).toUpperCase()}</span>}
    </span>
  );
}
