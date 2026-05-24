// ===== LOCALSTORAGE DATA SERVICE =====
import type { Grow, Plant, FeedLog, Environment, PlantPhoto, NutrientSchedule, EnvironmentSettings } from '../types';
import { mockGrow } from './mockData';

const STORAGE_KEY = 'grow-genie-data';

// --- read / write ---

function load(): Grow {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Grow;
  } catch { /* ignore */ }
  return seed();
}

function seed(): Grow {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockGrow));
  return { ...mockGrow };
}

function save(data: Grow) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// --- helpers ---

let cache: Grow | null = null;

export function getGrow(): Grow {
  if (!cache) cache = load();
  return cache;
}

function mutate(fn: (d: Grow) => void) {
  const d = getGrow();
  fn(d);
  cache = d;
  save(d);
}

function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// --- plants ---

export function addPlant(
  name: string,
  strain: string,
  breeder: string,
  environmentId: string,
  stage: Plant['stage'],
  startedAt: string,
  heroPhotoBase64?: string,
  notes = ''
): Plant {
  const plant: Plant = {
    id: uid('plant'),
    name,
    strain,
    breeder,
    environmentId,
    stage,
    day: 0,
    week: 0,
    startedAt,
    heroPhotoUrl: heroPhotoBase64,
    photos: heroPhotoBase64
      ? [{
          id: uid('photo'),
          url: heroPhotoBase64,
          date: startedAt,
          caption: 'Plant photo',
          isHero: true,
        }]
      : [],
    notes,
    archived: false,
  };
  recalcDayWeek(plant);
  mutate((d) => d.plants.push(plant));
  return plant;
}

export function updatePlant(
  id: string,
  patch: Partial<Pick<Plant, 'name' | 'strain' | 'breeder' | 'environmentId' | 'scheduleId' | 'stage' | 'notes' | 'archived'>>
) {
  mutate((d) => {
    const p = d.plants.find((x) => x.id === id);
    if (!p) return;
    Object.assign(p, patch);
    recalcDayWeek(p);
  });
}

export function updateEnvironmentSettings(id: string, settings: EnvironmentSettings) {
  mutate((d) => {
    const e = d.environments.find((x) => x.id === id);
    if (!e) return;
    e.settings = { ...(e.settings ?? {}), ...settings };
  });
}

export function deletePlant(id: string) {
  mutate((d) => {
    d.plants = d.plants.filter((p) => p.id !== id);
    d.logs = d.logs.filter((l) => l.plantId !== id);
  });
}

// --- built-in nutrient schedules ---

