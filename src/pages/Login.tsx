import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signIn } = useAuth();

  return (
    <div className="centered-page">
      <h1>Ставки на точний рахунок</h1>
      <p>Змагайся з друзями — вгадуй рахунки матчів і набирай очки.</p>
      <button className="google-btn" onClick={() => signIn()}>
        Увійти через Google
      </button>
    </div>
  );
}
