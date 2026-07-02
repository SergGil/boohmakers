import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeToAllCompetitions } from '../lib/firestore';
import type { Competition } from '../types';

interface Props {
  currentCompetitionId: string;
}

export default function TournamentsDropdown({ currentCompetitionId }: Props) {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeToAllCompetitions(setCompetitions), []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const sorted = [...competitions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="tournaments-dropdown" ref={rootRef}>
      <button className="tournaments-toggle" onClick={() => setOpen((v) => !v)}>
        Турніри <span className="caret">▾</span>
      </button>
      {open && (
        <ul className="tournaments-menu">
          {sorted.map((c) => (
            <li key={c.id}>
              <button
                className={c.id === currentCompetitionId ? 'tournaments-item active' : 'tournaments-item'}
                onClick={() => {
                  setOpen(false);
                  navigate(`/competitions/${c.id}`);
                }}
              >
                {c.name}
              </button>
            </li>
          ))}
          {sorted.length === 0 && <li className="tournaments-empty">Немає інших турнірів</li>}
        </ul>
      )}
    </div>
  );
}
