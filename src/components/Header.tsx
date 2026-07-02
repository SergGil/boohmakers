import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logOut } = useAuth();

  return (
    <header className="app-header">
      <Link to="/" className="app-title">
        Точний рахунок
      </Link>
      {user && (
        <div className="user-box">
          {user.photoURL && <img src={user.photoURL} alt={user.displayName ?? ''} className="avatar" />}
          <span>{user.displayName}</span>
          <button onClick={() => logOut()}>Вийти</button>
        </div>
      )}
    </header>
  );
}
