// ===== ADD / EDIT LOG SCREEN =====
import { useState } from 'react';
import { addLog, getGrow } from '../data/storage';
import type { FeedLog, ProductDose } from '../types';

interface AddLogScreenProps {
  plantId: string;
  onClose: () => void;
  onSaved?: (log: FeedLog) => void;
}

const ACTION_TYPES = [
  { key: 'water', label: 'Water', icon: '💧' },
  { key: 'nutrients', label: 'Nutrients', icon: '🧪' },
  { key: 'flush', label: 'Flush', icon: '🚿' },
  { key: 'transplant', label: 'Transplant', icon: '🪴' },
  { key: 'trim', label: 'Trim', icon: '✂️' },
  { key: 'top', label: 'Top', icon: '🔝' },
  { key: 'foliar', label: 'Foliar', icon: '🌫️' },
  { key: 'defoliate', label: 'Defoliate', icon: '🍂' },
  { key: 'pest', label: 'Pest', icon: '🐛' },
  { key: 'note', label: 'Note', icon: '📝' },
];

const UNITS = ['ml', 'g', 'tsp', 'tbsp', 'oz'] as const;

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

export default function AddLogScreen({ plantId, onClose, onSaved }: AddLogScreenProps) {
  const [type, setType] = useState<FeedLog['type']>('water');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [products, setProducts] = useState<ProductDose[]>([]);
  const [ph, setPh] = useState('');
  const [ec, setEc] = useState('');
  const [waterAmount, setWaterAmount] = useState('');
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [note, setNote] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const plant = getGrow().plants.find((p) => p.id === plantId);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addProduct = () => {
    setProducts([...products, { product: '', amount: 0, unit: 'ml', perGallon: false }]);
  };

  const updateProduct = (idx: number, patch: Partial<ProductDose>) => {
    const next = [...products];
    next[idx] = { ...next[idx], ...patch };
    setProducts(next);
  };

  const removeProduct = (idx: number) => {
    setProducts(products.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    setSaving(true);
    const log = addLog(plantId, type, {
      products: products.filter((p) => p.product.trim()),
      ph: ph ? parseFloat(ph) : undefined,
      ec: ec ? parseFloat(ec) : undefined,
      waterAmount: waterAmount ? parseFloat(waterAmount) : undefined,
      temperature: temperature ? parseFloat(temperature) : undefined,
      humidity: humidity ? parseFloat(humidity) : undefined,
      note,
      images: photoPreview ? [photoPreview] : undefined,
    });
    onSaved?.(log);
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
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-bright)' }}>Log Activity</span>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={saving}
          style={{ padding: '6px 14px', fontSize: 14 }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="scroll-area">
        <div style={{ padding: '16px 16px 100px' }}>
          {/* Plant name */}
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 4 }}>Plant</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-bright)', marginBottom: 16 }}>{plant?.name || 'Unknown'}</div>

          {/* Date */}
          {label('Date')}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle()} />

          {/* Action type */}
          <div style={{ marginTop: 16 }}>{label('Action')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {ACTION_TYPES.map((a) => (
              <button
                key={a.key}
                onClick={() => setType(a.key as FeedLog['type'])}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 2px',
                  borderRadius: 10,
                  border: type === a.key ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: type === a.key ? 'var(--accent-soft)' : 'var(--surface-raised)',
                  color: type === a.key ? 'var(--accent)' : 'var(--text)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>

          {/* Products (for nutrients / foliar / etc) */}
          {(type === 'nutrients' || type === 'foliar' || type === 'flush') && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                {label('Products')}
                <button className="btn btn-ghost" onClick={addProduct} style={{ padding: '4px 10px', fontSize: 12 }}>+ Add</button>
              </div>

              {products.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Tap "+ Add" to record products used.</p>
              )}

              {products.map((p, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center',
                  marginBottom: 8,
                  background: 'var(--surface-raised)',
                  padding: '8px',
                  borderRadius: 10,
                }}>
                  <input
                    placeholder="Product name"
                    value={p.product}
                    onChange={(e) => updateProduct(i, { product: e.target.value })}
                    style={{ ...inputStyle(), flex: 2, fontSize: 13 }}
                  />
                  <input
                    type="number"
                    placeholder="Amt"
                    value={p.amount || ''}
                    onChange={(e) => updateProduct(i, { amount: parseFloat(e.target.value) || 0 })}
                    style={{ ...inputStyle(), width: 60, fontSize: 13 }}
                  />
                  <select
                    value={p.unit}
                    onChange={(e) => updateProduct(i, { unit: e.target.value as ProductDose['unit'] })}
                    style={{ ...inputStyle(), width: 60, fontSize: 12 }}
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <button
                    onClick={() => removeProduct(i)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--danger)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          )}

          {/* Readings */}
          <div style={{ marginTop: 16 }}>
            {label('Readings')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input type="number" step="0.1" placeholder="pH" value={ph} onChange={(e) => setPh(e.target.value)} style={inputStyle()} />
              <input type="number" step="0.1" placeholder="EC" value={ec} onChange={(e) => setEc(e.target.value)} style={inputStyle()} />
              <input type="number" placeholder="Water (ml)" value={waterAmount} onChange={(e) => setWaterAmount(e.target.value)} style={inputStyle()} />
              <input type="number" placeholder="Temp (°F)" value={temperature} onChange={(e) => setTemperature(e.target.value)} style={inputStyle()} />
              <input type="number" placeholder="Humidity (%)" value={humidity} onChange={(e) => setHumidity(e.target.value)} style={inputStyle()} />
            </div>
          </div>

          {/* Note */}
          <div style={{ marginTop: 16 }}>{label('Note')}</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you observe?"
            rows={3}
            style={{ ...inputStyle(), resize: 'vertical' }}
          />

          {/* Photo */}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            {photoPreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={photoPreview} alt="Preview" style={{ width: 120, height: 120, borderRadius: 10, objectFit: 'cover', border: '2px solid var(--accent)' }} />
                <button
                  onClick={() => setPhotoPreview(null)}
                  style={{
                    position: 'absolute',
                    top: -6, right: -6,
                    width: 24, height: 24,
                    borderRadius: 12,
                    background: 'var(--danger)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 12,
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
                width: 120,
                height: 120,
                borderRadius: 10,
                border: '2px dashed var(--border)',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                gap: 6,
              }}>
                <span style={{ fontSize: 22 }}>📸</span>
                <span style={{ fontSize: 12 }}>Add Photo</span>
                <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