export const BUILT_IN_SCHEDULES: NutrientSchedule[] = [
  {
    id: 'sched-an-veg',
    name: 'Advanced Nutrients — Vegetative',
    targetStage: 'vegetative',
    brand: 'Advanced Nutrients',
    entries: [
      { week: 1, products: [{ product: 'Voodoo Juice', amount: 2, unit: 'ml', perGallon: true }], note: 'Root stimulator, full strength' },
      { week: 2, products: [{ product: 'Grow A+B', amount: 4, unit: 'ml', perGallon: true }], note: 'Base nutrients at 50% strength' },
      { week: 3, products: [{ product: 'Grow A+B', amount: 4, unit: 'ml', perGallon: true }, { product: 'B-52', amount: 2, unit: 'ml', perGallon: true }], note: 'B vitamins for stress resistance' },
      { week: 4, products: [{ product: 'Grow A+B', amount: 4, unit: 'ml', perGallon: true }, { product: 'Voodoo Juice', amount: 2, unit: 'ml', perGallon: true }], note: 'Full grow strength, root health' },
    ],
  },
  {
    id: 'sched-an-flower',
    name: 'Advanced Nutrients — Flowering',
    targetStage: 'flowering',
    brand: 'Advanced Nutrients',
    entries: [
      { week: 1, products: [{ product: 'Bloom A+B', amount: 4, unit: 'ml', perGallon: true }, { product: 'Big Bud', amount: 2, unit: 'ml', perGallon: true }], note: 'Transition to bloom, pistils forming' },
      { week: 2, products: [{ product: 'Bloom A+B', amount: 4, unit: 'ml', perGallon: true }, { product: 'Big Bud', amount: 4, unit: 'ml', perGallon: true }], note: 'Buds swelling, increase P/K' },
      { week: 3, products: [{ product: 'Bloom A+B', amount: 4, unit: 'ml', perGallon: true }, { product: 'Big Bud', amount: 4, unit: 'ml', perGallon: true }, { product: 'Overdrive', amount: 2, unit: 'ml', perGallon: true }], note: 'Heavy bloom phase' },
      { week: 4, products: [{ product: 'Bloom A+B', amount: 4, unit: 'ml', perGallon: true }, { product: 'Overdrive', amount: 4, unit: 'ml', perGallon: true }], note: 'Late bloom, ripening' },
      { week: 5, products: [{ product: 'Bloom A+B', amount: 2, unit: 'ml', perGallon: true }], note: 'Taper down, prepare for flush' },
    ],
  },
  {
    id: 'sched-gh-veg',
    name: 'General Hydroponics — Vegetative',
    targetStage: 'vegetative',
    brand: 'General Hydroponics',
    entries: [
      { week: 1, products: [{ product: 'FloraGro', amount: 3, unit: 'ml', perGallon: true }, { product: 'FloraMicro', amount: 2, unit: 'ml', perGallon: true }], note: 'Light veg start' },
      { week: 2, products: [{ product: 'FloraGro', amount: 3, unit: 'ml', perGallon: true }, { product: 'FloraMicro', amount: 2, unit: 'ml', perGallon: true }, { product: 'CaliMagic', amount: 2, unit: 'ml', perGallon: true }], note: 'Add Cal-Mag' },
      { week: 3, products: [{ product: 'FloraGro', amount: 5, unit: 'ml', perGallon: true }, { product: 'FloraMicro', amount: 3, unit: 'ml', perGallon: true }, { product: 'CaliMagic', amount: 2, unit: 'ml', perGallon: true }], note: 'Full veg strength' },
    ],
  },
  {
    id: 'sched-gh-flower',
    name: 'General Hydroponics — Flowering',
    targetStage: 'flowering',
    brand: 'General Hydroponics',
    entries: [
      { week: 1, products: [{ product: 'FloraBloom', amount: 3, unit: 'ml', perGallon: true }, { product: 'FloraMicro', amount: 2, unit: 'ml', perGallon: true }], note: 'Switch to bloom, reduce nitrogen' },
      { week: 2, products: [{ product: 'FloraBloom', amount: 4, unit: 'ml', perGallon: true }, { product: 'FloraMicro', amount: 2, unit: 'ml', perGallon: true }, { product: 'CaliMagic', amount: 2, unit: 'ml', perGallon: true }], note: 'Increase phosphorus' },
      { week: 3, products: [{ product: 'FloraBloom', amount: 5, unit: 'ml', perGallon: true }, { product: 'FloraMicro', amount: 3, unit: 'ml', perGallon: true }, { product: 'Liquid KoolBloom', amount: 2, unit: 'ml', perGallon: true }], note: 'Add bloom booster' },
      { week: 4, products: [{ product: 'FloraBloom', amount: 5, unit: 'ml', perGallon: true }, { product: 'Liquid KoolBloom', amount: 3, unit: 'ml', perGallon: true }], note: 'Late bloom push' },
      { week: 5, products: [{ product: 'FloraBloom', amount: 2, unit: 'ml', perGallon: true }], note: 'Taper down pre-flush' },
    ],
  },
  {
    id: 'sched-ff-veg',
    name: 'Fox Farm — Vegetative',
    targetStage: 'vegetative',
    brand: 'Fox Farm',
    entries: [
      { week: 1, products: [{ product: 'Grow Big', amount: 1, unit: 'tsp', perGallon: true }], note: '1/4 strength seedling week' },
      { week: 2, products: [{ product: 'Grow Big', amount: 2, unit: 'tsp', perGallon: true }, { product: 'Big Bloom', amount: 2, unit: 'tsp', perGallon: true }], note: '1/2 strength' },
      { week: 3, products: [{ product: 'Grow Big', amount: 3, unit: 'tsp', perGallon: true }, { product: 'Big Bloom', amount: 2, unit: 'tsp', perGallon: true }], note: 'Full grow strength' },
    ],
  },
  {
    id: 'sched-ff-flower',
    name: 'Fox Farm — Flowering',
    targetStage: 'flowering',
    brand: 'Fox Farm',
    entries: [
      { week: 1, products: [{ product: 'Tiger Bloom', amount: 2, unit: 'tsp', perGallon: true }, { product: 'Big Bloom', amount: 2, unit: 'tsp', perGallon: true }], note: 'Switch to Tiger Bloom' },
      { week: 2, products: [{ product: 'Tiger Bloom', amount: 3, unit: 'tsp', perGallon: true }, { product: 'Big Bloom', amount: 2, unit: 'tsp', perGallon: true }], note: 'Increase bloom' },
      { week: 3, products: [{ product: 'Tiger Bloom', amount: 3, unit: 'tsp', perGallon: true }, { product: 'Big Bloom', amount: 3, unit: 'tsp', perGallon: true }], note: 'Full flower strength' },
      { week: 4, products: [{ product: 'Tiger Bloom', amount: 2, unit: 'tsp', perGallon: true }], note: 'Taper down' },
    ],
  },
];

