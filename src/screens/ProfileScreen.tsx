// ===== PROFILE / SETTINGS SCREEN =====
interface ProfileScreenProps {
  onOpenEnvironments: () => void;
}

export default function ProfileScreen({ onOpenEnvironments }: ProfileScreenProps) {
  return (
    <>
      <header style={{ padding: '16px 16px 8px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-bright)' }}>Settings</h1>
      </header>
      <div className="scroll-area">
        <div style={{ padding: '0 16px 100px' }}>

          <section className="card" style={{ marginBottom: 12 }}>
            <button
              onClick={onOpenEnvironments}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                color: 'var(--text-bright)',
                fontSize: 15,
                cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              <span style={{ fontSize: 22 }}>🏡</span>
              <div>
                <div style={{ fontWeight: 600 }}>Environments</div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>Manage tents, rooms, outdoor plots</div>
              </div>
            </button>
          </section>

          <section className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
              <span style={{ fontSize: 22 }}>🧴</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-bright)' }}>Nutrient Schedules</div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>View from Home or Plant Detail → Nutrients</div>
              </div>
            </div>
          </section>

          <section className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
              <span style={{ fontSize: 22 }}>🌙</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-bright)' }}>Dark Mode</div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>Always on · Coming soon: light mode</div>
              </div>
            </div>
          </section>

          <section className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
              <span style={{ fontSize: 22 }}>🇯🇲</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-bright)' }}>Genie Language</div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>Jamaican Patois · Core to the app</div>
              </div>
            </div>
          </section>

          <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
            Grow Genie v0.1 · Built with 🌿
          </div>

        </div>
      </div>
    </>
  );
}
