import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createCompetition, subscribeToAllCompetitions } from '../lib/firestore';
import type { Competition } from '../types';

export default function Home() {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!user) return;
    return subscribeToAllCompetitions(setCompetitions);
  }, [user]);

  if (!user) return null;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createCompetition(newName.trim(), user.uid);
    setNewName('');
  };

  return (
    <div className="page">
      <h2>Змагання</h2>
      <ul className="competition-list">
        {competitions.map((c) => (
          <li key={c.id}>
            <Link to={`/competitions/${c.id}`}>{c.name}</Link>
          </li>
        ))}
        {competitions.length === 0 && <p>Змагань ще немає.</p>}
      </ul>

      <div className="panel">
        <h3>Створити нове змагання</h3>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Назва змагання"
        />
        <button onClick={handleCreate}>Створити</button>
      </div>
    </div>
  );
}
