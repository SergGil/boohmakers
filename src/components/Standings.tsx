import { useEffect, useState } from 'react';
import { subscribeToPredictions } from '../lib/firestore';
import { calculatePoints, rankStandings, type RankedStanding } from '../lib/scoring';
import type { Match } from '../types';

interface Props {
  competitionId: string;
  matches: Match[];
}

export default function Standings({ competitionId, matches }: Props) {
  const [rows, setRows] = useState<RankedStanding[]>([]);

  useEffect(() => {
    const finished = matches.filter((m) => m.status === 'finished');
    if (finished.length === 0) {
      setRows([]);
      return;
    }

    // pointsByMatch[matchId] = { uid: { displayName, points } }
    const pointsByMatch = new Map<string, Map<string, { displayName: string; points: number }>>();

    const recompute = () => {
      const displayNames = new Map<string, string>();
      for (const userPoints of pointsByMatch.values()) {
        for (const [uid, { displayName }] of userPoints.entries()) {
          displayNames.set(uid, displayName);
        }
      }

      const entries = [...displayNames.entries()].map(([uid, displayName]) => ({
        uid,
        displayName,
        matchPoints: finished.map((match) => pointsByMatch.get(match.id)?.get(uid)?.points ?? 0),
      }));

      setRows(rankStandings(entries));
    };

    const unsubscribers = finished.map((match) =>
      subscribeToPredictions(competitionId, match.id, (predictions) => {
        const userPoints = new Map<string, { displayName: string; points: number }>();
        for (const p of predictions) {
          userPoints.set(p.uid, { displayName: p.displayName, points: calculatePoints(match, p) });
        }
        pointsByMatch.set(match.id, userPoints);
        recompute();
      }),
    );

    return () => unsubscribers.forEach((u) => u());
  }, [competitionId, matches]);

  return (
    <div className="standings">
      <h3>Таблиця</h3>
      {rows.length === 0 ? (
        <p className="muted">Ще немає завершених матчів</p>
      ) : (
        <ol>
          {rows.map((r) => (
            <li key={r.uid}>
              {r.displayName} — {r.totalPoints} очок
              <span className="muted"> (сер. {r.averagePoints.toFixed(2)}/матч)</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