const SCHEDULES_KEY = 'grow-genie-schedules';

export function getSchedules(): NutrientSchedule[] {
  try {
    const raw = localStorage.getItem(SCHEDULES_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as NutrientSchedule[];
      return [...BUILT_IN_SCHEDULES, ...saved];
    }
  } catch { /* ignore */ }
  return [...BUILT_IN_SCHEDULES];
}

export function saveCustomSchedule(schedule: NutrientSchedule) {
  const all = getSchedules();
  const builtInIds = new Set(BUILT_IN_SCHEDULES.map((s) => s.id));
  const customs = all.filter((s) => !builtInIds.has(s.id));
  const idx = customs.findIndex((s) => s.id === schedule.id);
  if (idx >= 0) customs[idx] = schedule;
  else customs.push(schedule);
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(customs));
}

export function deleteCustomSchedule(id: string) {
  const all = getSchedules();
  const builtInIds = new Set(BUILT_IN_SCHEDULES.map((s) => s.id));
  const customs = all.filter((s) => !builtInIds.has(s.id) && s.id !== id);
  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(customs));
}

export function applyScheduleToLog(plantId: string, scheduleId: string, week: number): boolean {
  const schedules = getSchedules();
  const schedule = schedules.find((s) => s.id === scheduleId);
  if (!schedule) return false;
  const entry = schedule.entries.find((e) => e.week === week);
  if (!entry) return false;

  const log: FeedLog = {
    id: uid('log'),
    plantId,
    type: 'nutrients',
    date: new Date().toISOString().split('T')[0],
    products: entry.products,
    ph: undefined,
    ec: undefined,
    ppm: undefined,
    waterAmount: undefined,
    runOff: undefined,
    temperature: undefined,
    humidity: undefined,
    note: entry.note ?? `Applied from ${schedule.name}`,
    images: [],
  };
  mutate((d) => d.logs.push(log));
  return true;
}

// --- environments ---

export function addEnvironment(name: string, type: Environment['type']): Environment {
  const env: Environment = { id: uid('env'), name, type };
  mutate((d) => d.environments.push(env));
  return env;
}

export function updateEnvironment(id: string, patch: Partial<Pick<Environment, 'name' | 'type'>>) {
  mutate((d) => {
    const e = d.environments.find((x) => x.id === id);
    if (!e) return;
    Object.assign(e, patch);
  });
}

export function deleteEnvironment(id: string, reassignToId?: string) {
  mutate((d) => {
    d.environments = d.environments.filter((e) => e.id !== id);
    // Reassign plants to another environment or mark orphaned
    for (const p of d.plants) {
      if (p.environmentId === id) {
        p.environmentId = reassignToId ?? d.environments[0]?.id ?? id;
      }
    }
  });
}

// --- logs ---

export function addLog(
  plantId: string,
  type: FeedLog['type'],
  opts: Partial<Pick<FeedLog, 'products' | 'ph' | 'ec' | 'ppm' | 'waterAmount' | 'runOff' | 'temperature' | 'humidity' | 'note' | 'images'>> = {}
): FeedLog {
  const log: FeedLog = {
    id: uid('log'),
    plantId,
    type,
    date: new Date().toISOString().split('T')[0],
    products: opts.products ?? [],
    ph: opts.ph,
    ec: opts.ec,
    ppm: opts.ppm,
    waterAmount: opts.waterAmount,
    runOff: opts.runOff,
    temperature: opts.temperature,
    humidity: opts.humidity,
    note: opts.note ?? '',
    images: opts.images ?? [],
  };
  mutate((d) => d.logs.push(log));
  return log;
}

