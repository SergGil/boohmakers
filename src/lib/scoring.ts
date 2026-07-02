import type { Match, Prediction } from '../types';

const outcome = (home: number, away: number): 'home' | 'away' | 'draw' =>
  home === away ? 'draw' : home > away ? 'home' : 'away';

/**
 * House rules, max 6 pts / min 0 pts per match:
 *  +1 for having made a prediction at all
 *  +1 correct outcome (win/draw/loss) / -1 if wrong
 *  +1 correct goal difference (abs value, regardless of which side won)
 *  +1 exact home-team score
 *  +1 exact away-team score
 *  +1 bonus if both outcome and goal difference were correct
 */
export function calculatePoints(match: Match, prediction: Prediction): number {
  if (match.status !== 'finished' || match.homeScore === null || match.awayScore === null) {
    return 0;
  }

  const resultCorrect = outcome(prediction.homeScore, prediction.awayScore) === outcome(match.homeScore, match.awayScore);
  const resultPoints = resultCorrect ? 1 : -1;

  const diffCorrect =
    Math.abs(prediction.homeScore - prediction.awayScore) === Math.abs(match.homeScore - match.awayScore);
  const diffPoints = diffCorrect ? 1 : 0;

  const homePoints = prediction.homeScore === match.homeScore ? 1 : 0;
  const awayPoints = prediction.awayScore === match.awayScore ? 1 : 0;
  const bonusPoints = resultCorrect && diffCorrect ? 1 : 0;

  return 1 + resultPoints + diffPoints + homePoints + awayPoints + bonusPoints;
}

export interface StandingsEntry {
  uid: string;
  displayName: string;
  /** Points earned per finished match in the tournament, in match order (0 if no prediction was made). */
  matchPoints: number[];
}

export interface RankedStanding {
  uid: string;
  displayName: string;
  totalPoints: number;
  averagePoints: number;
  /** Number of matches where 6 points (the max) were scored. */
  sixPointCount: number;
}

/**
 * Tie-break order for equal total points:
 *  1. Count of matches scoring 6, then 4, then 3, then 2, then 1 (most first)
 *  2. Average points per match in the tournament
 */
export function rankStandings(entries: StandingsEntry[]): RankedStanding[] {
  const TIEBREAK_VALUES = [6, 4, 3, 2, 1];

  const withStats = entries.map((e) => {
    const totalPoints = e.matchPoints.reduce((sum, p) => sum + p, 0);
    const averagePoints = e.matchPoints.length ? totalPoints / e.matchPoints.length : 0;
    const tiebreakCounts = TIEBREAK_VALUES.map((v) => e.matchPoints.filter((p) => p === v).length);
    return { uid: e.uid, displayName: e.displayName, totalPoints, averagePoints, tiebreakCounts };
  });

  withStats.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    for (let i = 0; i < TIEBREAK_VALUES.length; i++) {
      if (b.tiebreakCounts[i] !== a.tiebreakCounts[i]) return b.tiebreakCounts[i] - a.tiebreakCounts[i];
    }
    return b.averagePoints - a.averagePoints;
  });

  return withStats.map(({ uid, displayName, totalPoints, averagePoints, tiebreakCounts }) => ({
    uid,
    displayName,
    totalPoints,
    averagePoints,
    sixPointCount: tiebreakCounts[0],
  }));
}
