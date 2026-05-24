// ===== NUTRIENT SCHEDULES SCREEN =====
import { useState } from 'react';
import { getSchedules, applyScheduleToLog, getGrow, BUILT_IN_SCHEDULES } from '../data/storage';

interface SchedulesScreenProps {
  preselectedPlantId?: string;
  onClose: () => void;
  onCreateNew: () => void;
}

export default function SchedulesScreen({ preselectedPlantId, onClose, onCreateNew }: SchedulesScreenProps) {
  const [schedules] = useState(() => getSchedules());
  const [selectedPlant, setSelectedPlant] = useState(preselectedPlantId || '');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [appliedWeek, setAppliedWeek] = useState<number | null>(null);

  const grow = getGrow();
  const activePlants = grow.plants.filter((p) => !p.archived);

  const handleApply = (week: number) => {
    if (!selectedPlant) return;
    const ok = applyScheduleToLog(selectedPlant, selectedSchedule, week);
    if (ok) setAppliedWeek(week);
    setTimeout(() => setAppliedWeek(null), 2000);
  };

  const builtInIds = new Set(BUILT_IN_SCHEDULES.map((s) => s.id));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        flexShrink: 0,
      }}>
        <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px 12px', fontSize: 14 }}>← Back</button>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-bright)' }}>Nutrient Schedules</span>
        <div style={{ width: 60 }} />
      </div>

      <div className="scroll-area">
        <div style={{ padding: '16px 16px 100px' }}>

          <button
            className="btn btn-primary"
            onClick={onCreateNew}
            style={{ width: '100%', marginBottom: 16 }}
          >
            + Create Custom Schedule
          </button>

          {/* Plant selector */}
          <section className="card" style={{ marginBottom: 16 }}>
            {label('Select Plant')}
            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              style={inputStyle()}
            >
              <option value="">Choose a plant...</option>
              {activePlants.map((p) => (
                <option key={p.id} value={p.id}>{p.name} (Week {p.week}, {p.stage})</option>
              ))}
            </select>
          </section>

          {/* Schedule list */}
          {schedules.map((sched) => {
            const isBuiltIn = builtInIds.has(sched.id);
            const active = selectedSchedule === sched.id;
            return (
              <section
                key={sched.id}
                className="card"
                style={{
                  marginBottom: 12,
                  border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedSchedule(active ? '' : sched.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-bright)' }}>{sched.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                      {sched.brand} · {sched.targetStage} · {sched.entries.length} weeks
                      {isBuiltIn && ' · Built-in'}
                    </div>
                  </div>
                  <span style={{
                    width: 20, height: 20, borderRadius: 10,
                    border: '2px solid var(--accent)',
                    background: active ? 'var(--accent)' : 'transparent',
                    display: 'grid', placeItems: 'center',
                    fontSize: 12, color: '#000',
                  }}>
                    {active && '✓'}
                  </span>
                </div>

                {/* Expanded: weekly entries */}
                {active && (
                  <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    {sched.entries.map((entry) => (
                      <div key={entry.week} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Week {entry.week}</span>
                          {selectedPlant && (
                            <button
                              className="btn btn-primary"
                              onClick={(e) => { e.stopPropagation(); handleApply(entry.week); }}
                              style={{ padding: '4px 10px', fontSize: 12 }}
                              disabled={appliedWeek === entry.week}
                            >
                              {appliedWeek === entry.week ? '✓ Applied' : 'Apply'}
                            </button>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                          {entry.products.map((p, i) => (
                            <span key={i} className="chip">
                              {p.product}: {p.amount}{p.unit}{p.perGallon ? '/gal' : ''}
                            </span>
                          ))}
                        </div>
                        {entry.note && (
                          <div style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>{entry.note}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function label(text: string) {
  return <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>{text}</label>;
}

function inputStyle(): React.CSSProperties {
  return {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--surface-raised)',
    color: 'var(--text-bright)',
    fontSize: 15,
    outline: 'none',
  };
}
