import { useEffect, useState } from 'react';
import { subscribeToOwnPrediction } from '../lib/firestore';
import type { Prediction } from '../types';

interface Props {
  competitionId: string;
  matchId: string;
  uid: string;
}

export default function BetCell({ competitionId, matchId, uid }: Props) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  useEffect(() => subscribeToOwnPrediction(competitionId, matchId, uid, setPrediction), [competitionId, matchId, uid]);

  return <>{prediction ? `${prediction.homeScore}:${prediction.awayScore}` : '—'}</>;
}