export function deleteLog(id: string) {
  mutate((d) => {
    d.logs = d.logs.filter((l) => l.id !== id);
  });
}

// --- photos ---

export function addPhoto(plantId: string, base64: string, caption?: string): PlantPhoto {
  const photo: PlantPhoto = {
    id: uid('photo'),
    url: base64,
    date: new Date().toISOString().split('T')[0],
    caption,
    isHero: false,
  };
  mutate((d) => {
    const p = d.plants.find((x) => x.id === plantId);
    if (p) p.photos.push(photo);
  });
  return photo;
}

export function setHeroPhoto(plantId: string, photoId: string) {
  mutate((d) => {
    const p = d.plants.find((x) => x.id === plantId);
    if (!p) return;
    p.photos.forEach((ph) => (ph.isHero = ph.id === photoId));
    const hero = p.photos.find((ph) => ph.id === photoId);
    if (hero) p.heroPhotoUrl = hero.url;
  });
}

// --- utils ---

function recalcDayWeek(plant: Plant) {
  const start = new Date(plant.startedAt);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / 86400000);
  plant.day = Math.max(0, diff);
  plant.week = Math.floor(plant.day / 7) + 1;
}

// Recalc all plants periodically
export function recalcAll() {
  mutate((d) => {
    for (const p of d.plants) recalcDayWeek(p);
  });
}

// Reset to mock data (debug)
export function resetToMock() {
  cache = seed();
}

// --- reminder engine ---

export interface Reminder {
  type: 'schedule' | 'action' | 'general';
  plantId: string;
  plantName: string;
  message: string;
  dueWeek: number;
  severity: 'due-today' | 'this-week' | 'upcoming';
}

export function getReminders(): Reminder[] {
  const grow = getGrow();
  const out: Reminder[] = [];

  for (const p of grow.plants) {
    if (p.archived) continue;

    // 1. Scheduled nutrient applications
    if (p.scheduleId) {
      const sched = getSchedules().find((s) => s.id === p.scheduleId);
      if (sched) {
        for (const entry of sched.entries) {
          if (entry.week === p.week) {
            // Check if already applied this week
            const appliedThisWeek = grow.logs.some(
              (l) =>
                l.plantId === p.id &&
                l.type === 'nutrients' &&
                l.date >= new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0]
            );
            if (!appliedThisWeek) {
              out.push({
                type: 'schedule',
                plantId: p.id,
                plantName: p.name,
                message: `${sched.name}: Week ${entry.week} — ${entry.products.map((pr) => pr.product).join(', ')}`,
                dueWeek: entry.week,
                severity: 'due-today',
              });
            }
          } else if (entry.week === p.week + 1) {
            out.push({
              type: 'schedule',
              plantId: p.id,
              plantName: p.name,
              message: `${sched.name}: Week ${entry.week} coming up — ${entry.products.map((pr) => pr.product).join(', ')}`,
              dueWeek: entry.week,
              severity: 'this-week',
            });
          }
        }
      }
    }

    // 2. Watering reminder (if no water log in last 3 days)
    const lastWater = grow.logs
      .filter((l) => l.plantId === p.id && l.type === 'water')
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    const daysSinceWater = lastWater
      ? Math.floor((Date.now() - new Date(lastWater.date).getTime()) / 86400000)
      : 999;
    if (daysSinceWater >= 3) {
      out.push({
        type: 'action',
        plantId: p.id,
        plantName: p.name,
        message: daysSinceWater >= 5 ? `Needs water urgently — ${daysSinceWater} days dry` : `Time to water — ${daysSinceWater} days since last watering`,
        dueWeek: p.week,
        severity: daysSinceWater >= 5 ? 'due-today' : 'this-week',
      });
    }
  }

  return out.sort((a, b) => {
    const sevOrder = { 'due-today': 0, 'this-week': 1, upcoming: 2 };
    return sevOrder[a.severity] - sevOrder[b.severity];
  });
}
