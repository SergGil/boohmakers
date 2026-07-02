import { useMemo, useState } from 'react';
import { usePagination, useSortableTable } from '../lib/tableHooks';
import type { Match } from '../types';
import MatchDetailsModal from './MatchDetailsModal';

interface Props {
  competitionId: string;
  matches: Match[];
}

type SortKey = 'kickoff' | 'homeTeam' | 'awayTeam';

const PAGE_SIZES = [10, 25, 50, 100];

export default function CompletedMatchesTable({ competitionId, matches }: Props) {
  const [search, setSearch] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? matches.filter((m) => m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q))
      : matches;
  }, [matches, search]);

  const { sorted, toggleSort, indicator } = useSortableTable<Match, SortKey>(
    filtered,
    {
      kickoff: (a, b) => a.kickoff - b.kickoff,
      homeTeam: (a, b) => a.homeTeam.localeCompare(b.homeTeam),
      awayTeam: (a, b) => a.awayTeam.localeCompare(b.awayTeam),
    },
    'kickoff',
  );

  const { page, pageSize, totalPages, pageItems, setPage, setPageSize } = usePagination(sorted, 10);

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

      <table className="standings-table">
        <thead>
          <tr>
            <th className="sortable" onClick={() => toggleSort('kickoff')}>
              Дата{indicator('kickoff')}
            </th>
            <th className="sortable" onClick={() => toggleSort('homeTeam')}>
              Господарі{indicator('homeTeam')}
            </th>
            <th className="sortable" onClick={() => toggleSort('awayTeam')}>
              Гості{indicator('awayTeam')}
            </th>
            <th className="num-col">Результат</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((m) => (
            <tr key={m.id}>
              <td>{new Date(m.kickoff).toLocaleDateString('uk-UA')}</td>
              <td>{m.homeTeam}</td>
              <td>{m.awayTeam}</td>
              <td className="num-col">
                {m.homeScore}:{m.awayScore}
              </td>
              <td>
                <button onClick={() => setSelectedMatch(m)}>Детальніше</button>
              </td>
            </tr>
          ))}
          {pageItems.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                Нічого не знайдено
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
        <MatchDetailsModal
          competitionId={competitionId}
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}
