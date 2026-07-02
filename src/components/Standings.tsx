import { useEffect, useState } from 'react';
import { subscribeToPredictions } from '../lib/firestore';
import { calculatePoints } from '../lib/scoring';
import type { Match } from '../types';

interface Props {
  competitionId: string;
  matches: Match[];
}

interface Row {
  uid: string;
  displayName: string;
  points: number;
}

export default function Standings({ competitionId, matches }: Props) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const finished = matches.filter((m) => m.status === 'finished');
    if (finished.length === 0) {
      setRows([]);
      return;
    }

    // pointsByMatch[matchId] = { uid: { displayName, points } }
    const pointsByMatch = new Map<string, Map<string, { displayName: string; points: number }>>();

    const recompute = () => {
      const totals = new Map<string, { displayName: string; points: number }>();
      for (const userPoints of pointsByMatch.values()) {
        for (const [uid, { displayName, points }] of userPoints.entries()) {
          const current = totals.get(uid) ?? { displayName, points: 0 };
          totals.set(uid, { displayName, points: current.points + points });
        }
      }
      const nextRows = [...totals.entries()]
        .map(([uid, { displayName, points }]) => ({ uid, displayName, points }))
        .sort((a, b) => b.points - a.points);
      setRows(nextRows);
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
              {r.displayName} — {r.points} очок
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
