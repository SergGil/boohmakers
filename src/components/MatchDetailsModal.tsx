import { useEffect, useMemo, useState } from 'react';
import { subscribeToPredictions } from '../lib/firestore';
import { calculatePoints } from '../lib/scoring';
import { useDisplayNames } from '../lib/useDisplayNames';
import { usePagination, useSortableTable } from '../lib/tableHooks';
import type { Match, Prediction } from '../types';

interface Props {
  competitionId: string;
  match: Match;
  onClose: () => void;
}

interface Row extends Prediction {
  points: number;
}

type SortKey = 'displayName' | 'points';

const PAGE_SIZES = [10, 25, 50];

export default function MatchDetailsModal({ competitionId, match, onClose }: Props) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    return subscribeToPredictions(competitionId, match.id, setPredictions);
  }, [competitionId, match.id]);

  const nicknames = useDisplayNames(predictions.map((p) => p.uid));

  const rows: Row[] = useMemo(
    () =>
      predictions.map((p) => ({
        ...p,
        displayName: nicknames.get(p.uid) ?? p.displayName,
        points: calculatePoints(match, p),
      })),
    [predictions, nicknames, match],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? rows.filter((r) => r.displayName.toLowerCase().includes(q)) : rows;
  }, [rows, search]);

  const { sorted, toggleSort, indicator } = useSortableTable<Row, SortKey>(
    filtered,
    {
      displayName: (a, b) => a.displayName.localeCompare(b.displayName),
      points: (a, b) => a.points - b.points,
    },
    'points',
  );

  const { page, pageSize, totalPages, pageItems, setPage, setPageSize } = usePagination(sorted, 10);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Закрити">
          ×
        </button>
        <h3>
          {match.homeTeam} {match.homeScore}:{match.awayScore} {match.awayTeam}
        </h3>

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
              <th className="sortable" onClick={() => toggleSort('displayName')}>
                Гравець{indicator('displayName')}
              </th>
              <th className="num-col">Ставка</th>
              <th className="num-col">Рахунок матчу</th>
              <th className="num-col sortable" onClick={() => toggleSort('points')}>
                Очки{indicator('points')}
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((r) => (
              <tr key={r.uid}>
                <td className="name-col">{r.displayName}</td>
                <td className="num-col">
                  {r.homeScore}:{r.awayScore}
                </td>
                <td className="num-col">
                  {match.homeScore}:{match.awayScore}
                </td>
                <td className="num-col">{r.points}</td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  {rows.length === 0 ? 'Ставок не було' : 'Нічого не знайдено'}
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
      </div>
    </div>
  );
}
