export type CompetitionSection = 'next' | 'current' | 'completed' | 'table';

interface Props {
  active: CompetitionSection;
  onChange: (section: CompetitionSection) => void;
  counts: Record<CompetitionSection, number>;
}

const ITEMS: { key: CompetitionSection; label: string }[] = [
  { key: 'next', label: 'Наступні матчі' },
  { key: 'current', label: 'Поточні матчі' },
  { key: 'completed', label: 'Завершені матчі' },
  { key: 'table', label: 'Таблиця' },
];

export default function CompetitionSidebar({ active, onChange, counts }: Props) {
  return (
    <nav className="competition-sidebar">
      <div className="sidebar-heading">Меню</div>
      <ul>
        {ITEMS.map((item) => (
          <li key={item.key}>
            <button
              className={item.key === active ? 'sidebar-link active' : 'sidebar-link'}
              onClick={() => onChange(item.key)}
            >
              {item.label}
              {item.key !== 'table' && <span className="sidebar-count">{counts[item.key]}</span>}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
