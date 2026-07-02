import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const { user, displayName, logOut } = useAuth();

  return (
    <header className="app-header">
      <Link to="/" className="app-title">
        БуХмекери
      </Link>
      {user && (
        <div className="user-box">
          <ThemeToggle />
          <Link to="/profile" className="profile-link">
            {user.photoURL && <img src={user.photoURL} alt={displayName} className="avatar" />}
            <span>{displayName}</span>
          </Link>
          <button onClick={() => logOut()}>Вийти</button>
        </div>
      )}
    </header>
  );
}
