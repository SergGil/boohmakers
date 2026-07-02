import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addMatch, subscribeToCompetition, subscribeToMatches } from '../lib/firestore';
import type { Competition, Match } from '../types';
import MatchCard from '../components/MatchCard';
import Standings from '../components/Standings';
import CompetitionSidebar, { type CompetitionSection } from '../components/CompetitionSidebar';

export default function CompetitionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [section, setSection] = useState<CompetitionSection>('next');

  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [kickoff, setKickoff] = useState('');

  useEffect(() => {
    if (!id) return;
    const unsub1 = subscribeToCompetition(id, setCompetition);
    const unsub2 = subscribeToMatches(id, setMatches);
    return () => {
      unsub1();
      unsub2();
    };
  }, [id]);

  const { nextMatches, currentMatches, completedMatches } = useMemo(() => {
    const now = Date.now();
    return {
      nextMatches: matches.filter((m) => m.status === 'scheduled' && m.kickoff > now),
      currentMatches: matches.filter((m) => m.status === 'scheduled' && m.kickoff <= now),
      completedMatches: matches.filter((m) => m.status === 'finished'),
    };
  }, [matches]);

  if (!id || !user || !competition) return <div className="page">Завантаження...</div>;

  const isAdmin = competition.ownerId === user.uid;

  const handleAddMatch = async () => {
    if (!homeTeam.trim() || !awayTeam.trim() || !kickoff) return;
    await addMatch(id, {
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      kickoff: new Date(kickoff).getTime(),
    });
    setHomeTeam('');
    setAwayTeam('');
    setKickoff('');
  };

  const sectionMatches = { next: nextMatches, current: currentMatches, completed: completedMatches };
  const sectionLabels = { next: 'Наступні матчі', current: 'Поточні матчі', completed: 'Завершені матчі' };

  return (
    <div className="page competition-page">
      <h2>{competition.name}</h2>
      <p className="invite-code">Код запрошення: {competition.inviteCode}</p>

      <div className="competition-layout">
        <CompetitionSidebar
          active={section}
          onChange={setSection}
          counts={{
            next: nextMatches.length,
            current: currentMatches.length,
            completed: completedMatches.length,
            table: 0,
          }}
        />

        <div className="competition-content">
          {section === 'table' ? (
            <Standings competitionId={id} matches={matches} />
          ) : (
            <>
              <h3>{sectionLabels[section]}</h3>
              <div className="match-list">
                {sectionMatches[section].map((m) => (
                  <MatchCard
                    key={m.id}
                    competitionId={id}
                    match={m}
                    isAdmin={isAdmin}
                    uid={user.uid}
                    displayName={user.displayName ?? 'Гравець'}
                  />
                ))}
                {sectionMatches[section].length === 0 && <p className="muted">Матчів немає</p>}
              </div>

              {isAdmin && section === 'next' && (
                <div className="panel">
                  <h3>Додати матч</h3>
                  <input value={homeTeam} onChange={(e) => setHomeTeam(e.target.value)} placeholder="Господарі" />
                  <input value={awayTeam} onChange={(e) => setAwayTeam(e.target.value)} placeholder="Гості" />
                  <input type="datetime-local" value={kickoff} onChange={(e) => setKickoff(e.target.value)} />
                  <button onClick={handleAddMatch}>Додати</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
