import { useEffect, useState } from 'react';
import { subscribeToPredictions } from '../lib/firestore';
import { calculatePoints } from '../lib/scoring';
import { useDisplayNames } from '../lib/useDisplayNames';
import type { Match, Prediction } from '../types';

interface Props {
  competitionId: string;
  match: Match;
  onClose: () => void;
}

export default function MatchDetailsModal({ competitionId, match, onClose }: Props) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    return subscribeToPredictions(competitionId, match.id, setPredictions);
  }, [competitionId, match.id]);

  const nicknames = useDisplayNames(predictions.map((p) => p.uid));

  const rows = predictions
    .map((p) => ({ ...p, points: calculatePoints(match, p) }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Закрити">
          ×
        </button>
        <h3>
          {match.homeTeam} {match.homeScore}:{match.awayScore} {match.awayTeam}
        </h3>

        {rows.length === 0 ? (
          <p className="muted">Ставок не було</p>
        ) : (
          <table className="standings-table">
            <thead>
              <tr>
                <th>Гравець</th>
                <th className="num-col">Ставка</th>
                <th className="num-col">Очки</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.uid}>
                  <td className="name-col">{nicknames.get(r.uid) ?? r.displayName}</td>
                  <td className="num-col">
                    {r.homeScore}:{r.awayScore}
                  </td>
                  <td className="num-col">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
