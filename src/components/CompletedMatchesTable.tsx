import { useMemo, useState } from 'react';
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
  const [sortKey, setSortKey] = useState<SortKey>('kickoff');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? matches.filter((m) => m.homeTeam.toLowerCase().includes(q) || m.awayTeam.toLowerCase().includes(q))
      : matches;
  }, [matches, search]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'kickoff') return (a.kickoff - b.kickoff) * dir;
      return a[sortKey].localeCompare(b[sortKey]) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const pageRows = sorted.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const sortIndicator = (key: SortKey) => (sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');

  return (
    <div>
      <div className="table-toolbar">
        <label className="table-page-size">
          Показати
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
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
              Дата{sortIndicator('kickoff')}
            </th>
            <th className="sortable" onClick={() => toggleSort('homeTeam')}>
              Господарі{sortIndicator('homeTeam')}
            </th>
            <th className="sortable" onClick={() => toggleSort('awayTeam')}>
              Гості{sortIndicator('awayTeam')}
            </th>
            <th className="num-col">Результат</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((m) => (
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
          {pageRows.length === 0 && (
            <tr>
              <td colSpan={5} className="muted">
                Нічого не знайдено
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="table-footer">
        <span className="muted">
          {sorted.length === 0
            ? 'Показано 0 з 0'
            : `Показано ${(clampedPage - 1) * pageSize + 1}–${Math.min(clampedPage * pageSize, sorted.length)} з ${sorted.length}`}
        </span>
        <div className="table-pagination">
          <button disabled={clampedPage <= 1} onClick={() => setPage(clampedPage - 1)}>
            Назад
          </button>
          <span className="muted">
            {clampedPage} / {totalPages}
          </span>
          <button disabled={clampedPage >= totalPages} onClick={() => setPage(clampedPage + 1)}>
            Далі
          </button>
        </div>
      </div>

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
