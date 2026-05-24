// ===== BOTTOM NAVIGATION =====
import type { ReactNode } from 'react';

interface BottomNavProps {
  current: string;
  onNavigate: (screen: string) => void;
}

const items: { key: string; label: string; icon: (active: boolean) => ReactNode }[] = [
  {
    key: 'home',
    label: 'Home',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.5}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    key: 'plants',
    label: 'Plants',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.5}>
        <path d="M12 22v-7l-2-2" />
        <path d="M17 8c.5 0 2-1 2-2.5C19 3 12 2 12 2s-7 1-7 3.5C5 7 6.5 8 7 8c1.5 0 2-1 2-1s.5 1 2 1 2-1 2-1z" />
        <path d="M12 15c-1.5 0-2-1-2-1s-.5 1-2 1c-.5 0-2-1-2-2.5C6 9 12 8 12 8s6 1 6 3.5c0 1.5-1.5 2.5-2 2.5z" />
      </svg>
    ),
  },
  {
    key: 'feed',
    label: 'Feed',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.5}>
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
      </svg>
    ),
  },
  {
    key: 'gallery',
    label: 'Photos',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.5}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.5}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav({ current, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const active = current === item.key;
        return (
          <button
            key={item.key}
            className={`nav-item${active ? ' active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.icon(active)}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
