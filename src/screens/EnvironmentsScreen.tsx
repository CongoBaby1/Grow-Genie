// ===== ENVIRONMENT MANAGEMENT SCREEN =====
import { useState } from 'react';
import { getGrow, addEnvironment, updateEnvironment, deleteEnvironment } from '../data/storage';
import type { Environment } from '../types';

interface EnvironmentsScreenProps {
  onClose: () => void;
}

const ENV_TYPES = [
  { key: 'tent', label: 'Grow Tent', icon: '⛺' },
  { key: 'room', label: 'Room', icon: '🏠' },
  { key: 'outdoor', label: 'Outdoor', icon: '🌤️' },
  { key: 'cabinet', label: 'Cabinet', icon: '🗄️' },
] as const;

export default function EnvironmentsScreen({ onClose }: EnvironmentsScreenProps) {
  const [grow, setGrow] = useState(() => getGrow());
  const [editing, setEditing] = useState<Environment | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<Environment['type']>('tent');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const refresh = () => setGrow(getGrow());

  const startAdd = () => {
    setEditing(null);
    setName('');
    setType('tent');
  };

  const startEdit = (env: Environment) => {
    setEditing(env);
    setName(env.name);
    setType(env.type);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editing) {
      updateEnvironment(editing.id, { name: name.trim(), type });
    } else {
      addEnvironment(name.trim(), type);
    }
    refresh();
    setEditing(null);
    setName('');
  };

  const handleDelete = (id: string) => {
    deleteEnvironment(id);
    refresh();
    setConfirmDelete(null);
  };

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
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-bright)' }}>Environments</span>
        <button className="btn btn-primary" onClick={startAdd} style={{ padding: '6px 12px', fontSize: 13 }}>+ Add</button>
      </div>

      <div className="scroll-area">
        <div style={{ padding: '16px 16px 100px' }}>
          {/* Add / Edit Form */}
          {(editing !== null || name !== '') && (
            <section className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 12 }}>
                {editing ? 'Edit Environment' : 'New Environment'}
              </div>

              {label('Name')}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Big Tent (4x4)"
                style={inputStyle()}
              />

              <div style={{ marginTop: 12 }}>{label('Type')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {ENV_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setType(t.key as Environment['type'])}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      padding: '8px 2px',
                      borderRadius: 10,
                      border: type === t.key ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: type === t.key ? 'var(--accent-soft)' : 'var(--surface-raised)',
                      color: type === t.key ? 'var(--accent)' : 'var(--text)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-primary" onClick={handleSave} style={{ flex: 1 }}>{editing ? 'Save' : 'Create'}</button>
                <button className="btn btn-ghost" onClick={() => { setEditing(null); setName(''); }}>Cancel</button>
              </div>
            </section>
          )}

          {/* List */}
          {grow.environments.map((env) => {
            const plantCount = grow.plants.filter((p) => p.environmentId === env.id && !p.archived).length;
            const typeLabel = ENV_TYPES.find((t) => t.key === env.type);
            return (
              <section key={env.id} className="card" style={{ marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--accent-soft)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  {typeLabel?.icon || '📦'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-bright)' }}>{env.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{typeLabel?.label || env.type} · {plantCount} plant{plantCount !== 1 ? 's' : ''}</div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-icon" onClick={() => startEdit(env)} style={{ width: 32, height: 32, fontSize: 14 }}>✎</button>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => setConfirmDelete(env.id)}
                    style={{ width: 32, height: 32, fontSize: 14, color: 'var(--danger)' }}
                  >🗑</button>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.7)',
          display: 'grid', placeItems: 'center',
        }}>
          <div className="card" style={{ width: '85%', maxWidth: 320 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 8 }}>Delete Environment?</div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 16 }}>Plants in this environment will be moved to your first remaining environment.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn" onClick={() => handleDelete(confirmDelete)} style={{ flex: 1, background: 'var(--danger)', color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
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
