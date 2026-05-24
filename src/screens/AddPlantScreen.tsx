// ===== ADD PLANT SCREEN =====
import { useState } from 'react';
import { addPlant, getGrow } from '../data/storage';
import type { Plant, GrowStage } from '../types';

interface AddPlantScreenProps {
  onClose: () => void;
  onCreated?: (plant: Plant) => void;
}

const STAGES: { key: GrowStage; label: string }[] = [
  { key: 'germination', label: 'Germination' },
  { key: 'seedling',    label: 'Seedling' },
  { key: 'vegetative',  label: 'Vegetative' },
  { key: 'flowering',   label: 'Flowering' },
  { key: 'harvest',     label: 'Harvest' },
];

function label(label: string) {
  return <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</label>;
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

export default function AddPlantScreen({ onClose, onCreated }: AddPlantScreenProps) {
  const grow = getGrow();
  const [name, setName] = useState('');
  const [strain, setStrain] = useState('');
  const [breeder, setBreeder] = useState('');
  const [envId, setEnvId] = useState(grow.environments[0]?.id || '');
  const [stage, setStage] = useState<GrowStage>('vegetative');
  const [startedAt, setStartedAt] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    setSaving(true);
    const plant = addPlant(
      name.trim(),
      strain.trim(),
      breeder.trim(),
      envId,
      stage,
      startedAt,
      photoPreview || undefined,
      notes.trim()
    );
    onCreated?.(plant);
    onClose();
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
        <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px 12px', fontSize: 14 }}>Cancel</button>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-bright)' }}>New Plant</span>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!name.trim() || saving}
          style={{ opacity: !name.trim() ? 0.5 : 1, padding: '6px 14px', fontSize: 14 }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="scroll-area">
        <div style={{ padding: '16px 16px 100px' }}>
          {/* Photo upload */}
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            {photoPreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{ width: 160, height: 160, borderRadius: 14, objectFit: 'cover', border: '2px solid var(--accent)' }}
                />
                <button
                  onClick={() => setPhotoPreview(null)}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    background: 'var(--danger)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >×</button>
              </div>
            ) : (
              <label style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 160,
                height: 160,
                borderRadius: 14,
                border: '2px dashed var(--border)',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                gap: 8,
              }}>
                <span style={{ fontSize: 28 }}>📸</span>
                <span style={{ fontSize: 13 }}>Add Photo</span>
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {label('Plant Name *')}
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. White Widow Auto #1" style={inputStyle()} />

          <div style={{ marginTop: 14 }}>{label('Strain')}</div>
          <input value={strain} onChange={(e) => setStrain(e.target.value)} placeholder="e.g. White Widow Auto" style={inputStyle()} />

          <div style={{ marginTop: 14 }}>{label('Breeder / Seed Bank')}</div>
          <input value={breeder} onChange={(e) => setBreeder(e.target.value)} placeholder="e.g. Royal Queen Seeds" style={inputStyle()} />

          <div style={{ marginTop: 14 }}>{label('Environment')}</div>
          <select value={envId} onChange={(e) => setEnvId(e.target.value)} style={inputStyle()} >
            {grow.environments.map((env) => (
              <option key={env.id} value={env.id}>{env.name}</option>
            ))}
          </select>

          <div style={{ marginTop: 14 }}>{label('Current Stage')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {STAGES.map((s) => (
              <button
                key={s.key}
                onClick={() => setStage(s.key)}
                className={`chip ${stage === s.key ? `chip-${s.key}` : ''}`}
                style={{
                  background: stage === s.key ? 'var(--accent-soft)' : undefined,
                  color: stage === s.key ? 'var(--accent)' : undefined,
                  borderColor: stage === s.key ? 'var(--accent)' : undefined,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 14 }}>{label('Start Date')}</div>
          <input type="date" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} style={inputStyle()} />

          <div style={{ marginTop: 14 }}>{label('Notes')}</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any initial notes..."
            rows={3}
            style={{ ...inputStyle(), resize: 'vertical' }}
          />
        </div>
      </div>
    </div>
  );
}
