// ===== FEED SCREEN =====
import { getGrow } from '../data/storage';

interface FeedScreenProps {
  onAddLog?: (plantId?: string) => void;
}

export default function FeedScreen({ onAddLog }: FeedScreenProps) {
  const grow = getGrow();
  const allLogs = [...grow.logs].sort((a, b) => b.date.localeCompare(a.date));

  function logIcon(type: string) {
    const map: Record<string, string> = {
      water: '💧', nutrients: '🧪', flush: '🚿', transplant: '🪴',
      trim: '✂️', top: '🔝', foliar: '🌫️', defoliate: '🍂', pest: '🐛', note: '📝',
    };
    return map[type] || '🔰';
  }

  return (
    <>
      <header style={{ padding: '16px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-bright)' }}>Feed History</h1>
          <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>All your grow activity in one place</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onAddLog?.()}
          style={{ padding: '6px 12px', fontSize: 13 }}
        >+ Log</button>
      </header>

      <div className="scroll-area">
        <div style={{ padding: '0 16px 100px' }}>
          {allLogs.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>
              No activity yet. Tap + Log to record your first feeding!
            </div>
          )}

          {allLogs.map((log) => {
            const plant = grow.plants.find((p: { id: string }) => p.id === log.plantId);
            return (
              <div key={log.id} className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{logIcon(log.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-bright)' }}>
                      {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                      {plant?.name || 'Unknown'} · {log.date}
                    </div>
                  </div>
                </div>

                {log.products.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {log.products.map((p, i) => (
                      <span key={i} className="chip">
                        {p.product}: {p.amount}{p.unit}{p.perGallon ? '/gal' : ''}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {log.waterAmount && <span>💧 {log.waterAmount}ml</span>}
                  {log.ph && <span>pH {log.ph}</span>}
                  {log.ec && <span>EC {log.ec}</span>}
                  {log.temperature && <span>🌡️ {log.temperature}°F</span>}
                  {log.humidity && <span>💨 {log.humidity}%</span>}
                </div>

                {log.note && (
                  <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 8, lineHeight: 1.4 }}>{log.note}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
