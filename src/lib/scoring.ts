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
