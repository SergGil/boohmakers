import type { Match, Prediction } from '../types';

const outcome = (home: number, away: number): 'home' | 'away' | 'draw' =>
  home === away ? 'draw' : home > away ? 'home' : 'away';

/**
 * Default scoring: 3 pts for exact score, 1 pt for correct outcome, 0 otherwise.
 * Swap this out once the final house rules are decided.
 */
export function calculatePoints(match: Match, prediction: Prediction): number {
  if (match.status !== 'finished' || match.homeScore === null || match.awayScore === null) {
    return 0;
  }

  const exact = prediction.homeScore === match.homeScore && prediction.awayScore === match.awayScore;
  if (exact) return 3;

  const sameOutcome =
    outcome(prediction.homeScore, prediction.awayScore) === outcome(match.homeScore, match.awayScore);
  return sameOutcome ? 1 : 0;
}
