import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const [rememberMe, setRememberMe] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signIn(rememberMe);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/boohmakers-logo.png" alt="boohmakers" className="login-logo" />
        <h1 className="login-title">Точний рахунок</h1>
        <div className="login-divider" />

        <button className="google-btn" disabled={signingIn} onClick={handleSignIn}>
          <svg className="google-icon" viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.5 0-14 4.2-17.7 10.7z" />
            <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.5C29.5 34.7 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5c3.6 6.5 10.1 10.6 17.8 10.6z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5C40.5 36.9 44 31 44 24c0-1.3-.1-2.7-.4-3.5z" />
          </svg>
          {signingIn ? 'Входимо...' : 'Увійти через Google'}
        </button>

        <label className="remember-me">
          <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
          Запам'ятати мене
        </label>
      </div>
    </div>
  );
}
