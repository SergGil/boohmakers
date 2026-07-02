import { useMemo, useState } from 'react';
import { usePagination, useSortableTable } from '../lib/tableHooks';
import type { Match } from '../types';
import MatchCard from './MatchCard';
import MatchRow from './MatchRow';

interface Props {
  competitionId: string;
  matches: Match[];
  isAdmin: boolean;
  uid: string;
  displayName: string;
}

type SortKey = 'kickoff' | 'homeTeam' | 'awayTeam';

const PAGE_SIZES = [10, 25, 50];

const dateLabel = (kickoff: number) =>
  new Date(kickoff).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long' });

export default function MatchesTable({ competitionId, matches, isAdmin, uid, displayName }: Props) {
  const [search, setSearch] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? matches.filter((m) => m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q))
      : matches;
  }, [matches, search]);

  const { sorted } = useSortableTable<Match, SortKey>(
    filtered,
    {
      kickoff: (a, b) => a.kickoff - b.kickoff,
      homeTeam: (a, b) => a.homeTeam.localeCompare(b.homeTeam),
      awayTeam: (a, b) => a.awayTeam.localeCompare(b.awayTeam),
    },
    'kickoff',
    'asc',
  );

  const { page, pageSize, totalPages, pageItems, setPage, setPageSize } = usePagination(sorted, 10);

  const groups = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of pageItems) {
      const key = dateLabel(m.kickoff);
      const list = map.get(key);
      if (list) list.push(m);
      else map.set(key, [m]);
    }
    return [...map.entries()];
  }, [pageItems]);

  return (
    <div>
      <div className="table-toolbar">
        <label className="table-page-size">
          Показати
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          записів
        </label>

        <label className="table-search">
          Пошук:
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>

      <div className="matches-list">
        {groups.map(([label, dayMatches]) => (
          <div key={label}>
            <div className="match-date-heading">{label}</div>
            {dayMatches.map((m) => (
              <MatchRow
                key={m.id}
                competitionId={competitionId}
                match={m}
                uid={uid}
                onOpenDetails={() => setSelectedMatch(m)}
              />
            ))}
          </div>
        ))}
        {groups.length === 0 && <p className="muted">Нічого не знайдено</p>}
      </div>

      {sorted.length > 0 && (
        <div className="table-footer">
          <span className="muted">
            Показано {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sorted.length)} з {sorted.length}
          </span>
          <div className="table-pagination">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Назад
            </button>
            <span className="muted">
              {page} / {totalPages}
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Далі
            </button>
          </div>
        </div>
      )}

      {selectedMatch && (
        <div className="modal-overlay" onClick={() => setSelectedMatch(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMatch(null)} aria-label="Закрити">
              ×
            </button>
            <MatchCard
              competitionId={competitionId}
              match={selectedMatch}
              isAdmin={isAdmin}
              uid={uid}
              displayName={displayName}
            />
          </div>
        </div>
      )}
    </div>
  );
}
