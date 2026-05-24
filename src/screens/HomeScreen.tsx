// ===== HOME / DASHBOARD SCREEN =====
import { mockGrow } from '../data/mockData';
import type { Plant } from '../types';

interface HomeScreenProps {
  onPlantSelect: (plantId: string) => void;
}

function stageColor(stage: string) {
  switch (stage) {
    case 'germination': return 'chip-germ';
    case 'seedling':    return 'chip-seed';
    case 'vegetative':  return 'chip-veg';
    case 'flowering':   return 'chip-flower';
    case 'harvest':     return 'chip-harvest';
    default: return '';
  }
}

function formatMonth(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function HomeScreen({ onPlantSelect }: HomeScreenProps) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday

  // Build 7-day calendar strip
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      num: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      full: d.toISOString().split('T')[0],
    };
  });

  // Group plants by environment
  const groups = mockGrow.environments.map((env) => ({
    env,
    plants: mockGrow.plants.filter((p) => p.environmentId === env.id && !p.archived),
  }));

  const totalPlants = mockGrow.plants.filter((p) => !p.archived).length;

  return (
    <>
      {/* Header */}
      <header style={{ padding: '16px 16px 8px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-bright)' }}>
          Grow Genie 🌿
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>
          {formatMonth(today)} — {totalPlants} active plant{totalPlants !== 1 ? 's' : ''}
        </p>
      </header>

      {/* Calendar strip */}
      <section style={{ margin: '12px 0' }}>
        <div className="cal-strip">
          {days.map((d) => (
            <div key={d.full} className={`cal-day${d.isToday ? ' active' : ''}`}>
              <span>{d.label}</span>
              <span className="day-num">{d.num}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Environments */}
      <div className="scroll-area">
        <div style={{ padding: '0 16px 100px' }}>
          {/* Toolbox */}
          <section className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 12 }}>Quick Actions</h2>
            <div className="qa-grid">
              {[
                { icon: '💧', label: 'Water' },
                { icon: '🧪', label: 'Nutrients' },
                { icon: '📸', label: 'Photo' },
                { icon: '📒', label: 'Log' },
              ].map((a) => (
                <div key={a.label} className="qa-item">
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                  <span>{a.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Plant Groups */}
          {groups.map((g) => (
            <section key={g.env.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                  {g.env.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', background: 'var(--surface-raised)', padding: '2px 8px', borderRadius: 10 }}>
                  {g.plants.length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {g.plants.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onPlantSelect(p.id)}
                    className="card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={p.heroPhotoUrl || 'https://via.placeholder.com/80'}
                      alt={p.name}
                      style={{ width: 72, height: 72, objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, padding: '12px 12px 12px 0', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-bright)' }}>{p.name}</span>
                        <span className={`chip ${stageColor(p.stage)}`}>{p.stage}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 4 }}>
                        {p.strain} {p.breeder && `· ${p.breeder}`}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>
                        Day {p.day} · Week {p.week}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
