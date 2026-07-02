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
    <div className="stats-page">
      <div className="stats-card">
        <div className="stats-topbar">
          <button className="back-link" onClick={() => navigate(-1)}>
            ← Назад
          </button>
          <span className="stats-nickname">{displayName}</span>
        </div>

        <h2 className="stats-heading">User Stats</h2>
        <div className="stats-divider" />

        {!stats ? (
          <p className="muted stats-loading">Завантаження...</p>
        ) : (
          <table className="standings-table stats-table">
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

        <h2 className="stats-heading">Achievements</h2>
        <div className="stats-divider" />
        <p className="muted stats-loading">Ачівок поки немає</p>
      </div>
    </div>
  );
}
