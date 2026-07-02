import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createCompetition, joinCompetitionByCode, subscribeToUserCompetitions } from '../lib/firestore';
import type { Competition } from '../types';

export default function Home() {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToUserCompetitions(user.uid, setCompetitions);
  }, [user]);

  if (!user) return null;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createCompetition(newName.trim(), user.uid);
    setNewName('');
  };

  const handleJoin = async () => {
    setError(null);
    if (!joinCode.trim()) return;
    try {
      await joinCompetitionByCode(joinCode.trim(), user.uid);
      setJoinCode('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Помилка приєднання');
    }
  };

  return (
    <div className="page">
      <h2>Мої змагання</h2>
      <ul className="competition-list">
        {competitions.map((c) => (
          <li key={c.id}>
            <Link to={`/competitions/${c.id}`}>{c.name}</Link>
            <span className="invite-code">код: {c.inviteCode}</span>
          </li>
        ))}
        {competitions.length === 0 && <p>Ти ще не берешь участь у жодному змаганні.</p>}
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

      <div className="panel">
        <h3>Приєднатись за кодом</h3>
        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Код запрошення"
        />
        <button onClick={handleJoin}>Приєднатись</button>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
