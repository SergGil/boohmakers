import { useEffect, useState } from 'react';
import { getOwnPrediction, setMatchResult, submitPrediction } from '../lib/firestore';
import { calculatePoints } from '../lib/scoring';
import type { Match, Prediction } from '../types';

interface Props {
  competitionId: string;
  match: Match;
  isAdmin: boolean;
  uid: string;
  displayName: string;
}

export default function MatchCard({ competitionId, match, isAdmin, uid, displayName }: Props) {
  const [ownPrediction, setOwnPrediction] = useState<Prediction | null>(null);
  const [predHome, setPredHome] = useState('');
  const [predAway, setPredAway] = useState('');
  const [resultHome, setResultHome] = useState('');
  const [resultAway, setResultAway] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOwnPrediction(competitionId, match.id, uid).then((p) => {
      setOwnPrediction(p);
      if (p) {
        setPredHome(String(p.homeScore));
        setPredAway(String(p.awayScore));
      }
    });
  }, [competitionId, match.id, uid]);

  const locked = Date.now() >= match.kickoff;

  const handlePredict = async () => {
    const home = Number(predHome);
    const away = Number(predAway);
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) return;
    setSaving(true);
    const prediction: Prediction = { uid, displayName, homeScore: home, awayScore: away, submittedAt: Date.now() };
    await submitPrediction(competitionId, match.id, prediction);
    setOwnPrediction(prediction);
    setSaving(false);
  };

  const handleSetResult = async () => {
    const home = Number(resultHome);
    const away = Number(resultAway);
    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) return;
    setSaving(true);
    await setMatchResult(competitionId, match.id, home, away);
    setSaving(false);
  };

  const points = ownPrediction ? calculatePoints(match, ownPrediction) : null;

  return (
    <div className="match-card">
      <div className="match-title">
        {match.homeTeam} — {match.awayTeam}
        <span className="kickoff">{new Date(match.kickoff).toLocaleString('uk-UA')}</span>
      </div>

      {match.status === 'finished' && (
        <div className="final-score">
          Фінальний рахунок: {match.homeScore}:{match.awayScore}
        </div>
      )}

      <div className="prediction-block">
        {!locked ? (
          <>
            <input
              type="number"
              min={0}
              value={predHome}
              onChange={(e) => setPredHome(e.target.value)}
              placeholder="Господарі"
            />
            <input
              type="number"
              min={0}
              value={predAway}
              onChange={(e) => setPredAway(e.target.value)}
              placeholder="Гості"
            />
            <button disabled={saving} onClick={handlePredict}>
              {ownPrediction ? 'Оновити ставку' : 'Зробити ставку'}
            </button>
          </>
        ) : ownPrediction ? (
          <div>
            Твоя ставка: {ownPrediction.homeScore}:{ownPrediction.awayScore}
            {match.status === 'finished' && <span className="points"> — {points} очок</span>}
          </div>
        ) : (
          <div className="muted">Ставку не зроблено — час вийшов</div>
        )}
      </div>

      {isAdmin && match.status !== 'finished' && (
        <div className="admin-block">
          <input
            type="number"
            min={0}
            value={resultHome}
            onChange={(e) => setResultHome(e.target.value)}
            placeholder="Рахунок господарів"
          />
          <input
            type="number"
            min={0}
            value={resultAway}
            onChange={(e) => setResultAway(e.target.value)}
            placeholder="Рахунок гостей"
          />
          <button disabled={saving} onClick={handleSetResult}>
            Внести результат
          </button>
        </div>
      )}
    </div>
  );
}
