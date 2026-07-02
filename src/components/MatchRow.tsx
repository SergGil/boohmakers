import type { Match } from '../types';
import BetCell from './BetCell';

interface Props {
  competitionId: string;
  match: Match;
  uid: string;
  onOpenDetails: () => void;
}

export default function MatchRow({ competitionId, match, uid, onOpenDetails }: Props) {
  const center =
    match.status === 'finished'
      ? `${match.homeScore}:${match.awayScore}`
      : new Date(match.kickoff).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="match-row">
      <div className="logo-placeholder tournament-placeholder" title="Логотип турніру" />
      <div className="match-row-team match-row-team-home">{match.homeTeam}</div>
      <div className="logo-placeholder team-placeholder" title={match.homeTeam} />
      <div className="match-row-center">{center}</div>
      <div className="logo-placeholder team-placeholder" title={match.awayTeam} />
      <div className="match-row-team match-row-team-away">{match.awayTeam}</div>
      <div className="match-row-bet">
        <BetCell competitionId={competitionId} matchId={match.id} uid={uid} />
      </div>
      <div className="match-row-action">
        <button onClick={onOpenDetails}>Деталі</button>
      </div>
    </div>
  );
}
