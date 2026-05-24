// ===== HOME / DASHBOARD SCREEN =====
import { getGrow, recalcAll, getReminders } from '../data/storage';

interface HomeScreenProps {
  onPlantSelect: (plantId: string) => void;
  onAddPlant: () => void;
  onOpenSchedules: () => void;
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

function sevColor(sev: string) {
  switch (sev) {
    case 'due-today': return { bg: 'rgba(239,68,68,0.15)', border: 'var(--danger)', color: '#ef4444' };
    case 'this-week': return { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', color: '#f59e0b' };
    default: return { bg: 'var(--surface-raised)', border: 'var(--border)', color: 'var(--text-dim)' };
  }
}

export default function HomeScreen({ onPlantSelect, onAddPlant, onOpenSchedules }: HomeScreenProps) {
  recalcAll();
  const grow = getGrow();
  const reminders = getReminders();

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

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

  const groups = grow.environments.map((env) => ({
    env,
    plants: grow.plants.filter((p) => p.environmentId === env.id && !p.archived),
  }));

  const totalPlants = grow.plants.filter((p) => !p.archived).length;

  return (
    <>
      <header style={{ padding: '16px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-bright)' }}>Grow Genie 🌿</h1>
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>
            {formatMonth(today)} — {totalPlants} active plant{totalPlants !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAddPlant} style={{ padding: '8px 14px', fontSize: 13 }}>+ Plant</button>
      </header>

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

      <div className="scroll-area">
        <div style={{ padding: '0 16px 100px' }}>
          <section className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 12 }}>Quick Actions</h2>
            <div className="qa-grid">
              {[
                { icon: '💧', label: 'Water' },
                { icon: '🧪', label: 'Nutrients', action: onOpenSchedules },
                { icon: '📸', label: 'Photo' },
                { icon: '📒', label: 'Log' },
              ].map((a) => (
                <button
                  key={a.label}
                  className="qa-item"
                  style={{ border: 'none' }}
                  onClick={a.action}
                  disabled={!a.action}
                >
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Reminders */}
          {reminders.length > 0 && (
            <section className="card" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 12 }}>🔔 Reminders</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {reminders.map((r) => {
                  const s = sevColor(r.severity);
                  return (
                    <button
                      key={`${r.plantId}-${r.type}-${r.dueWeek}`}
                      onClick={() => onPlantSelect(r.plantId)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 10,
                        background: s.bg,
                        border: `1px solid ${s.border}`,
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'var(--text)',
                      }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{r.type === 'schedule' ? '🧪' : '💧'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{r.message}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{r.plantName}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {groups.map((g) => (
            <section key={g.env.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{g.env.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-dim)', background: 'var(--surface-raised)', padding: '2px 8px', borderRadius: 10 }}>{g.plants.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {g.plants.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onPlantSelect(p.id)}
                    className="card"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      width: '100%', textAlign: 'left',
                      border: 'none', cursor: 'pointer', padding: 0, overflow: 'hidden',
                    }}
                  >
                    <img
                      src={p.heroPhotoUrl || 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=160&h=160&fit=crop'}
                      alt={p.name}
                      style={{ width: 72, height: 72, objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, padding: '12px 12px 12px 0', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-bright)' }}>{p.name}</span>
                        <span className={`chip ${stageColor(p.stage)}`}>{p.stage}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 4 }}>{p.strain} {p.breeder && `· ${p.breeder}`}</div>
                      <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>Day {p.day} · Week {p.week}</div>
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
