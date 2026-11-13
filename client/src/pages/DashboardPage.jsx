import { useAuth } from '../context/AuthContext.jsx';

// Placeholder: Stage 8 fills this with the member's groups, upcoming meetings, and notes.
export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <div>
      <p className="eyebrow">My meetings</p>
      <h1>Hi, {user.name.split(' ')[0]}</h1>
      <p className="lead">You are logged in. Your groups and upcoming meetings will appear here soon.</p>
    </div>
  );
}
