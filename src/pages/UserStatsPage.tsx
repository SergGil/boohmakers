import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserStats, subscribeToUserProfile, type UserStats } from '../lib/firestore';
import type { UserProfile } from '../types';

export default function UserStatsPage() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (!uid) return;
    return subscribeToUserProfile(uid, setProfile);
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    setStats(null);
    getUserStats(uid).then(setStats);
  }, [uid]);

  if (!uid) return null;

  const displayName = profile?.nickname.trim() || 'Гравець';

  return (
    <div className="page">
      <button className="back-link" onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <h2>{displayName}</h2>

      <h3>User Stats</h3>
      <div className="panel profile-form">
        {!stats ? (
          <p className="muted">Завантаження...</p>
        ) : (
          <table className="standings-table">
            <tbody>
              <tr>
                <td>Points</td>
                <td className="num-col">{stats.totalPoints}</td>
              </tr>
              <tr>
                <td>Bets</td>
                <td className="num-col">{stats.totalBets}</td>
              </tr>
              <tr>
                <td>AVG</td>
                <td className="num-col">{stats.averagePoints.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <h3>Achievements</h3>
      <div className="panel">
        <p className="muted">Ачівок поки немає</p>
      </div>
    </div>
  );
}
