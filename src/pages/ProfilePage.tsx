import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveUserProfile } from '../lib/firestore';
import { EPL_CLUBS } from '../lib/clubs';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [favoriteClub, setFavoriteClub] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setNickname(profile.nickname);
    setFavoriteClub(profile.favoriteClub);
  }, [profile]);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveUserProfile({
        uid: user.uid,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nickname: nickname.trim(),
        favoriteClub,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <button className="back-link" onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <h2>Профіль</h2>

      <div className="profile-header">
        {user.photoURL && <img src={user.photoURL} alt="" className="profile-avatar" />}
        <span className="muted">{user.email}</span>
      </div>

      <div className="panel profile-form">
        <label className="form-field">
          Ім'я
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ім'я" />
        </label>

        <label className="form-field">
          Прізвище
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Прізвище" />
        </label>

        <label className="form-field">
          Нікнейм (відображатиметься замість імені)
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Нікнейм" />
        </label>

        <label className="form-field">
          Улюблений клуб
          <select value={favoriteClub} onChange={(e) => setFavoriteClub(e.target.value)}>
            <option value="">Не обрано</option>
            {EPL_CLUBS.map((club) => (
              <option key={club} value={club}>
                {club}
              </option>
            ))}
          </select>
        </label>

        <button disabled={saving} onClick={handleSave}>
          {saving ? 'Зберігаємо...' : 'Зберегти'}
        </button>
        {saved && <span className="muted">Збережено</span>}
      </div>
    </div>
  );
}
