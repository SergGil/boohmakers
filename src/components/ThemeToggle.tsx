import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      className={isDark ? 'theme-switch checked' : 'theme-switch'}
      role="switch"
      aria-checked={isDark}
      title={isDark ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
      onClick={toggleTheme}
    >
      <span className="theme-switch-knob" />
    </button>
  );
}
