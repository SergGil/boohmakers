import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeToPredictions } from '../lib/firestore';
import { calculatePoints, rankStandings, type RankedStanding } from '../lib/scoring';
import { useDisplayNames } from '../lib/useDisplayNames';
import type { Match } from '../types';
import TournamentsDropdown from './TournamentsDropdown';

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

  const nicknames = useDisplayNames(rows.map((r) => r.uid));

  return (
    <div className="standings">
      <TournamentsDropdown currentCompetitionId={competitionId} />

      {rows.length === 0 ? (
        <p className="muted">Ще немає завершених матчів</p>
      ) : (
        <table className="standings-table">
          <thead>
            <tr>
              <th className="rank-col"></th>
              <th>Name</th>
              <th className="num-col">6</th>
              <th className="num-col">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.uid}>
                <td className="rank-col">{i + 1}</td>
                <td className="name-col">
                  <Link to={`/users/${r.uid}`}>{nicknames.get(r.uid) ?? r.displayName}</Link>
                </td>
                <td className="num-col">{r.sixPointCount}</td>
                <td className="num-col">{r.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
