// ===== PLANT DETAIL SCREEN =====
import { useMemo } from 'react';
import { getGrow } from '../data/storage';
import type { Plant, FeedLog } from '../types';

interface PlantDetailProps {
  plantId: string;
  onBack: () => void;
  onAddLog: () => void;
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

function logIcon(type: string) {
  const map: Record<string, string> = {
    water: '💧', nutrients: '🧪', flush: '🚿', transplant: '🪴',
    trim: '✂️', top: '🔝', foliar: '🌫️', defoliate: '🍂', pest: '🐛', note: '📝',
  };
  return map[type] || '🔰';
}

export default function PlantDetailScreen({ plantId, onBack, onAddLog, onOpenSchedules }: PlantDetailProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const plant = useMemo(() => getGrow().plants.find((p) => p.id === plantId) as Plant | undefined, [plantId]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const logs = useMemo(() =>
    getGrow().logs
      .filter((l) => l.plantId === plantId)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [plantId]
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const env = useMemo(() => plant ? getGrow().environments.find((e) => e.id === plant.environmentId) : undefined, [plant]);

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

  if (!plant) {
    return (
      <div style={{ padding: 20 }}>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <p style={{ marginTop: 20 }}>Plant not found.</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <div style={{ position: 'relative', height: 220, flexShrink: 0 }}>
        <img
          src={plant.heroPhotoUrl || 'https://images.unsplash.com/photo-1603909223429-69bb7101f420?w=800&h=600&fit=crop'}
          alt={plant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
        }} />
        <button
          onClick={onBack}
          style={{
            position: 'absolute', top: 12, left: 12,
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', display: 'grid', placeItems: 'center',
            cursor: 'pointer', backdropFilter: 'blur(4px)',
          }}
        >←</button>

        <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{plant.name}</span>
            <span className={`chip ${stageColor(plant.stage)}`} style={{ fontWeight: 600 }}>{plant.stage}</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
            {plant.strain} {plant.breeder && `· ${plant.breeder}`} · {env?.name}
          </div>
        </div>
      </div>

      {/* Day counter */}
      <div style={{ background: 'var(--surface)', padding: '14px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>DAY {plant.day}</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>WEEK {plant.week}</div>
      </div>

      {/* Calendar strip */}
      <div style={{ background: 'var(--surface)', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="cal-strip">
          {days.map((d) => (
            <div key={d.full} className={`cal-day${d.isToday ? ' active' : ''}`}>
              <span>{d.label}</span>
              <span className="day-num">{d.num}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="scroll-area">
        <div style={{ padding: '0 16px 100px' }}>

          {/* Quick Actions */}
          <section style={{ margin: '16px 0' }}>
            <div className="qa-grid">
              {[
                { icon: '💧', label: 'Water' },
                { icon: '🧪', label: 'Nutrients', action: onOpenSchedules },
                { icon: '🛡️', label: 'Repellent' },
                { icon: '✂️', label: 'Trim' },
              ].map((a) => (
                <button key={a.label} className="qa-item" style={{ border: 'none' }} onClick={a.action} disabled={!a.action}>
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Status line */}
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16, textAlign: 'center' }}>
            Nothing scheduled for today · {today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>

          {/* Photos */}
          <section className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-bright)' }}>Photo Timeline</span>
              <span style={{ fontSize: 12, color: 'var(--accent)', cursor: 'pointer' }}>See All →</span>
            </div>
            <div className="photo-strip">
              {plant.photos.map((ph) => (
                <div key={ph.id} style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={ph.url}
                    alt={ph.caption}
                    className={`photo-thumb${ph.isHero ? ' is-hero' : ''}`}
                  />
                  <div style={{
                    position: 'absolute', bottom: 4, left: 4, right: 4,
                    fontSize: 10, color: '#fff',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  }}>
                    {ph.caption}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Feed History */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-bright)' }}>Recent Activity</span>
              <button className="btn btn-primary" onClick={onAddLog} style={{ padding: '4px 12px', fontSize: 13 }}>+ Log</button>
            </div>

            {logs.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: 20 }}>No activity yet. Tap + Log to record your first feeding!</p>
            )}

            {logs.map((log: FeedLog) => (
              <div key={log.id} className="log-row">
                <div className="log-icon">
                  <span style={{ fontSize: 18 }}>{logIcon(log.type)}</span>
                </div>
                <div className="log-body">
                  <div className="log-title">
                    {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                    {log.products.length > 0 && ` — ${log.products.map((p) => p.product).join(', ')}`}
                  </div>
                  <div className="log-meta">
                    {log.date} · {log.waterAmount ? `${log.waterAmount}ml` : ''}
                    {log.ph && ` · pH ${log.ph}`}
                    {log.ec && ` · EC ${log.ec}`}
                    {log.temperature && ` · ${log.temperature}°F`}
                    {log.humidity && ` · ${log.humidity}% RH`}
                  </div>
                  {log.note && (
                    <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 4, lineHeight: 1.4 }}>{log.note}</div>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* Notes */}
          <section className="card" style={{ marginTop: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-bright)', display: 'block', marginBottom: 8 }}>Notes</span>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{plant.notes || 'No notes yet.'}</div>
          </section>

        </div>
      </div>
    </>
  );
}
