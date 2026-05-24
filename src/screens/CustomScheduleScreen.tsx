// ===== CUSTOM SCHEDULE BUILDER =====
import { useState } from 'react';
import { saveCustomSchedule } from '../data/storage';
import type { NutrientSchedule, ScheduleEntry, ProductDose, GrowStage } from '../types';

interface CustomScheduleScreenProps {
  onClose: () => void;
}

const STAGES: GrowStage[] = ['germination', 'seedling', 'vegetative', 'flowering', 'harvest'];
const UNITS: ProductDose['unit'][] = ['ml', 'g', 'tsp', 'tbsp', 'oz'];

function uid() {
  return `sched-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function CustomScheduleScreen({ onClose }: CustomScheduleScreenProps) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [targetStage, setTargetStage] = useState<GrowStage>('vegetative');
  const [entries, setEntries] = useState<ScheduleEntry[]>([
    { week: 1, products: [{ product: '', amount: 0, unit: 'ml' as const, perGallon: true }] },
  ]);

  const addWeek = () => {
    const nextWeek = entries.length > 0 ? Math.max(...entries.map((e) => e.week)) + 1 : 1;
    setEntries([...entries, { week: nextWeek, products: [{ product: '', amount: 0, unit: 'ml', perGallon: true }] }]);
  };

  const removeWeek = (idx: number) => {
    setEntries(entries.filter((_, i) => i !== idx));
  };

  const updateProduct = (entryIdx: number, prodIdx: number, patch: Partial<ProductDose>) => {
    const next = entries.map((e, i) => {
      if (i !== entryIdx) return e;
      const prods = e.products.map((p, j) => (j === prodIdx ? { ...p, ...patch } : p));
      return { ...e, products: prods };
    });
    setEntries(next);
  };

  const addProduct = (entryIdx: number) => {
    const next = entries.map((e, i) => {
      if (i !== entryIdx) return e;
      return { ...e, products: [...e.products, { product: '', amount: 0, unit: 'ml' as const, perGallon: true }] };
    });
    setEntries(next);
  };

  const removeProduct = (entryIdx: number, prodIdx: number) => {
    const next = entries.map((e, i) => {
      if (i !== entryIdx) return e;
      return { ...e, products: e.products.filter((_, j) => j !== prodIdx) };
    });
    setEntries(next);
  };

  const updateNote = (entryIdx: number, note: string) => {
    const next = entries.map((e, i) => (i === entryIdx ? { ...e, note } : e));
    setEntries(next);
  };

  const handleSave = () => {
    if (!name.trim() || entries.length === 0) return;
    const schedule: NutrientSchedule = {
      id: uid(),
      name: name.trim(),
      targetStage,
      brand: brand.trim() || undefined,
      entries: entries.filter((e) => e.products.some((p) => p.product.trim()))
        .map((e) => ({
          ...e,
          products: e.products.filter((p) => p.product.trim()),
        })),
    };
    saveCustomSchedule(schedule);
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
        <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px 12px', fontSize: 14 }}>← Back</button>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-bright)' }}>New Schedule</span>
        <button className="btn btn-primary" onClick={handleSave} style={{ padding: '6px 14px', fontSize: 13 }}>Save</button>
      </div>

      <div className="scroll-area">
        <div style={{ padding: '16px 16px 100px' }}>
          <section className="card" style={{ marginBottom: 16 }}>
            {label('Schedule Name')}
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My Coco Flower Mix" style={inputStyle()} />

            <div style={{ marginTop: 12 }}>{label('Brand (optional)')}</div>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. House & Garden" style={inputStyle()} />

            <div style={{ marginTop: 12 }}>{label('Target Stage')}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => setTargetStage(s)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 20,
                    border: targetStage === s ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: targetStage === s ? 'var(--accent-soft)' : 'var(--surface-raised)',
                    color: targetStage === s ? 'var(--accent)' : 'var(--text)',
                    fontSize: 12,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Week builder */}
          {entries.map((entry, entryIdx) => (
            <section key={entryIdx} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)' }}>Week {entry.week}</span>
                {entries.length > 1 && (
                  <button className="btn btn-ghost btn-icon" onClick={() => removeWeek(entryIdx)} style={{ color: 'var(--danger)', fontSize: 12 }}>Remove</button>
                )}
              </div>

              {entry.products.map((prod, prodIdx) => (
                <div key={prodIdx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input
                    value={prod.product}
                    onChange={(e) => updateProduct(entryIdx, prodIdx, { product: e.target.value })}
                    placeholder="Product name"
                    style={{ ...inputStyle(), flex: 1 }}
                  />
                  <input
                    type="number"
                    value={prod.amount || ''}
                    onChange={(e) => updateProduct(entryIdx, prodIdx, { amount: parseFloat(e.target.value) || 0 })}
                    placeholder="Amt"
                    style={{ ...inputStyle(), width: 60 }}
                  />
                  <select
                    value={prod.unit}
                    onChange={(e) => updateProduct(entryIdx, prodIdx, { unit: e.target.value as ProductDose['unit'] })}
                    style={{ ...inputStyle(), width: 55 }}
                  >
                    {UNITS.map((u) => (<option key={u} value={u}>{u}</option>))}
                  </select>
                  <button
                    onClick={() => updateProduct(entryIdx, prodIdx, { perGallon: !prod.perGallon })}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: prod.perGallon ? 'var(--accent-soft)' : 'var(--surface-raised)',
                      color: prod.perGallon ? 'var(--accent)' : 'var(--text-dim)',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    /gal
                  </button>
                  {entry.products.length > 1 && (
                    <button className="btn btn-ghost btn-icon" onClick={() => removeProduct(entryIdx, prodIdx)} style={{ color: 'var(--danger)', fontSize: 12 }}>✕</button>
                  )}
                </div>
              ))}

              <button className="btn btn-ghost" onClick={() => addProduct(entryIdx)} style={{ fontSize: 12, marginTop: 4 }}>+ Add Product</button>

              <div style={{ marginTop: 10 }}>{label('Note')}</div>
              <input
                value={entry.note || ''}
                onChange={(e) => updateNote(entryIdx, e.target.value)}
                placeholder="Optional note for this week"
                style={inputStyle()}
              />
            </section>
          ))}

          <button className="btn btn-primary" onClick={addWeek} style={{ width: '100%' }}>+ Add Week</button>
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
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--surface-raised)',
    color: 'var(--text-bright)',
    fontSize: 14,
    outline: 'none',
  };
}
