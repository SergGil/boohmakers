import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const { user, displayName, logOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <Link to="/" className="app-title">
        БуХмекери
      </Link>
      {user && (
        <div className="user-box">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Увімкнути темну тему' : 'Увімкнути світлу тему'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
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
